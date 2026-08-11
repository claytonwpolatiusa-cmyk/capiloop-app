import { timingSafeEqual } from "node:crypto";
import { Router, type Express, type NextFunction, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { partnerSessions, partners } from "../drizzle/schema";
import { getDb } from "./db";

const partnerStatusSchema = z.enum(["pending", "approved", "rejected", "suspended"]);
const decisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(1000).optional(),
});

function hasValidAdminToken(candidate: string | undefined) {
  const configured = process.env.CAPI_LOOP_ADMIN_TOKEN;
  if (!configured || !candidate) return false;
  const expected = Buffer.from(configured);
  const received = Buffer.from(candidate);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.header("x-capiloop-admin-token");
  if (!process.env.CAPI_LOOP_ADMIN_TOKEN) {
    res.status(503).json({ message: "A aprovação manual ainda não está configurada." });
    return;
  }
  if (!hasValidAdminToken(token)) {
    res.status(401).json({ message: "Token administrativo inválido." });
    return;
  }
  next();
}

function toAdminPartner(partner: typeof partners.$inferSelect) {
  return {
    id: partner.id,
    businessName: partner.businessName,
    cnpj: partner.cnpj,
    cnpjStatus: partner.cnpjStatus,
    category: partner.category,
    address: partner.address,
    phone: partner.phone,
    email: partner.email,
    status: partner.status,
    createdAt: partner.createdAt,
    reviewedAt: partner.reviewedAt,
    reviewedBy: partner.reviewedBy,
    reviewNote: partner.reviewNote,
  };
}

/**
 * Rotas destinadas ao operador da plataforma. A chave administrativa nunca é
 * enviada ao aplicativo do consumidor ou ao portal de parceiros.
 */
export function registerAdminRoutes(app: Express) {
  const router = Router();

  router.get("/health", requireAdmin, (_req, res) => {
    res.json({ ok: true });
  });

  router.get("/partners", requireAdmin, async (req, res) => {
    try {
      const status = req.query.status ? partnerStatusSchema.parse(req.query.status) : "pending";
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível");
      const result = await db.select().from(partners).where(eq(partners.status, status)).orderBy(desc(partners.createdAt));
      res.json({ partners: result.map(toAdminPartner) });
    } catch (error) {
      const message = error instanceof z.ZodError ? "Status de parceiro inválido." : "Não foi possível carregar parceiros.";
      res.status(400).json({ message });
    }
  });

  router.patch("/partners/:partnerId/decision", requireAdmin, async (req, res) => {
    try {
      const partnerId = z.coerce.number().int().positive().parse(req.params.partnerId);
      const input = decisionSchema.parse(req.body);
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível");
      const existing = await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1);
      if (!existing[0]) {
        res.status(404).json({ message: "Parceiro não encontrado." });
        return;
      }

      await db
        .update(partners)
        .set({
          status: input.decision,
          reviewedAt: new Date(),
          reviewedBy: "admin-manual",
          reviewNote: input.note || null,
        })
        .where(eq(partners.id, partnerId));

      if (input.decision === "rejected") {
        await db.delete(partnerSessions).where(eq(partnerSessions.partnerId, partnerId));
      }

      res.json({
        message: input.decision === "approved" ? "Parceiro aprovado para publicar sacolas." : "Parceiro recusado e impedido de operar.",
        status: input.decision,
      });
    } catch (error) {
      const message = error instanceof z.ZodError ? "Dados de aprovação inválidos." : "Não foi possível registrar a decisão.";
      res.status(400).json({ message });
    }
  });

  app.use("/api/admin", router);
}
