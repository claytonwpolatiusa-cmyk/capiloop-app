import { and, eq, inArray, lte, sql } from "drizzle-orm";

import { bags, reservations } from "../drizzle/schema";
import type { getDb } from "./db";

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;

function pickupEndExpression() {
  return sql`COALESCE(
    ${bags.pickupEndAt},
    STR_TO_DATE(
      CONCAT(COALESCE(${bags.pickupDate}, DATE(${bags.createdAt})), ' ', ${bags.pickupEndTime}),
      '%Y-%m-%d %H:%i'
    )
  )`;
}

export function isPickupExpired(
  bag: Pick<typeof bags.$inferSelect, "pickupDate" | "pickupEndTime" | "pickupEndAt" | "createdAt">,
  now = new Date(),
) {
  if (bag.pickupEndAt) return bag.pickupEndAt.getTime() <= now.getTime();
  const date = bag.pickupDate || bag.createdAt.toISOString().slice(0, 10);
  const normalizedTime = bag.pickupEndTime.length === 5 ? `${bag.pickupEndTime}:00` : bag.pickupEndTime;
  const end = new Date(`${date}T${normalizedTime}-03:00`);
  return !Number.isNaN(end.getTime()) && end.getTime() <= now.getTime();
}

export async function expireStaleBags(db: Database, now = new Date()) {
  const [result] = await db
    .update(bags)
    .set({ status: "expired" })
    .where(
      and(
        inArray(bags.status, ["active", "sold_out"]),
        lte(pickupEndExpression(), now),
      ),
    );
  return Number((result as { affectedRows?: number }).affectedRows ?? 0);
}

/**
 * Pending reservations hold one inventory unit while the customer completes
 * payment. Expired locks are cancelled instead of deleted so the audit trail
 * remains available, and the reserved counter is released conditionally.
 */
export async function releaseExpiredReservationLocks(db: Database, now = new Date()) {
  const stale = await db
    .select({ id: reservations.id, bagId: reservations.bagId })
    .from(reservations)
    .where(and(eq(reservations.status, "pending"), lte(reservations.lockExpiresAt, now)));

  let released = 0;
  for (const reservation of stale) {
    const [cancelled] = await db
      .update(reservations)
      .set({ status: "cancelled" })
      .where(and(eq(reservations.id, reservation.id), eq(reservations.status, "pending")));
    if (Number((cancelled as { affectedRows?: number }).affectedRows ?? 0) !== 1) continue;

    await db
      .update(bags)
      .set({ reserved: sql`GREATEST(${bags.reserved} - 1, 0)` })
      .where(eq(bags.id, reservation.bagId));
    released += 1;
  }

  return released;
}

export async function runBagLifecycleSweep(db: Database, now = new Date()) {
  const expiredBags = await expireStaleBags(db, now);
  const releasedLocks = await releaseExpiredReservationLocks(db, now);
  return { expiredBags, releasedLocks };
}
