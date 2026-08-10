import { describe, expect, it } from "vitest";

import { applyOfferImpact } from "../lib/capiloop-domain";

describe("applyOfferImpact", () => {
  it("incrementa as sacolas, o CO₂ evitado e a economia com precisão monetária", () => {
    const result = applyOfferImpact(
      { savedBags: 4, co2Kg: 10.4, savings: 126.2 },
      { originalPrice: 45, price: 14.9, co2Kg: 2.6 },
    );

    expect(result).toEqual({ savedBags: 5, co2Kg: 13, savings: 156.3 });
  });

  it("arredonda a métrica de impacto a uma casa decimal", () => {
    const result = applyOfferImpact(
      { savedBags: 0, co2Kg: 0.2, savings: 0 },
      { originalPrice: 20, price: 8.95, co2Kg: 0.16 },
    );

    expect(result.co2Kg).toBe(0.4);
    expect(result.savings).toBe(11.05);
  });
});
