import { describe, expect, it } from "vitest";

import { distanceInKm, pickupStartInMinutes, sortOffers } from "../lib/offer-sort";
import type { Offer } from "../lib/capiloop-data";

const offersForSort: Offer[] = [
  { id: "late", store: "Zeta", subtitle: "", category: "Café", price: 1, originalPrice: 2, distance: "1,4 km", pickupWindow: "19h–20h", address: "", stockLabel: "", expected: "", image: 0 as never, accent: "", co2Kg: 0 },
  { id: "near", store: "Beta", subtitle: "", category: "Padaria", price: 1, originalPrice: 2, distance: "0,8 km", pickupWindow: "18h–19h", address: "", stockLabel: "", expected: "", image: 0 as never, accent: "", co2Kg: 0 },
  { id: "early", store: "Alfa", subtitle: "", category: "Mercado", price: 1, originalPrice: 2, distance: "1,1 km", pickupWindow: "17h30–18h30", address: "", stockLabel: "", expected: "", image: 0 as never, accent: "", co2Kg: 0 },
];

describe("ordenacao de ofertas", () => {
  it("normaliza distancia brasileira para quilometros", () => {
    expect(distanceInKm("1,4 km")).toBe(1.4);
    expect(distanceInKm("indisponível")).toBe(Number.POSITIVE_INFINITY);
  });

  it("extrai o primeiro horario da janela de retirada", () => {
    expect(pickupStartInMinutes("17h30–18h30")).toBe(1050);
    expect(pickupStartInMinutes("19h–20h")).toBe(1140);
  });

  it("ordena por distancia e por proximo horario", () => {
    expect(sortOffers(offersForSort, "distance").map((offer) => offer.id)).toEqual(["near", "early", "late"]);
    expect(sortOffers(offersForSort, "pickup").map((offer) => offer.id)).toEqual(["early", "near", "late"]);
  });
});
