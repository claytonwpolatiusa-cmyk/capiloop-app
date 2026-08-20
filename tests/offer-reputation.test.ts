import { describe, expect, it } from "vitest";

import {
  getVisibleReputation,
  hasEnoughSalesForPublicStats,
  MIN_SOLD_BAGS_FOR_RATING,
  REPUTATION_HIGHLIGHTS,
  type EstablishmentReputation,
} from "../lib/offer-reputation";

const established: EstablishmentReputation = {
  soldBags: 60,
  averageRating: 4.7,
  verifiedRatings: 18,
  highlights: ["flavor", "fresh", "goodValue"],
};

describe("reputação de estabelecimentos", () => {
  it("mostra estrelas apenas após o volume mínimo de vendas e avaliações verificadas", () => {
    expect(getVisibleReputation(established)?.averageRating).toBe(4.7);

    const early = { ...established, soldBags: MIN_SOLD_BAGS_FOR_RATING - 1 };
    expect(getVisibleReputation(early)).toEqual({
      soldBags: MIN_SOLD_BAGS_FOR_RATING - 1,
      averageRating: null,
      highlights: [],
      isEstablished: false,
    });
  });

  it("mantém uma taxonomia de dez destaques padronizados de experiência", () => {
    expect(Object.keys(REPUTATION_HIGHLIGHTS)).toHaveLength(10);
    expect(REPUTATION_HIGHLIGHTS.generous).toContain("generosas");
  });

  it("libera o total de sacolas vendidas ao alcançar 40 vendas", () => {
    expect(hasEnoughSalesForPublicStats(MIN_SOLD_BAGS_FOR_RATING - 1)).toBe(false);
    expect(hasEnoughSalesForPublicStats(MIN_SOLD_BAGS_FOR_RATING)).toBe(true);
  });
});
