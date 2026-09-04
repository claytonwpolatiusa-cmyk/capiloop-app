import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { partners, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { adminProcedure, router } from "../_core/trpc";

const reviewInput = z.object({
  partnerId: z.number().int().positive(),
  status: z.enum(["approved", "rejected", "suspended"]),
  note: z.string().trim().max(1_000).optional(),
});

export const partnerAdminRouter = router({
  list: adminProcedure
    .input(z.object({ status: z.enum(["pending", "approved", "rejected", "suspended"]).optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível.");

      const rows = await db
        .select({
          id: partners.id,
          businessName: partners.businessName,
          cnpj: partners.cnpj,
          category: partners.category,
          address: partners.address,
          phone: partners.phone,
          email: partners.email,
          cnpjStatus: partners.cnpjStatus,
          cnpjVerifiedAt: partners.cnpjVerifiedAt,
          status: partners.status,
          reviewNote: partners.reviewNote,
          reviewNotes: partners.reviewNotes,
          reviewedBy: partners.reviewedBy,
          reviewedAt: partners.reviewedAt,
          createdAt: partners.createdAt,
          ownerName: users.name,
        })
        .from(partners)
        .innerJoin(users, eq(users.id, partners.userId))
        .where(input?.status ? eq(partners.status, input.status) : undefined)
        .orderBy(desc(partners.createdAt));

      return rows;
    }),

  review: adminProcedure
    .input(reviewInput)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível.");

      const [partner] = await db
        .select({ id: partners.id, status: partners.status })
        .from(partners)
        .where(eq(partners.id, input.partnerId));
      if (!partner) throw new Error("Parceiro não encontrado.");

      const note = input.note?.trim() || null;
      const reviewer = ctx.user.email || ctx.user.openId;
      const result = await db
        .update(partners)
        .set({
          status: input.status,
          reviewNote: note,
          reviewNotes: note,
          reviewedBy: reviewer,
          reviewedAt: new Date(),
        })
        .where(and(eq(partners.id, input.partnerId), eq(partners.status, partner.status)));

      if (Number(result[0]?.affectedRows ?? 0) !== 1) {
        throw new Error("A situação deste parceiro mudou. Atualize a lista e tente novamente.");
      }

      return { success: true, partnerId: input.partnerId, status: input.status };
    }),
});

export type PartnerAdminRouter = typeof partnerAdminRouter;
