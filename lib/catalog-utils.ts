export function resolveCatalogOffers<T>(liveOffers: T[], referenceOffers: T[]) {
  const isReferenceCatalog = liveOffers.length === 0;
  return { offers: isReferenceCatalog ? referenceOffers : liveOffers, isReferenceCatalog };
}
