import { describe, expect, it } from "vitest";

import type { Offer } from "../lib/capiloop-data";
import { getNearbyOffers } from "../lib/nearby-offers";

const offers: Offer[] = [
  { id: "retirada", store: "Longe", subtitle: "", category: "Café", price: 10, originalPrice: 20, distance: "Retirada no local", pickupWindow: "18h–19h", address: "", stockLabel: "", expected: "", image: 0 as never, accent: "", co2Kg: 0 },
  { id: "perto", store: "Perto", subtitle: "", category: "Padaria", price: 12, originalPrice: 24, distance: "0,5 km", pickupWindow: "18h–19h", address: "", stockLabel: "", expected: "", image: 0 as never, accent: "", co2Kg: 0 },
  { id: "medio", store: "Médio", subtitle: "", category: "Mercado", price: 14, originalPrice: 28, distance: "1,2 km", pickupWindow: "18h–19h", address: "", stockLabel: "", expected: "", image: 0 as never, accent: "", co2Kg: 0 },
  { id: "proximo", store: "Próximo", subtitle: "", category: "Restaurante", price: 16, originalPrice: 32, distance: "0,8 km", pickupWindow: "18h–19h", address: "", stockLabel: "", expected: "", image: 0 as never, accent: "", co2Kg: 0 },
];

describe("sacolas próximas", () => {
  it("prioriza as menores distâncias e respeita o limite", () => {
    expect(getNearbyOffers(offers, 2).map((offer) => offer.id)).toEqual(["perto", "proximo"]);
  });

  it("não modifica o catálogo original", () => {
    getNearbyOffers(offers);
    expect(offers.map((offer) => offer.id)).toEqual(["retirada", "perto", "medio", "proximo"]);
  });
});
