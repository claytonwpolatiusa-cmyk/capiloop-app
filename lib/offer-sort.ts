import type { Offer } from "@/lib/capiloop-data";

export type OfferSort = "distance" | "pickup" | "price";

export function distanceInKm(distance: string): number {
  const match = distance.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*km/i);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export function pickupStartInMinutes(window: string): number {
  const match = window.match(/(\d{1,2})h(?:(\d{2}))?/i);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[1]) * 60 + Number(match[2] ?? 0);
}

export function sortOffers(offers: Offer[], sort: OfferSort): Offer[] {
  return [...offers].sort((first, second) => {
    const firstValue = sort === "distance" ? distanceInKm(first.distance) : sort === "pickup" ? pickupStartInMinutes(first.pickupWindow) : first.price;
    const secondValue = sort === "distance" ? distanceInKm(second.distance) : sort === "pickup" ? pickupStartInMinutes(second.pickupWindow) : second.price;
    return firstValue - secondValue || first.store.localeCompare(second.store, "pt-BR");
  });
}
