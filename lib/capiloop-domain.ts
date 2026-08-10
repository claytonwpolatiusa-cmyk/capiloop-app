export type ImpactTotals = {
  savedBags: number;
  co2Kg: number;
  savings: number;
};

export type ReservableOffer = {
  price: number;
  originalPrice: number;
  co2Kg: number;
};

export function applyOfferImpact(impact: ImpactTotals, offer: ReservableOffer): ImpactTotals {
  return {
    savedBags: impact.savedBags + 1,
    co2Kg: Number((impact.co2Kg + offer.co2Kg).toFixed(1)),
    savings: Number((impact.savings + (offer.originalPrice - offer.price)).toFixed(2)),
  };
}
