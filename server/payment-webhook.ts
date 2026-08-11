import type { Express, Request } from "express";
import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";
import { and, eq, sql } from "drizzle-orm";
import { bags, reservations, transactions } from "../drizzle/schema";
import { getDb } from "./db";
import { getMercadoPagoPayment } from "./_core/mercadopago";

function paymentTransactionStatus(status: string) {
  if (status === "approved") return "completed" as const;
  if (["rejected", "cancelled", "refunded", "charged_back"].includes(status)) return "failed" as const;
  return "pending" as const;
}

function notificationDataId(req: Request) {
  const queryId = req.query["data.id"];
  if (typeof queryId === "string" && queryId) return queryId;
  const bodyId = (req.body as { data?: { id?: unknown } } | undefined)?.data?.id;
  return typeof bodyId === "string" || typeof bodyId === "number" ? String(bodyId) : null;
}

export function registerPaymentWebhook(app: Express) {
  app.post("/api/payments/mercadopago/webhook", async (req, res) => {
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim();
    const dataId = notificationDataId(req);
    const xSignature = req.header("x-signature") ?? "";
    const xRequestId = req.header("x-request-id") ?? "";

    if (!secret) {
      res.status(503).json({ error: "Webhook Mercado Pago não configurado." });
      return;
    }
    if (!dataId || !xSignature || !xRequestId) {
      res.status(400).json({ error: "Notificação incompleta." });
      return;
    }

    try {
      WebhookSignatureValidator.validate({ xSignature, xRequestId, dataId, secret });
    } catch (error) {
      if (error instanceof InvalidWebhookSignatureError) {
        res.status(401).json({ error: "Assinatura do webhook inválida." });
        return;
      }
      console.error("[mercadopago-webhook] Signature validation failed", error);
      res.status(400).json({ error: "Não foi possível validar a notificação." });
      return;
    }

    try {
      const payment = await getMercadoPagoPayment(dataId);
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível");

      const current = await db
        .select({ transactionId: transactions.id, reservationId: transactions.reservationId })
        .from(transactions)
        .where(and(eq(transactions.paymentGateway, "mercadopago"), eq(transactions.paymentGatewayId, payment.id)))
        .limit(1);

      const reservationId = /^capiloop:reservation:(\d+)$/.exec(payment.externalReference ?? "")?.[1];
      const local = current[0] ?? (reservationId
        ? (await db
            .select({ transactionId: transactions.id, reservationId: transactions.reservationId })
            .from(transactions)
            .where(and(eq(transactions.paymentGateway, "mercadopago"), eq(transactions.reservationId, Number(reservationId))))
            .limit(1))[0]
        : undefined);
      if (!local) {
        res.sendStatus(204);
        return;
      }

      const status = paymentTransactionStatus(payment.status);
      await db.update(transactions).set({ status, paymentGatewayId: payment.id }).where(eq(transactions.id, local.transactionId));
      if (status === "completed") {
        await db.update(reservations).set({ status: "confirmed" }).where(eq(reservations.id, local.reservationId));
      } else if (status === "failed") {
        const reservation = await db.select({ bagId: reservations.bagId, status: reservations.status }).from(reservations).where(eq(reservations.id, local.reservationId)).limit(1);
        if (reservation[0] && reservation[0].status !== "cancelled") {
          await db.update(reservations).set({ status: "cancelled" }).where(eq(reservations.id, local.reservationId));
          await db.update(bags).set({ reserved: sql`GREATEST(${bags.reserved} - 1, 0)` }).where(eq(bags.id, reservation[0].bagId));
        }
      }
      res.sendStatus(200);
    } catch (error) {
      console.error("[mercadopago-webhook] Payment reconciliation failed", error);
      res.sendStatus(500);
    }
  });
}
