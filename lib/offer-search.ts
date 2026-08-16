import type { Offer } from "./capiloop-data";

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function filterOffersByStore(offers: Offer[], query: string): Offer[] {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return offers;
  }

  return offers.filter((offer) => normalizeSearchValue(offer.store).includes(normalizedQuery));
}
