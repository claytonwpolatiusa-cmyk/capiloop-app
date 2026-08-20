export const MIN_SOLD_BAGS_FOR_RATING = 40;
export const MIN_VERIFIED_RATINGS_FOR_DISPLAY = 12;

export function hasEnoughSalesForPublicStats(soldBags: number) {
  return soldBags >= MIN_SOLD_BAGS_FOR_RATING;
}

export type ReputationHighlightId =
  | "flavor"
  | "generous"
  | "fresh"
  | "variety"
  | "goodValue"
  | "pickup"
  | "packaging"
  | "seasonal"
  | "vegetarian"
  | "impact";

export type EstablishmentReputation = {
  soldBags: number;
  averageRating: number | null;
  verifiedRatings: number;
  highlights: ReputationHighlightId[];
};

export const REPUTATION_HIGHLIGHTS: Record<ReputationHighlightId, string> = {
  flavor: "Sabor é um destaque",
  generous: "Sacolas consideradas generosas",
  fresh: "Boa percepção de frescor",
  variety: "Variedade que surpreende",
  goodValue: "Ótimo custo-benefício",
  pickup: "Retirada costuma ser tranquila",
  packaging: "Itens bem organizados",
  seasonal: "Seleção acompanha a estação",
  vegetarian: "Boas opções sem carne",
  impact: "Impacto positivo recorrente",
};

export function getVisibleReputation(reputation?: EstablishmentReputation) {
  if (!reputation) return null;

  const hasEnoughSales = hasEnoughSalesForPublicStats(reputation.soldBags);
  const hasEnoughRatings = reputation.verifiedRatings >= MIN_VERIFIED_RATINGS_FOR_DISPLAY;
  const hasValidAverage = reputation.averageRating !== null && reputation.averageRating >= 0 && reputation.averageRating <= 5;

  if (!hasEnoughSales || !hasEnoughRatings || !hasValidAverage) {
    return {
      soldBags: reputation.soldBags,
      averageRating: null,
      highlights: [] as ReputationHighlightId[],
      isEstablished: false,
    };
  }

  return {
    soldBags: reputation.soldBags,
    averageRating: reputation.averageRating,
    highlights: reputation.highlights.slice(0, 3),
    isEstablished: true,
  };
}
