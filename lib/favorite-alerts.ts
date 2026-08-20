import type { Offer } from "@/lib/capiloop-data";

export type FavoriteAvailabilityAlert = {
  store: string;
  availableBags: number;
};

/** Returns available bags from favorite stores, grouped for the discovery alert. */
export function getFavoriteAvailabilityAlerts(offers: Offer[], favoriteStores: string[], mutedStores: string[] = []): FavoriteAvailabilityAlert[] {
  const favorites = new Set(favoriteStores);
  const muted = new Set(mutedStores);
  const grouped = new Map<string, number>();

  offers.forEach((offer) => {
    if (!favorites.has(offer.store) || muted.has(offer.store) || offer.isAvailable === false) return;
    grouped.set(offer.store, (grouped.get(offer.store) ?? 0) + 1);
  });

  return [...grouped.entries()].map(([store, availableBags]) => ({ store, availableBags }));
}
