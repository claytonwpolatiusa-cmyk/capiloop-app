import { describe, expect, it } from "vitest";

import { resolveCatalogOffers } from "../lib/catalog-utils";

describe("resiliência do catálogo", () => {
  it("exibe ofertas de referência quando não há publicação ao vivo", () => {
    const referenceOffers = [{ id: "pao-do-bosque", source: "reference" }];
    const result = resolveCatalogOffers([], referenceOffers);
    expect(result.isReferenceCatalog).toBe(true);
    expect(result.offers).toHaveLength(1);
    expect(result.offers.every((offer) => offer.source === "reference")).toBe(true);
  });

  it("prioriza as ofertas publicadas por parceiros quando elas existem", () => {
    const liveOffer = { id: "21", source: "live" };
    const result = resolveCatalogOffers([liveOffer], [{ id: "pao-do-bosque", source: "reference" }]);
    expect(result.isReferenceCatalog).toBe(false);
    expect(result.offers).toEqual([liveOffer]);
  });
});
