import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { bags, partners, reservations, transactions } from "../../drizzle/schema";
import { getDb } from "../db";
import { isPickupExpired } from "../bag-lifecycle";
import { calculateCheckoutSplit } from "../checkout-rules";
import {
  createCheckoutPreference,
  createCardPayment,
  createPixPayment,
  isMercadoPagoConfigured,
  MercadoPagoConfigurationError,
  type MercadoPagoPayment,
} from "../_core/mercadopago";
import { protectedProcedure, router } from "../_core/trpc";

const checkoutInput = z.object({
  bagId: z.number().int().positive(),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/, "Escolha um horário de retirada válido."),
});
const cardInput = checkoutInput.extend({
  cardToken: z.string().min(8).max(512),
  paymentMethodId: z.string().min(2).max(32),
  installments: z.number().int().min(1).max(12).default(1),
  issuerId: z.string().min(1).max(32).optional(),
});

type CreatedReservation = {
  id: number;
  code: string;
  price: number;
  description: string;
  bagId: number;
  totalBagValue: number;
  platformCommissionFee: number;
  restaurantNetValue: number;
  partnerCollectorId: string | null;
};

function transactionStatus(status: string) {
  if (status === "approved") return "completed" as const;
  if (["rejected", "cancelled", "refunded", "charged_back"].includes(status)) return "failed" as const;
  return "pending" as const;
}

function timeToMinutes(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

const DEFAULT_COMMISSION_RATE = 0.15;
const DEFAULT_LOCK_MINUTES = 15;

function checkoutCommissionRate() {
  const configured = Number(process.env.CAPI_LOOP_COMMISSION_RATE ?? DEFAULT_COMMISSION_RATE);
  return Number.isFinite(configured) && configured >= 0 && configured < 1 ? configured : DEFAULT_COMMISSION_RATE;
}

function checkoutLockMinutes() {
  const configured = Number(process.env.CAPI_LOOP_CHECKOUT_LOCK_MINUTES ?? DEFAULT_LOCK_MINUTES);
  return Number.isInteger(configured) && configured >= 2 && configured <= 60 ? configured : DEFAULT_LOCK_MINUTES;
}

async function createReservation(userId: number, bagId: number, pickupTime: string): Promise<CreatedReservation> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });

  const rows = await db
    .select({ bag: bags, partner: partners })
    .from(bags)
    .innerJoin(partners, eq(bags.partnerId, partners.id))
    .where(eq(bags.id, bagId))
    .limit(1);
  const entry = rows[0];
  if (!entry || entry.partner.status !== "approved") {
    throw new TRPCError({ code: "NOT_FOUND", message: "Esta sacola não está disponível." });
  }
  if (isPickupExpired(entry.bag)) {
    await db.update(bags).set({ status: "expired" }).where(and(eq(bags.id, bagId), eq(bags.status, "active")));
    throw new TRPCError({ code: "CONFLICT", message: "O horário de retirada desta sacola já expirou." });
  }
  if (entry.bag.status !== "active") {
    throw new TRPCError({ code: "NOT_FOUND", message: "Esta sacola não está disponível." });
  }

  const pickupStart = timeToMinutes(entry.bag.pickupStartTime);
  const pickupEnd = timeToMinutes(entry.bag.pickupEndTime);
  const selectedPickup = timeToMinutes(pickupTime);
  if (pickupStart === null || pickupEnd === null || selectedPickup === null || selectedPickup < pickupStart || selectedPickup > pickupEnd) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Escolha um horário dentro da janela de retirada da loja." });
  }

  const [locked] = await db
    .update(bags)
    .set({ reserved: sql`${bags.reserved} + 1` })
    .where(and(eq(bags.id, bagId), eq(bags.status, "active"), sql`${bags.reserved} < ${bags.quantity}`));
  if (Number((locked as { affectedRows?: number }).affectedRows ?? 0) !== 1) {
    throw new TRPCError({ code: "CONFLICT", message: "Esta sacola acabou de esgotar." });
  }
  await db.update(bags).set({ status: "sold_out" }).where(and(eq(bags.id, bagId), eq(bags.status, "active"), sql`${bags.reserved} >= ${bags.quantity}`));

  const { totalBagValue, platformCommissionFee, restaurantNetValue } = calculateCheckoutSplit(Number(entry.bag.salePrice), checkoutCommissionRate());
  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + checkoutLockMinutes() * 60_000);
  const code = `CPL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    const inserted = await db.insert(reservations).values({
      userId,
      bagId,
      code,
      status: "pending",
      pickupTime,
      pickupDate: entry.bag.pickupDate ?? now.toISOString().slice(0, 10),
      lockExpiresAt,
    });

    return {
      id: Number(inserted[0].insertId),
      code,
      price: totalBagValue,
      description: `CapiLoop · Sacola ${entry.bag.category} · ${entry.partner.businessName}`,
      bagId,
      totalBagValue,
      platformCommissionFee,
      restaurantNetValue,
      partnerCollectorId: entry.partner.mercadoPagoCollectorId,
    };
  } catch (error) {
    await db.update(bags).set({ reserved: sql`GREATEST(${bags.reserved} - 1, 0)` }).where(eq(bags.id, bagId));
    await db.update(bags).set({ status: "active" }).where(and(eq(bags.id, bagId), eq(bags.status, "sold_out"), sql`${bags.reserved} < ${bags.quantity}`));
    throw error;
  }
}

function splitStatusFor(reservation: CreatedReservation, paymentStatus: string) {
  if (!reservation.partnerCollectorId) return "not_started" as const;
  return paymentStatus === "completed" ? "completed" as const : "pending" as const;
}

async function persistPayment(userId: number, reservation: CreatedReservation, payment: MercadoPagoPayment) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });
  const status = transactionStatus(payment.status);
  await db.insert(transactions).values({
    reservationId: reservation.id,
    userId,
    amount: String(reservation.totalBagValue),
    totalBagValue: String(reservation.totalBagValue),
    platformCommissionFee: String(reservation.platformCommissionFee),
    restaurantNetValue: String(reservation.restaurantNetValue),
    splitStatus: splitStatusFor(reservation, status),
    status,
    paymentGatewayId: payment.id,
    paymentGateway: "mercadopago",
  });
  if (status === "completed") {
    await db.update(reservations).set({ status: "confirmed", confirmedAt: new Date(), lockExpiresAt: null }).where(eq(reservations.id, reservation.id));
  }
}

async function persistCheckoutPreference(userId: number, reservation: CreatedReservation, preferenceId: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível." });
  await db.insert(transactions).values({
    reservationId: reservation.id,
    userId,
    amount: String(reservation.totalBagValue),
    totalBagValue: String(reservation.totalBagValue),
    platformCommissionFee: String(reservation.platformCommissionFee),
    restaurantNetValue: String(reservation.restaurantNetValue),
    splitStatus: reservation.partnerCollectorId ? "pending" : "not_started",
    status: "pending",
    paymentGatewayId: preferenceId,
    paymentGateway: "mercadopago",
  });
}

async function releaseReservation(reservationId: number, bagId: number) {
  const db = await getDb();
  if (!db) return;
  const [cancelled] = await db.update(reservations).set({ status: "cancelled" }).where(and(eq(reservations.id, reservationId), eq(reservations.status, "pending")));
  if (Number((cancelled as { affectedRows?: number }).affectedRows ?? 0) !== 1) return;
  await db.update(bags).set({ reserved: sql`GREATEST(${bags.reserved} - 1, 0)` }).where(eq(bags.id, bagId));
  await db.update(bags).set({ status: "active" }).where(and(eq(bags.id, bagId), eq(bags.status, "sold_out"), sql`${bags.reserved} < ${bags.quantity}`));
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
    const reservation = await createReservation(ctx.user.id, input.bagId, input.pickupTime);
    try {
      const payment = await createPixPayment({
        amount: reservation.totalBagValue,
        description: reservation.description,
        payerEmail: ctx.user.email,
        totalBagValue: reservation.totalBagValue,
        platformCommissionFee: reservation.platformCommissionFee,
        restaurantNetValue: reservation.restaurantNetValue,
        partnerCollectorId: reservation.partnerCollectorId,
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
    const reservation = await createReservation(ctx.user.id, input.bagId, input.pickupTime);
    try {
      const payment = await createCardPayment({
        amount: reservation.totalBagValue,
        description: reservation.description,
        payerEmail: ctx.user.email,
        totalBagValue: reservation.totalBagValue,
        platformCommissionFee: reservation.platformCommissionFee,
        restaurantNetValue: reservation.restaurantNetValue,
        partnerCollectorId: reservation.partnerCollectorId,
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
    const reservation = await createReservation(ctx.user.id, input.bagId, input.pickupTime);
    try {
      const preference = await createCheckoutPreference({
        amount: reservation.totalBagValue,
        description: reservation.description,
        payerEmail: ctx.user.email,
        totalBagValue: reservation.totalBagValue,
        platformCommissionFee: reservation.platformCommissionFee,
        restaurantNetValue: reservation.restaurantNetValue,
        partnerCollectorId: reservation.partnerCollectorId,
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
