import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { bags, partners, reservations, transactions } from "../../drizzle/schema";
import { getDb } from "../db";
import {
  createCheckoutPreference,
  createCardPayment,
  createPixPayment,
  isMercadoPagoConfigured,
  MercadoPagoConfigurationError,
  type MercadoPagoPayment,
} from "../_core/mercadopago";
import { protectedProcedure, router } from "../_core/trpc";

const checkoutInput = z.object({ bagId: z.number().int().positive() });
const cardInput = checkoutInput.extend({
  cardToken: z.string().min(8).max(512),
  paymentMethodId: z.string().min(2).max(32),
  installments: z.number().int().min(1).max(12).default(1),
  issuerId: z.string().min(1).max(32).optional(),
});

type CreatedReservation = { id: number; code: string; price: number; description: string };

function transactionStatus(status: string) {
  if (status === "approved") return "completed" as const;
  if (["rejected", "cancelled", "refunded", "charged_back"].includes(status)) return "failed" as const;
  return "pending" as const;
}

async function createReservation(userId: number, bagId: number): Promise<CreatedReservation> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });

  const rows = await db
    .select({ bag: bags, partner: partners })
    .from(bags)
    .innerJoin(partners, eq(bags.partnerId, partners.id))
    .where(eq(bags.id, bagId))
    .limit(1);
  const entry = rows[0];
  if (!entry || entry.bag.status !== "active" || entry.partner.status !== "approved") {
    throw new TRPCError({ code: "NOT_FOUND", message: "Esta sacola não está disponível." });
  }
  if (entry.bag.reserved >= entry.bag.quantity) {
    throw new TRPCError({ code: "CONFLICT", message: "Esta sacola acabou de esgotar." });
  }

  const code = `CPL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const inserted = await db.insert(reservations).values({
    userId,
    bagId,
    code,
    status: "pending",
    pickupTime: entry.bag.pickupStartTime,
  });
  await db
    .update(bags)
    .set({ reserved: sql`${bags.reserved} + 1` })
    .where(and(eq(bags.id, bagId), eq(bags.status, "active")));

  return {
    id: Number(inserted[0].insertId),
    code,
    price: Number(entry.bag.salePrice),
    description: `CapiLoop · Sacola ${entry.bag.category} · ${entry.partner.businessName}`,
  };
}

async function persistPayment(userId: number, reservation: CreatedReservation, payment: MercadoPagoPayment) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });
  const status = transactionStatus(payment.status);
  await db.insert(transactions).values({
    reservationId: reservation.id,
    userId,
    amount: String(reservation.price),
    status,
    paymentGatewayId: payment.id,
    paymentGateway: "mercadopago",
  });
  if (status === "completed") {
    await db.update(reservations).set({ status: "confirmed" }).where(eq(reservations.id, reservation.id));
  }
}

async function persistCheckoutPreference(userId: number, reservation: CreatedReservation, preferenceId: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });
  await db.insert(transactions).values({
    reservationId: reservation.id,
    userId,
    amount: String(reservation.price),
    status: "pending",
    paymentGatewayId: preferenceId,
    paymentGateway: "mercadopago",
  });
}

async function releaseReservation(reservationId: number, bagId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(reservations).where(eq(reservations.id, reservationId));
  await db.update(bags).set({ reserved: sql`GREATEST(${bags.reserved} - 1, 0)` }).where(eq(bags.id, bagId));
}

function mapGatewayError(error: unknown): never {
  if (error instanceof MercadoPagoConfigurationError) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Os pagamentos estão sendo configurados. Tente novamente em breve." });
  }
  console.error("[checkout] Mercado Pago error", error);
  throw new TRPCError({ code: "BAD_GATEWAY", message: "Não foi possível iniciar este pagamento. Tente novamente." });
}

export const checkoutRouter = router({
  configuration: protectedProcedure.query(() => ({
    pixEnabled: isMercadoPagoConfigured(),
    cardEnabled: isMercadoPagoConfigured() && Boolean(process.env.MERCADO_PAGO_PUBLIC_KEY?.trim()),
  })),

  startPix: protectedProcedure.input(checkoutInput).mutation(async ({ ctx, input }) => {
    if (!ctx.user.email) throw new TRPCError({ code: "BAD_REQUEST", message: "Adicione um e-mail à sua conta para pagar com PIX." });
    const reservation = await createReservation(ctx.user.id, input.bagId);
    try {
      const payment = await createPixPayment({
        amount: reservation.price,
        description: reservation.description,
        payerEmail: ctx.user.email,
        externalReference: `capiloop:reservation:${reservation.id}`,
        idempotencyKey: `capiloop-pix-${reservation.id}`,
      });
      await persistPayment(ctx.user.id, reservation, payment);
      return { reservation, payment };
    } catch (error) {
      await releaseReservation(reservation.id, input.bagId);
      return mapGatewayError(error);
    }
  }),

  startCard: protectedProcedure.input(cardInput).mutation(async ({ ctx, input }) => {
    if (!ctx.user.email) throw new TRPCError({ code: "BAD_REQUEST", message: "Adicione um e-mail à sua conta para pagar com cartão." });
    const reservation = await createReservation(ctx.user.id, input.bagId);
    try {
      const payment = await createCardPayment({
        amount: reservation.price,
        description: reservation.description,
        payerEmail: ctx.user.email,
        externalReference: `capiloop:reservation:${reservation.id}`,
        idempotencyKey: `capiloop-card-${reservation.id}`,
        cardToken: input.cardToken,
        paymentMethodId: input.paymentMethodId,
        installments: input.installments,
        issuerId: input.issuerId,
      });
      await persistPayment(ctx.user.id, reservation, payment);
      return { reservation, payment };
    } catch (error) {
      await releaseReservation(reservation.id, input.bagId);
      return mapGatewayError(error);
    }
  }),

  startCheckoutPro: protectedProcedure.input(checkoutInput).mutation(async ({ ctx, input }) => {
    if (!ctx.user.email) throw new TRPCError({ code: "BAD_REQUEST", message: "Adicione um e-mail à sua conta para pagar." });
    const reservation = await createReservation(ctx.user.id, input.bagId);
    try {
      const preference = await createCheckoutPreference({
        amount: reservation.price,
        description: reservation.description,
        payerEmail: ctx.user.email,
        externalReference: `capiloop:reservation:${reservation.id}`,
        idempotencyKey: `capiloop-checkout-${reservation.id}`,
      });
      await persistCheckoutPreference(ctx.user.id, reservation, preference.id);
      return { reservation, preference };
    } catch (error) {
      await releaseReservation(reservation.id, input.bagId);
      return mapGatewayError(error);
    }
  }),
});
