import type { Offer } from "../lib/capiloop-data";
import { describe, expect, it } from "vitest";
import { filterOffers, formatDistance, getOfferDistanceKm } from "../lib/offer-filters";

const origin = { latitude: -25.4303, longitude: -49.2731 };

const bakery: Offer = {
  id: "bakery", store: "Padaria", subtitle: "Sacola", category: "Padaria", price: 12, originalPrice: 30,
  distance: "", pickupWindow: "08h–09h", pickupStartTime: "08:00", pickupEndTime: "09:00", address: "Centro", stockLabel: "Resta 1", expected: "Pães", image: 0 as never, accent: "#fff", co2Kg: 2, latitude: -25.4303, longitude: -49.2731,
};

const cafe: Offer = {
  ...bakery, id: "cafe", store: "Café", category: "Café", pickupWindow: "18h–19h", pickupStartTime: "18:00", pickupEndTime: "19:00", latitude: -25.4407, longitude: -49.266,
};

describe("filtros de ofertas", () => {
  it("combina categoria e período de retirada", () => {
    const result = filterOffers({ offers: [bakery, cafe], category: "Café", maxDistanceKm: null, time: "evening", origin: null });
    expect(result.map((offer) => offer.id)).toEqual(["cafe"]);
  });

  it("mantém apenas ofertas dentro do raio escolhido", () => {
    const result = filterOffers({ offers: [bakery, cafe], category: null, maxDistanceKm: 1, time: null, origin });
    expect(result.map((offer) => offer.id)).toEqual(["bakery"]);
  });

  it("calcula e formata a distância a partir de coordenadas reais", () => {
    expect(getOfferDistanceKm(bakery, origin)).toBe(0);
    expect(formatDistance(0.82)).toBe("820 m");
    expect(formatDistance(1.2)).toBe("1,2 km");
  });
});
