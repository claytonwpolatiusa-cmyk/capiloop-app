import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { supportAttachments, supportTickets } from "../../drizzle/schema";
import { getDb } from "../db";
import { storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";

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
});
