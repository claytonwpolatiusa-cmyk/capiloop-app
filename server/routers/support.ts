import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { supportAttachments, supportTicketMessages, supportTicketRatings, supportTickets, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { storagePut } from "../storage";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

const MAX_ATTACHMENTS = 3;
const MAX_BASE64_CHARS = 3_000_000;
const imageAttachmentSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(20).max(MAX_BASE64_CHARS),
});

function createProtocol() {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CAP-${stamp}-${random}`;
}

function fileExtension(mimeType: string) {
  return mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
}

export const supportRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Banco de dados indisponível.");

    return db
      .select({
        id: supportTickets.id,
        protocol: supportTickets.protocol,
        topic: supportTickets.topic,
        subject: supportTickets.subject,
        details: supportTickets.details,
        status: supportTickets.status,
        attachmentCount: supportTickets.attachmentCount,
        hasUnreadSupportReply: supportTickets.hasUnreadSupportReply,
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt,
      })
      .from(supportTickets)
      .where(eq(supportTickets.userId, ctx.user.id))
      .orderBy(desc(supportTickets.updatedAt));
  }),

  create: protectedProcedure
    .input(z.object({
      topic: z.string().min(1).max(64),
      subject: z.string().min(4).max(255),
      details: z.string().max(2_000).optional(),
      attachments: z.array(imageAttachmentSchema).max(MAX_ATTACHMENTS).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível.");

      const protocol = createProtocol();
      const ticketResult = await db.insert(supportTickets).values({
        userId: ctx.user.id,
        protocol,
        topic: input.topic,
        subject: input.subject,
        details: input.details?.trim() || null,
        status: "open",
        attachmentCount: input.attachments.length,
      });
      const ticketId = Number(ticketResult[0].insertId);

      if (input.attachments.length) {
        const attachments = await Promise.all(input.attachments.map(async (attachment, index) => {
          const extension = fileExtension(attachment.mimeType);
          const stored = await storagePut(
            `support/${ctx.user.id}/${protocol}/evidencia-${index + 1}.${extension}`,
            Buffer.from(attachment.base64, "base64"),
            attachment.mimeType,
          );
          return {
            ticketId,
            userId: ctx.user.id,
            fileKey: stored.key,
            url: stored.url,
            fileName: attachment.fileName,
            mimeType: attachment.mimeType,
          };
        }));
        await db.insert(supportAttachments).values(attachments);
      }

      return { id: ticketId, protocol, status: "open" as const };
    }),

  ticket: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível.");

      const [ticket] = await db
        .select({
          id: supportTickets.id,
          protocol: supportTickets.protocol,
          topic: supportTickets.topic,
          subject: supportTickets.subject,
          details: supportTickets.details,
          status: supportTickets.status,
          attachmentCount: supportTickets.attachmentCount,
          hasUnreadSupportReply: supportTickets.hasUnreadSupportReply,
          createdAt: supportTickets.createdAt,
          updatedAt: supportTickets.updatedAt,
        })
        .from(supportTickets)
        .where(and(eq(supportTickets.id, input.id), eq(supportTickets.userId, ctx.user.id)));

      if (!ticket) throw new Error("Chamado não encontrado ou sem permissão de acesso.");

      const [messages, ratings] = await Promise.all([
        db.select({
          id: supportTicketMessages.id,
          sender: supportTicketMessages.sender,
          body: supportTicketMessages.body,
          createdAt: supportTicketMessages.createdAt,
        }).from(supportTicketMessages)
          .where(and(eq(supportTicketMessages.ticketId, input.id), eq(supportTicketMessages.userId, ctx.user.id)))
          .orderBy(asc(supportTicketMessages.createdAt)),
        db.select({ stars: supportTicketRatings.stars, comment: supportTicketRatings.comment, updatedAt: supportTicketRatings.updatedAt })
          .from(supportTicketRatings)
          .where(and(eq(supportTicketRatings.ticketId, input.id), eq(supportTicketRatings.userId, ctx.user.id))),
      ]);

      return { ...ticket, messages, rating: ratings[0] ?? null };
    }),

  addComment: protectedProcedure
    .input(z.object({ ticketId: z.number().int().positive(), body: z.string().trim().min(2).max(1_000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível.");

      const [ticket] = await db.select({ status: supportTickets.status })
        .from(supportTickets)
        .where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.userId, ctx.user.id)));
      if (!ticket) throw new Error("Chamado não encontrado ou sem permissão de acesso.");
      if (ticket.status === "closed") throw new Error("Este chamado já está encerrado e não aceita novas mensagens.");

      await db.insert(supportTicketMessages).values({ ticketId: input.ticketId, userId: ctx.user.id, sender: "customer", body: input.body });
      await db.update(supportTickets).set({ updatedAt: new Date(), status: ticket.status === "resolved" ? "under_review" : ticket.status })
        .where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.userId, ctx.user.id)));
      return { success: true };
    }),

  markSupportRepliesRead: protectedProcedure
    .input(z.object({ ticketId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível.");
      await db.update(supportTickets)
        .set({ hasUnreadSupportReply: 0 })
        .where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.userId, ctx.user.id)));
      return { success: true };
    }),

  markResolved: protectedProcedure
    .input(z.object({ ticketId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível.");

      const [ticket] = await db.select({ status: supportTickets.status }).from(supportTickets)
        .where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.userId, ctx.user.id)));
      if (!ticket) throw new Error("Chamado não encontrado ou sem permissão de acesso.");
      if (ticket.status === "closed") throw new Error("Este chamado já está encerrado.");

      const result = await db.update(supportTickets).set({ status: "resolved", updatedAt: new Date() })
        .where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.userId, ctx.user.id)));
      if (Number(result[0].affectedRows) !== 1) throw new Error("Não foi possível atualizar este chamado.");
      return { status: "resolved" as const };
    }),

  rate: protectedProcedure
    .input(z.object({ ticketId: z.number().int().positive(), stars: z.number().int().min(1).max(5), comment: z.string().trim().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível.");

      const [ticket] = await db.select({ status: supportTickets.status }).from(supportTickets)
        .where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.userId, ctx.user.id)));
      if (!ticket) throw new Error("Chamado não encontrado ou sem permissão de acesso.");
      if (ticket.status !== "resolved" && ticket.status !== "closed") throw new Error("A avaliação fica disponível após a resolução do chamado.");

      const [existing] = await db.select({ id: supportTicketRatings.id }).from(supportTicketRatings)
        .where(and(eq(supportTicketRatings.ticketId, input.ticketId), eq(supportTicketRatings.userId, ctx.user.id)));
      const values = { stars: input.stars, comment: input.comment?.trim() || null, updatedAt: new Date() };
      if (existing) await db.update(supportTicketRatings).set(values).where(eq(supportTicketRatings.id, existing.id));
      else await db.insert(supportTicketRatings).values({ ticketId: input.ticketId, userId: ctx.user.id, ...values });
      return { success: true };
    }),
});

const adminTicketInput = z.object({ ticketId: z.number().int().positive() });
const ticketStatusSchema = z.enum(["open", "under_review", "resolved", "closed"]);

export const supportAdminRouter = router({
  access: protectedProcedure.query(({ ctx }) => ({ allowed: ctx.user.role === "admin" })),

  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Banco de dados indisponível.");
    return db.select({
      id: supportTickets.id,
      protocol: supportTickets.protocol,
      topic: supportTickets.topic,
      subject: supportTickets.subject,
      status: supportTickets.status,
      attachmentCount: supportTickets.attachmentCount,
      createdAt: supportTickets.createdAt,
      updatedAt: supportTickets.updatedAt,
      customerName: users.name,
      customerEmail: users.email,
    }).from(supportTickets).innerJoin(users, eq(users.id, supportTickets.userId)).orderBy(desc(supportTickets.updatedAt));
  }),

  ticket: adminProcedure.input(adminTicketInput).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Banco de dados indisponível.");
    const [ticket] = await db.select({
      id: supportTickets.id,
      userId: supportTickets.userId,
      protocol: supportTickets.protocol,
      topic: supportTickets.topic,
      subject: supportTickets.subject,
      details: supportTickets.details,
      status: supportTickets.status,
      attachmentCount: supportTickets.attachmentCount,
      createdAt: supportTickets.createdAt,
      updatedAt: supportTickets.updatedAt,
      customerName: users.name,
      customerEmail: users.email,
    }).from(supportTickets).innerJoin(users, eq(users.id, supportTickets.userId)).where(eq(supportTickets.id, input.ticketId));
    if (!ticket) throw new Error("Chamado não encontrado.");
    const messages = await db.select({
      id: supportTicketMessages.id,
      sender: supportTicketMessages.sender,
      body: supportTicketMessages.body,
      createdAt: supportTicketMessages.createdAt,
    }).from(supportTicketMessages).where(eq(supportTicketMessages.ticketId, input.ticketId)).orderBy(asc(supportTicketMessages.createdAt));
    return { ...ticket, messages };
  }),

  reply: adminProcedure
    .input(z.object({ ticketId: z.number().int().positive(), body: z.string().trim().min(2).max(1_000), status: ticketStatusSchema.optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível.");
      const [ticket] = await db.select({ userId: supportTickets.userId, status: supportTickets.status }).from(supportTickets).where(eq(supportTickets.id, input.ticketId));
      if (!ticket) throw new Error("Chamado não encontrado.");
      if (ticket.status === "closed") throw new Error("Este chamado está encerrado e não aceita novas respostas.");
      await db.insert(supportTicketMessages).values({ ticketId: input.ticketId, userId: ticket.userId, sender: "support", body: input.body });
      await db.update(supportTickets).set({
        status: input.status ?? (ticket.status === "open" ? "under_review" : ticket.status),
        hasUnreadSupportReply: 1,
        updatedAt: new Date(),
      }).where(eq(supportTickets.id, input.ticketId));
      return { success: true };
    }),

  updateStatus: adminProcedure
    .input(adminTicketInput.extend({ status: ticketStatusSchema }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível.");
      const result = await db.update(supportTickets).set({ status: input.status, updatedAt: new Date() }).where(eq(supportTickets.id, input.ticketId));
      if (Number(result[0].affectedRows) !== 1) throw new Error("Chamado não encontrado.");
      return { success: true };
    }),
});
