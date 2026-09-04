export type CheckoutSplit = {
  totalBagValue: number;
  platformCommissionFee: number;
  restaurantNetValue: number;
};

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateCheckoutSplit(totalBagValue: number, commissionRate: number): CheckoutSplit {
  const total = money(totalBagValue);
  const safeRate = Number.isFinite(commissionRate) && commissionRate >= 0 && commissionRate < 1 ? commissionRate : 0.15;
  const platformCommissionFee = money(total * safeRate);
  return { totalBagValue: total, platformCommissionFee, restaurantNetValue: money(total - platformCommissionFee) };
}

export function canLockBag(input: { status: string; reserved: number; quantity: number; expired: boolean }) {
  return input.status === "active" && !input.expired && input.reserved < input.quantity;
}
