import { describe, expect, it } from "vitest";

import type { Offer } from "../lib/capiloop-data";
import { getFavoriteAvailabilityAlerts } from "../lib/favorite-alerts";

const offer = (store: string, isAvailable: boolean) => ({ store, isAvailable }) as Offer;

describe("getFavoriteAvailabilityAlerts", () => {
  it("mostra apenas sacolas disponíveis de estabelecimentos salvos", () => {
    const result = getFavoriteAvailabilityAlerts(
      [
        offer("Favorita", true),
        offer("Favorita", true),
        offer("Esgotada", false),
      ],
      ["Favorita", "Esgotada"],
    );

    expect(result).toEqual([{ store: "Favorita", availableBags: 2 }]);
  });

  it("não cria alerta quando não há lojas salvas com estoque", () => {
    expect(getFavoriteAvailabilityAlerts([offer("Favorita", false)], ["Favorita"])).toEqual([]);
  });

  it("respeita lojas favoritadas que foram silenciadas", () => {
    expect(getFavoriteAvailabilityAlerts([offer("Favorita", true)], ["Favorita"], ["Favorita"])).toEqual([]);
  });
});
