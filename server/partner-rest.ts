import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { bags, partners, reservations, transactions, users, type Partner } from "../drizzle/schema";
import { lookupActiveCnpj, CnpjRegistryError } from "./_core/cnpj-registry";
import {
  createPartnerSession,
  getPartnerFromAuthorization,
  hashPartnerPassword,
  normalizePartnerEmail,
  PartnerAuthError,
  revokePartnerSession,
  verifyPartnerPassword,
} from "./_core/partner-auth";
import { getDb } from "./db";
import { getPickupConfirmationError } from "./pickup-confirmation";

type PartnerRequest = Request & { partner?: Partner };

const signupSchema = z.object({
  businessName: z.string().trim().min(2).max(255),
  cnpj: z.string().trim().min(14).max(20),
  category: z.string().trim().min(2).max(64),
  address: z.string().trim().min(8).max(1024),
  phone: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

const createBagSchema = z
  .object({
    category: z.string().trim().min(2).max(64),
    originalPrice: z.coerce.number().positive(),
    salePrice: z.coerce.number().positive(),
    expectedItems: z.string().trim().min(3).max(2000),
    pickupStartTime: z.string().regex(/^\d{2}:\d{2}$/),
    pickupEndTime: z.string().regex(/^\d{2}:\d{2}$/),
    quantity: z.coerce.number().int().min(1).max(500),
    co2Kg: z.coerce.number().positive().max(999),
    imageUrl: z.string().url().max(2048).optional(),
  })
  .refine((input) => input.salePrice < input.originalPrice, {
    message: "O preço CapiLoop deve ser menor que o preço original.",
    path: ["salePrice"],
  });

const pickupCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^CPL-[A-Z0-9-]{4,16}$/, "Informe um código de comprovante CapiLoop válido.");

function toPartnerJson(partner: Partner) {
  return {
    id: partner.id,
    businessName: partner.businessName,
    category: partner.category,
    address: partner.address,
    phone: partner.phone,
    email: partner.email,
    status: partner.status,
    cnpjStatus: partner.cnpjStatus,
  };
}

function requirePartner() {
  return async (req: PartnerRequest, res: Response, next: NextFunction) => {
    try {
      const partner = await getPartnerFromAuthorization(req.header("authorization"));
      if (!partner) {
        res.status(401).json({ message: "Sessão inválida ou expirada. Faça login novamente." });
        return;
      }
      if (partner.status !== "approved") {
        res.status(403).json({ message: "A conta deste parceiro não está habilitada para operar." });
        return;
      }
      req.partner = partner;
      next();
    } catch {
      res.status(500).json({ message: "Não foi possível validar a sessão do parceiro." });
    }
  };
}

function sendRouteError(res: Response, error: unknown) {
  if (error instanceof z.ZodError) {
    res.status(400).json({ message: error.issues[0]?.message ?? "Dados inválidos." });
    return;
  }
  if (error instanceof CnpjRegistryError) {
    const status = error.kind === "unavailable" ? 503 : 400;
    res.status(status).json({ message: error.message, code: error.kind });
    return;
  }
  if (error instanceof PartnerAuthError) {
    res.status(503).json({ message: error.message });
    return;
  }
  console.error("[partner-api]", error);
  res.status(500).json({ message: "Não foi possível concluir a operação. Tente novamente." });
}

export function registerPartnerRoutes(app: Router) {
  const router = Router();

  router.post("/signup", async (req, res) => {
    try {
      const input = signupSchema.parse(req.body);
      const db = await getDb();
      if (!db) throw new PartnerAuthError("Banco de dados indisponível");

      const email = normalizePartnerEmail(input.email);
      const cnpj = await lookupActiveCnpj(input.cnpj);
      const existingCnpj = await db.select({ id: partners.id }).from(partners).where(eq(partners.cnpj, cnpj.cnpj)).limit(1);
      if (existingCnpj[0]) {
        res.status(409).json({ message: "Este CNPJ já possui uma conta parceira no CapiLoop." });
        return;
      }
      const existingEmail = await db.select({ id: partners.id }).from(partners).where(eq(partners.email, email)).limit(1);
      if (existingEmail[0]) {
        res.status(409).json({ message: "Este e-mail já está associado a uma conta parceira." });
        return;
      }

      const openId = `partner:${randomUUID()}`;
      await db.insert(users).values({
        openId,
        name: input.businessName,
        email,
        loginMethod: "partner-password",
        role: "user",
      });
      const account = await db.select({ id: users.id }).from(users).where(eq(users.openId, openId)).limit(1);
      if (!account[0]) throw new PartnerAuthError("Não foi possível criar a conta do parceiro.");

      const passwordHash = await hashPartnerPassword(input.password);
      await db.insert(partners).values({
        userId: account[0].id,
        businessName: input.businessName,
        cnpj: cnpj.cnpj,
        category: input.category,
        address: input.address || cnpj.address,
        phone: input.phone || cnpj.phone,
        email,
        passwordHash,
        cnpjStatus: cnpj.status,
        cnpjVerifiedAt: new Date(),
        status: "approved",
      });

      res.status(201).json({
        message: "Conta criada e CNPJ validado. Você já pode cadastrar sacolas.",
        cnpj: { legalName: cnpj.legalName, tradeName: cnpj.tradeName, status: cnpj.status },
      });
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const input = loginSchema.parse(req.body);
      const db = await getDb();
      if (!db) throw new PartnerAuthError("Banco de dados indisponível");
      const email = normalizePartnerEmail(input.email);
      const partner = await db.select().from(partners).where(eq(partners.email, email)).limit(1);

      if (!partner[0] || !(await verifyPartnerPassword(input.password, partner[0].passwordHash))) {
        res.status(401).json({ message: "E-mail ou senha inválidos." });
        return;
      }
      if (partner[0].status !== "approved") {
        res.status(403).json({ message: "A conta deste parceiro não está habilitada para operar." });
        return;
      }

      const session = await createPartnerSession(partner[0].id);
      await db.update(partners).set({ lastSignedInAt: new Date() }).where(eq(partners.id, partner[0].id));
      res.json({ token: session.token, expiresInSeconds: session.expiresInSeconds, partner: toPartnerJson(partner[0]) });
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  router.post("/logout", requirePartner(), async (req: PartnerRequest, res) => {
    await revokePartnerSession(req.header("authorization"));
    res.status(204).send();
  });

  router.get("/me", requirePartner(), (req: PartnerRequest, res) => {
    res.json({ partner: toPartnerJson(req.partner!) });
  });

  router.get("/bags", requirePartner(), async (req: PartnerRequest, res) => {
    try {
      const db = await getDb();
      if (!db) throw new PartnerAuthError("Banco de dados indisponível");
      const result = await db.select().from(bags).where(eq(bags.partnerId, req.partner!.id)).orderBy(desc(bags.createdAt));
      res.json({ bags: result.map(normalizeBag) });
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  router.post("/bags", requirePartner(), async (req: PartnerRequest, res) => {
    try {
      const input = createBagSchema.parse(req.body);
      const db = await getDb();
      if (!db) throw new PartnerAuthError("Banco de dados indisponível");
      await db.insert(bags).values({
        partnerId: req.partner!.id,
        category: input.category,
        originalPrice: input.originalPrice.toFixed(2),
        salePrice: input.salePrice.toFixed(2),
        expectedItems: input.expectedItems,
        pickupStartTime: input.pickupStartTime,
        pickupEndTime: input.pickupEndTime,
        quantity: input.quantity,
        co2Kg: input.co2Kg.toFixed(2),
        imageUrl: input.imageUrl,
      });
      res.status(201).json({ message: "Sacola publicada com sucesso." });
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  router.put("/bags/:bagId", requirePartner(), async (req: PartnerRequest, res) => {
    try {
      const bagId = z.coerce.number().int().positive().parse(req.params.bagId);
      const input = createBagSchema.parse(req.body);
      const db = await getDb();
      if (!db) throw new PartnerAuthError("Banco de dados indisponível");
      const owned = await db.select().from(bags).where(and(eq(bags.id, bagId), eq(bags.partnerId, req.partner!.id))).limit(1);
      const bag = owned[0];
      if (!bag) {
        res.status(404).json({ message: "Sacola não encontrada." });
        return;
      }
      if (bag.status !== "active") {
        res.status(409).json({ message: "Somente sacolas ativas podem ser editadas." });
        return;
      }
      if (bag.reserved > 0) {
        res.status(409).json({ message: "Esta sacola já possui reservas e não pode mais ser alterada." });
        return;
      }

      await db.update(bags).set({
        category: input.category,
        originalPrice: input.originalPrice.toFixed(2),
        salePrice: input.salePrice.toFixed(2),
        expectedItems: input.expectedItems,
        pickupStartTime: input.pickupStartTime,
        pickupEndTime: input.pickupEndTime,
        quantity: input.quantity,
        co2Kg: input.co2Kg.toFixed(2),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      }).where(eq(bags.id, bagId));
      res.json({ message: "Sacola atualizada com sucesso." });
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  router.delete("/bags/:bagId", requirePartner(), async (req: PartnerRequest, res) => {
    try {
      const bagId = z.coerce.number().int().positive().parse(req.params.bagId);
      const db = await getDb();
      if (!db) throw new PartnerAuthError("Banco de dados indisponível");
      const owned = await db.select().from(bags).where(and(eq(bags.id, bagId), eq(bags.partnerId, req.partner!.id))).limit(1);
      const bag = owned[0];
      if (!bag) {
        res.status(404).json({ message: "Sacola não encontrada." });
        return;
      }
      const linkedReservations = await db
        .select({ id: reservations.id })
        .from(reservations)
        .where(and(eq(reservations.bagId, bag.id), inArray(reservations.status, ["pending", "confirmed", "picked_up"])))
        .limit(1);
      if (linkedReservations[0]) {
        res.status(409).json({ message: "Esta sacola possui reservas em andamento ou concluídas e não pode ser cancelada." });
        return;
      }
      await db.update(bags).set({ status: "cancelled" }).where(eq(bags.id, bagId));
      res.status(204).send();
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  router.post("/reservations/:code/confirm", requirePartner(), async (req: PartnerRequest, res) => {
    try {
      const code = pickupCodeSchema.parse(req.params.code);
      const db = await getDb();
      if (!db) throw new PartnerAuthError("Banco de dados indisponível");

      const found = await db
        .select({ reservation: reservations, bag: bags })
        .from(reservations)
        .innerJoin(bags, eq(reservations.bagId, bags.id))
        .where(and(eq(reservations.code, code), eq(bags.partnerId, req.partner!.id)))
        .limit(1);
      const entry = found[0];

      const completedPayment = entry
        ? await db
        .select({ id: transactions.id })
        .from(transactions)
        .where(and(eq(transactions.reservationId, entry.reservation.id), eq(transactions.status, "completed")))
        .limit(1)
        : [];
      const validationError = getPickupConfirmationError({
        belongsToPartner: Boolean(entry),
        reservationStatus: entry?.reservation.status ?? "pending",
        hasCompletedPayment: Boolean(completedPayment[0]),
      });
      if (validationError) {
        res.status(validationError.status).json({ message: validationError.message });
        return;
      }

      const confirmedAt = new Date();
      const [updateResult] = await db
        .update(reservations)
        .set({ status: "picked_up", pickupDate: confirmedAt.toISOString().slice(0, 10) })
        .where(and(eq(reservations.id, entry.reservation.id), eq(reservations.status, "confirmed")));
      if (Number((updateResult as { affectedRows?: number }).affectedRows ?? 0) !== 1) {
        res.status(409).json({ message: "Esta retirada acabou de ser confirmada em outra operação." });
        return;
      }

      res.json({
        message: "Retirada confirmada com segurança.",
        reservation: {
          code: entry.reservation.code,
          status: "picked_up",
          pickupTime: entry.reservation.pickupTime,
          bagCategory: entry.bag.category,
          confirmedAt: confirmedAt.toISOString(),
        },
      });
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  router.get("/reservations/today", requirePartner(), async (req: PartnerRequest, res) => {
    try {
      const db = await getDb();
      if (!db) throw new PartnerAuthError("Banco de dados indisponível");
      const today = new Date().toISOString().slice(0, 10);
      const rows = await db
        .select({ reservation: reservations, bag: bags, customer: users })
        .from(reservations)
        .innerJoin(bags, eq(reservations.bagId, bags.id))
        .innerJoin(users, eq(reservations.userId, users.id))
        .where(and(eq(bags.partnerId, req.partner!.id), eq(reservations.pickupDate, today)))
        .orderBy(asc(reservations.pickupTime));
      const summary = rows.reduce((totals, { reservation }) => {
        totals.total += 1;
        if (reservation.status === "pending") totals.pending += 1;
        if (reservation.status === "confirmed") totals.confirmed += 1;
        if (reservation.status === "picked_up") totals.pickedUp += 1;
        return totals;
      }, { total: 0, pending: 0, confirmed: 0, pickedUp: 0 });
      res.json({
        date: today,
        summary,
        reservations: rows.map(({ reservation, bag, customer }) => ({
          id: reservation.id,
          code: reservation.code,
          status: reservation.status,
          pickupTime: reservation.pickupTime,
          pickupDate: reservation.pickupDate,
          createdAt: reservation.createdAt,
          customerName: customer.name || "Cliente CapiLoop",
          bag: { id: bag.id, category: bag.category, expectedItems: bag.expectedItems, salePrice: Number(bag.salePrice) },
        })),
      });
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  router.get("/stats", requirePartner(), async (req: PartnerRequest, res) => {
    try {
      const db = await getDb();
      if (!db) throw new PartnerAuthError("Banco de dados indisponível");
      const ownBags = await db.select().from(bags).where(eq(bags.partnerId, req.partner!.id));
      const bagIds = new Set(ownBags.map((bag) => bag.id));
      const allReservations = await db.select().from(reservations);
      const ownReservations = allReservations.filter((reservation) => bagIds.has(reservation.bagId));
      const totalRevenue = ownBags.reduce((total, bag) => total + Number(bag.salePrice) * Math.min(bag.reserved, bag.quantity), 0);
      const co2Saved = ownBags.reduce((total, bag) => total + Number(bag.co2Kg) * bag.reserved, 0);

      res.json({
        totalBags: ownBags.length,
        totalReservations: ownReservations.length,
        totalRevenue,
        co2Saved,
        recentReservations: ownReservations.slice(-5).reverse(),
      });
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.use("/api/partner", router);

  app.get("/api/catalog/bags", async (_req, res) => {
    try {
      const db = await getDb();
      if (!db) throw new PartnerAuthError("Banco de dados indisponível");
      const result = await db
        .select({ bag: bags, partner: partners })
        .from(bags)
        .innerJoin(partners, eq(bags.partnerId, partners.id))
        .where(inArray(bags.status, ["active", "sold_out"]))
        .orderBy(desc(bags.createdAt));
      res.json({
        bags: result
          .filter(({ partner }) => partner.status === "approved")
          .map(({ bag, partner }) => ({ ...normalizeBag(bag), partner: toPartnerJson(partner) })),
      });
    } catch (error) {
      sendRouteError(res, error);
    }
  });
}

function normalizeBag(bag: typeof bags.$inferSelect) {
  return {
    ...bag,
    originalPrice: Number(bag.originalPrice),
    salePrice: Number(bag.salePrice),
    co2Kg: Number(bag.co2Kg),
  };
}
