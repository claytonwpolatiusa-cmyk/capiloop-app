import { describe, expect, it } from "vitest";

import { isPickupExpired } from "../server/bag-lifecycle";
import { calculateCheckoutSplit, canLockBag } from "../server/checkout-rules";
import { PENALTY_BY_REASON } from "../server/routers/disputes";

describe("CapiLoop business rules", () => {
  it("expires a bag at the pickup end boundary", () => {
    const bag = {
      pickupDate: "2026-09-04",
      pickupStartTime: "17:00",
      pickupEndTime: "18:30",
      pickupStartAt: new Date("2026-09-04T20:00:00.000Z"),
      pickupEndAt: new Date("2026-09-04T21:30:00.000Z"),
      createdAt: new Date("2026-09-04T10:00:00.000Z"),
    };
    expect(isPickupExpired(bag, new Date("2026-09-04T21:29:59.000Z"))).toBe(false);
    expect(isPickupExpired(bag, new Date("2026-09-04T21:30:00.000Z"))).toBe(true);
  });

  it("separates the bag value, platform commission and restaurant net value", () => {
    expect(calculateCheckoutSplit(40, 0.15)).toEqual({
      totalBagValue: 40,
      platformCommissionFee: 6,
      restaurantNetValue: 34,
    });
  });

  it("only locks active, non-expired inventory with remaining units", () => {
    expect(canLockBag({ status: "active", reserved: 0, quantity: 1, expired: false })).toBe(true);
    expect(canLockBag({ status: "active", reserved: 1, quantity: 1, expired: false })).toBe(false);
    expect(canLockBag({ status: "expired", reserved: 0, quantity: 1, expired: false })).toBe(false);
    expect(canLockBag({ status: "active", reserved: 0, quantity: 1, expired: true })).toBe(false);
  });

  it("uses a stronger internal penalty for bags that are unavailable", () => {
    expect(PENALTY_BY_REASON.bag_unavailable).toBeGreaterThan(PENALTY_BY_REASON.quality_issue);
    expect(PENALTY_BY_REASON.payment_issue).toBe(0);
  });
});
