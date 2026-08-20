export type PickupUrgency = {
  level: "warning" | "critical" | "expired";
  remainingMinutes: number;
  label: string;
};

/** Produces a calm, actionable pickup warning only close to the selected time. */
export function getPickupUrgency(pickupTime?: string, now = new Date()): PickupUrgency | null {
  if (!pickupTime) return null;
  const match = pickupTime.match(/(\d{1,2})(?::|h)(\d{2})?/i);
  if (!match) return null;

  const pickupAt = new Date(now);
  pickupAt.setHours(Number(match[1]), Number(match[2] ?? 0), 0, 0);
  const remainingMinutes = Math.ceil((pickupAt.getTime() - now.getTime()) / 60_000);

  if (remainingMinutes <= 0) return { level: "expired", remainingMinutes: 0, label: "A janela de retirada encerrou" };
  if (remainingMinutes > 60) return null;
  if (remainingMinutes <= 15) return { level: "critical", remainingMinutes, label: `Retire nos próximos ${remainingMinutes} min` };
  return { level: "warning", remainingMinutes, label: `Faltam ${remainingMinutes} min para retirar` };
}
