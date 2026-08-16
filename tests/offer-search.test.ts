import { describe, expect, it } from "vitest";

import type { Offer } from "../lib/capiloop-data";
import { filterOffersByStore } from "../lib/offer-search";

const offersForSearch: Offer[] = [
  { id: "cafe", store: "Café Amarelo", subtitle: "", category: "Café", price: 10, originalPrice: 20, distance: "1 km", pickupWindow: "17h–18h", address: "", stockLabel: "", expected: "", image: 0 as never, accent: "", co2Kg: 0 },
  { id: "padaria", store: "Pão do Bosque", subtitle: "", category: "Padaria", price: 12, originalPrice: 24, distance: "2 km", pickupWindow: "18h–19h", address: "", stockLabel: "", expected: "", image: 0 as never, accent: "", co2Kg: 0 },
];

describe("busca de estabelecimentos", () => {
  it("encontra por trecho do nome e ignora maiusculas e acentos", () => {
    expect(filterOffersByStore(offersForSearch, "CAFE").map((offer) => offer.id)).toEqual(["cafe"]);
    expect(filterOffersByStore(offersForSearch, "bosque").map((offer) => offer.id)).toEqual(["padaria"]);
  });

  it("retorna todas as ofertas quando a busca estiver vazia", () => {
    expect(filterOffersByStore(offersForSearch, " ")).toHaveLength(2);
  });
});
