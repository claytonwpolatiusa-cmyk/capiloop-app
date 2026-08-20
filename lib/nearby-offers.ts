import type { Offer } from "./capiloop-data";
import { sortOffers } from "./offer-sort";

/**
 * Seleciona uma pequena amostra do catálogo para a camada inicial de descoberta.
 * Mantém a lista original intacta e coloca distâncias não informadas ao final.
 */
export function getNearbyOffers(offers: Offer[], limit = 3): Offer[] {
  return sortOffers(offers, "distance").slice(0, Math.max(0, limit));
}
