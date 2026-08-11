import type { Offer, OfferCategory } from "@/lib/capiloop-data";

export type UserCoordinates = { latitude: number; longitude: number };
export type DistanceFilter = 1 | 3 | 5 | null;
export type TimeFilter = "morning" | "afternoon" | "evening" | null;

const earthRadiusKm = 6371;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function pickupHour(offer: Offer) {
  const source = offer.pickupStartTime ?? offer.pickupWindow;
  const match = source.match(/(\d{1,2})(?::|h)/i);
  return match ? Number(match[1]) : null;
}

export function getOfferDistanceKm(offer: Offer, origin: UserCoordinates | null) {
  if (!origin || !Number.isFinite(offer.latitude) || !Number.isFinite(offer.longitude)) return null;
  const latitudeDelta = toRadians((offer.latitude ?? 0) - origin.latitude);
  const longitudeDelta = toRadians((offer.longitude ?? 0) - origin.longitude);
  const latitudeA = toRadians(origin.latitude);
  const latitudeB = toRadians(offer.latitude ?? 0);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(distanceKm: number | null) {
  if (distanceKm === null) return "Distância indisponível";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1).replace(".", ",")} km`;
}

export function filterOffers({
  offers,
  category,
  maxDistanceKm,
  time,
  origin,
}: {
  offers: Offer[];
  category: OfferCategory | null;
  maxDistanceKm: DistanceFilter;
  time: TimeFilter;
  origin: UserCoordinates | null;
}) {
  return offers.filter((offer) => {
    if (category && offer.category !== category) return false;

    if (time) {
      const hour = pickupHour(offer);
      if (hour === null) return false;
      const matchesTime =
        (time === "morning" && hour >= 5 && hour < 12) ||
        (time === "afternoon" && hour >= 12 && hour < 18) ||
        (time === "evening" && hour >= 18 && hour <= 23);
      if (!matchesTime) return false;
    }

    if (maxDistanceKm) {
      const distance = getOfferDistanceKm(offer, origin);
      if (distance === null || distance > maxDistanceKm) return false;
    }

    return true;
  });
}
