import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { partners, bags, reservations, transactions, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const partnerRouter = router({
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      // TODO: Implement proper authentication with password hashing
      // For now, this is a placeholder
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const partner = await db
        .select()
        .from(partners)
        .where(eq(partners.email, input.email))
        .limit(1);

      if (!partner.length) {
        throw new Error("Partner not found");
      }

      return {
        token: "mock-token-" + partner[0].id,
        partnerId: partner[0].id,
      };
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const partnerId = ctx.user?.id;
    if (!partnerId) throw new Error("Unauthorized");

    // Get partner's bags
    const partnerBags = await db
      .select()
      .from(bags)
      .where(eq(bags.partnerId, partnerId));

    // Get reservations for partner's bags
    const partnerReservations = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.bagId, partnerBags[0]?.id || 0),
          ...partnerBags.map((b) => eq(reservations.bagId, b.id))
        )
      );

    // Calculate stats
    const totalReservations = partnerReservations.length;
    const totalRevenue = partnerBags.reduce((sum, bag) => {
      return sum + Number(bag.salePrice) * (partnerReservations.filter((r) => r.bagId === bag.id).length);
    }, 0);
    const co2Saved = partnerBags.reduce((sum, bag) => sum + Number(bag.co2Kg), 0);

    return {
      totalBags: partnerBags.length,
      totalReservations,
      totalRevenue,
      co2Saved,
      recentReservations: partnerReservations.slice(0, 5),
    };
  }),

  bags: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const partnerId = ctx.user?.id;
      if (!partnerId) throw new Error("Unauthorized");

      return await db.select().from(bags).where(eq(bags.partnerId, partnerId));
    }),

    create: protectedProcedure
      .input(
        z.object({
          category: z.string(),
          originalPrice: z.number(),
          salePrice: z.number(),
          expectedItems: z.string(),
          pickupStartTime: z.string(),
          pickupEndTime: z.string(),
          quantity: z.number().default(1),
          co2Kg: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const partnerId = ctx.user?.id;
        if (!partnerId) throw new Error("Unauthorized");

        await db.insert(bags).values({
          partnerId,
          category: input.category,
          originalPrice: input.originalPrice.toString(),
          salePrice: input.salePrice.toString(),
          expectedItems: input.expectedItems,
          pickupStartTime: input.pickupStartTime,
          pickupEndTime: input.pickupEndTime,
          quantity: input.quantity,
          co2Kg: input.co2Kg.toString(),
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ bagId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const partnerId = ctx.user?.id;
        if (!partnerId) throw new Error("Unauthorized");

        await db
          .update(bags)
          .set({ status: "cancelled" })
          .where(and(eq(bags.id, input.bagId), eq(bags.partnerId, partnerId)));

        return { success: true };
      }),
  }),

  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const partnerId = ctx.user?.id;
      if (!partnerId) throw new Error("Unauthorized");

      const partner = await db.select().from(partners).where(eq(partners.id, partnerId)).limit(1);

      if (!partner.length) throw new Error("Partner not found");

      return partner[0];
    }),

    update: protectedProcedure
      .input(
        z.object({
          businessName: z.string(),
          cnpj: z.string().optional(),
          category: z.string(),
          address: z.string(),
          phone: z.string().optional(),
          email: z.string().email(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const partnerId = ctx.user?.id;
        if (!partnerId) throw new Error("Unauthorized");

        await db
          .update(partners)
          .set({
            businessName: input.businessName,
            cnpj: input.cnpj,
            category: input.category,
            address: input.address,
            phone: input.phone,
            email: input.email,
            latitude: input.latitude,
            longitude: input.longitude,
          })
          .where(eq(partners.id, partnerId));

        return { success: true };
      }),
  }),
});
