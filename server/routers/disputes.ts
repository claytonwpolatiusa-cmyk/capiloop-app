import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { bags, partners, reservationDisputes, reservations, transactions } from "../../drizzle/schema";
import { getDb } from "../db";
import { refundMercadoPagoPayment, MercadoPagoConfigurationError } from "../_core/mercadopago";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

const createDisputeInput = z.object({
  reservationId: z.number().int().positive(),
  reason: z.enum(["bag_unavailable", "pickup_issue", "quality_issue", "payment_issue", "other"]),
  details: z.string().trim().max(2_000).optional(),
});

export const PENALTY_BY_REASON = {
  bag_unavailable: 15,
  pickup_issue: 10,
  quality_issue: 5,
  payment_issue: 0,
  other: 5,
} as const;

function disputeError(message: string, code: "BAD_REQUEST" | "NOT_FOUND" | "CONFLICT" = "BAD_REQUEST") {
  return new TRPCError({ code, message });
}

async function applyPartnerPenalty(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, partnerId: number, penalty: number) {
  const current = await db
    .select({ reliabilityScore: partners.reliabilityScore, disputeCount: partners.disputeCount })
    .from(partners)
    .where(eq(partners.id, partnerId))
    .limit(1);
  if (!current[0]) return;

  const nextScore = Math.max(0, Number(current[0].reliabilityScore) - penalty).toFixed(2);
  await db.update(partners).set({
    reliabilityScore: nextScore,
    disputeCount: current[0].disputeCount + 1,
  }).where(eq(partners.id, partnerId));
}

async function processRefund(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  disputeId: number,
  reservationId: number,
  userId: number,
  partnerId: number,
  amount: number,
  penalty: number,
  paymentGatewayId: string,
) {
  const [claimed] = await db
    .update(reservationDisputes)
    .set({ status: "approved", refundStatus: "processing", refundAmount: String(amount), penaltyPoints: penalty })
    .where(and(eq(reservationDisputes.id, disputeId), eq(reservationDisputes.refundStatus, "pending")));
  if (Number((claimed as { affectedRows?: number }).affectedRows ?? 0) !== 1) {
    const current = await db.select().from(reservationDisputes).where(eq(reservationDisputes.id, disputeId)).limit(1);
    return current[0];
  }

  try {
    const refund = await refundMercadoPagoPayment({
      paymentId: paymentGatewayId,
      amount,
      idempotencyKey: `capiloop-dispute-refund-${disputeId}`,
    });
    await db.update(reservationDisputes).set({
      status: "refunded",
      refundStatus: "completed",
      paymentGatewayRefundId: refund.id,
      resolvedAt: new Date(),
    }).where(eq(reservationDisputes.id, disputeId));
    await db.update(transactions).set({ status: "refunded" }).where(and(eq(transactions.reservationId, reservationId), eq(transactions.paymentGatewayId, paymentGatewayId)));
    await db.update(reservations).set({ status: "disputed" }).where(eq(reservations.id, reservationId));
    await applyPartnerPenalty(db, partnerId, penalty);
    return { status: "refunded" as const, refundStatus: "completed" as const, refundAmount: amount };
  } catch (error) {
    await db.update(reservationDisputes).set({ status: "under_review", refundStatus: "failed" }).where(eq(reservationDisputes.id, disputeId));
    if (error instanceof MercadoPagoConfigurationError) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O reembolso automático aguarda a configuração do Mercado Pago." });
    }
    throw new TRPCError({ code: "BAD_GATEWAY", message: "Não foi possível iniciar o reembolso automático. Nossa equipe revisará o chamado." });
  }
}

export const disputesRouter = router({
  create: protectedProcedure.input(createDisputeInput).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });

    const row = await db
      .select({ reservation: reservations, bag: bags, partner: partners })
      .from(reservations)
      .innerJoin(bags, eq(reservations.bagId, bags.id))
      .innerJoin(partners, eq(bags.partnerId, partners.id))
      .where(and(eq(reservations.id, input.reservationId), eq(reservations.userId, ctx.user.id)))
      .limit(1);
    const entry = row[0];
    if (!entry) throw disputeError("Reserva não encontrada.", "NOT_FOUND");
    if (!["confirmed", "picked_up", "disputed"].includes(entry.reservation.status)) {
      throw disputeError("Esta reserva ainda não pode receber uma disputa.", "CONFLICT");
    }

    const existing = await db.select().from(reservationDisputes).where(eq(reservationDisputes.reservationId, input.reservationId)).limit(1);
    if (existing[0]) return existing[0];

    const payment = await db
      .select({ id: transactions.id, amount: transactions.amount, gatewayId: transactions.paymentGatewayId, status: transactions.status })
      .from(transactions)
      .where(and(eq(transactions.reservationId, input.reservationId), eq(transactions.status, "completed")))
      .orderBy(desc(transactions.createdAt))
      .limit(1);
    if (!payment[0] || !payment[0].gatewayId) {
      throw disputeError("Não encontramos um pagamento concluído para iniciar o reembolso.", "CONFLICT");
    }

    const penalty = PENALTY_BY_REASON[input.reason];
    const inserted = await db.insert(reservationDisputes).values({
      reservationId: input.reservationId,
      userId: ctx.user.id,
      reason: input.reason,
      details: input.details?.trim() || null,
      status: "open",
      refundStatus: "pending",
      refundAmount: String(Number(payment[0].amount)),
      penaltyPoints: penalty,
    });
    const disputeId = Number(inserted[0].insertId);
    await db.update(reservations).set({ status: "disputed" }).where(eq(reservations.id, input.reservationId));

    return processRefund(
      db,
      disputeId,
      input.reservationId,
      ctx.user.id,
      entry.partner.id,
      Number(payment[0].amount),
      penalty,
      payment[0].gatewayId,
    );
  }),

  get: protectedProcedure.input(z.object({ reservationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });
    const rows = await db.select({ dispute: reservationDisputes }).from(reservationDisputes).innerJoin(reservations, eq(reservationDisputes.reservationId, reservations.id)).where(and(eq(reservationDisputes.reservationId, input.reservationId), eq(reservations.userId, ctx.user.id))).limit(1);
    return rows[0]?.dispute ?? null;
  }),

  adminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });
    return db.select({ dispute: reservationDisputes, reservation: reservations, bag: bags, partner: partners }).from(reservationDisputes).innerJoin(reservations, eq(reservationDisputes.reservationId, reservations.id)).innerJoin(bags, eq(reservations.bagId, bags.id)).innerJoin(partners, eq(bags.partnerId, partners.id)).orderBy(desc(reservationDisputes.createdAt));
  }),
});
