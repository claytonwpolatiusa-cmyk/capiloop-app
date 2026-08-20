import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Offer } from "@/lib/capiloop-data";
import { applyOfferImpact, type ImpactTotals } from "@/lib/capiloop-domain";

export type Reservation = {
  id: string;
  offerId: string;
  code: string;
  createdAt: string;
  paymentStatus: "pending" | "confirmed" | "failed";
  pickupTime?: string;
  offerSnapshot?: Pick<Offer, "store" | "subtitle" | "pickupWindow" | "address">;
};

export type Impact = ImpactTotals;

type CapiLoopContextValue = {
  reservations: Reservation[];
  impact: Impact;
  favoriteStores: string[];
  isReady: boolean;
  reserveOffer: (offer: Offer, pickupTime?: string) => Promise<Reservation>;
  recordRemoteReservation: (input: { id: string; offer: Offer; code: string; pickupTime?: string }) => Promise<Reservation>;
  updateRemoteReservationStatus: (id: string, paymentStatus: Reservation["paymentStatus"]) => Promise<void>;
  isFavoriteStore: (store: string) => boolean;
  toggleFavoriteStore: (store: string) => Promise<void>;
};

const STORAGE_KEY = "capiloop-local-state";
const initialImpact: Impact = { savedBags: 4, co2Kg: 10.4, savings: 126.2 };
const CapiLoopContext = createContext<CapiLoopContextValue | null>(null);

function createOfferSnapshot(offer: Offer): Reservation["offerSnapshot"] {
  return { store: offer.store, subtitle: offer.subtitle, pickupWindow: offer.pickupWindow, address: offer.address };
}

export function CapiLoopProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [impact, setImpact] = useState<Impact>(initialImpact);
  const [favoriteStores, setFavoriteStores] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((rawValue) => {
        if (!rawValue) return;
        const parsed = JSON.parse(rawValue) as { reservations?: Reservation[]; impact?: Impact; favoriteStores?: string[] };
        setReservations((parsed.reservations ?? []).map((reservation) => ({ ...reservation, paymentStatus: reservation.paymentStatus ?? "pending" })));
        setImpact(parsed.impact ?? initialImpact);
        setFavoriteStores(parsed.favoriteStores ?? []);
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, []);

  const persist = useCallback(async (nextReservations: Reservation[], nextImpact: Impact, nextFavorites: string[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ reservations: nextReservations, impact: nextImpact, favoriteStores: nextFavorites }));
  }, []);

  /** @deprecated Demo-only compatibility path. Live reservations must use recordRemoteReservation. */
  const reserveOffer = useCallback(async (offer: Offer, pickupTime?: string) => {
    const existing = reservations.find((reservation) => reservation.offerId === offer.id);
    if (existing) return existing;
    const reservation: Reservation = { id: `${offer.id}-${Date.now()}`, offerId: offer.id, code: `CAP-${Math.floor(1000 + Math.random() * 9000)}`, createdAt: new Date().toISOString(), paymentStatus: "confirmed", pickupTime, offerSnapshot: createOfferSnapshot(offer) };
    const nextReservations = [reservation, ...reservations];
    const nextImpact = applyOfferImpact(impact, offer);
    setReservations(nextReservations);
    setImpact(nextImpact);
    await persist(nextReservations, nextImpact, favoriteStores);
    return reservation;
  }, [favoriteStores, impact, persist, reservations]);

  const recordRemoteReservation = useCallback(async ({ id, offer, code, pickupTime }: { id: string; offer: Offer; code: string; pickupTime?: string }) => {
    const existing = reservations.find((reservation) => reservation.id === id);
    if (existing) return existing;
    const reservation: Reservation = { id, offerId: offer.id, code, createdAt: new Date().toISOString(), paymentStatus: "pending", pickupTime, offerSnapshot: createOfferSnapshot(offer) };
    const nextReservations = [reservation, ...reservations];
    setReservations(nextReservations);
    await persist(nextReservations, impact, favoriteStores);
    return reservation;
  }, [favoriteStores, impact, persist, reservations]);

  const updateRemoteReservationStatus = useCallback(async (id: string, paymentStatus: Reservation["paymentStatus"]) => {
    const nextReservations = reservations.map((reservation) => reservation.id === id ? { ...reservation, paymentStatus } : reservation);
    setReservations(nextReservations);
    await persist(nextReservations, impact, favoriteStores);
  }, [favoriteStores, impact, persist, reservations]);

  const isFavoriteStore = useCallback((store: string) => favoriteStores.includes(store), [favoriteStores]);
  const toggleFavoriteStore = useCallback(async (store: string) => {
    const nextFavorites = favoriteStores.includes(store) ? favoriteStores.filter((item) => item !== store) : [...favoriteStores, store];
    setFavoriteStores(nextFavorites);
    await persist(reservations, impact, nextFavorites);
  }, [favoriteStores, impact, persist, reservations]);

  const value = useMemo(
    () => ({ reservations, impact, favoriteStores, isReady, reserveOffer, recordRemoteReservation, updateRemoteReservationStatus, isFavoriteStore, toggleFavoriteStore }),
    [favoriteStores, impact, isFavoriteStore, isReady, recordRemoteReservation, reservations, reserveOffer, toggleFavoriteStore, updateRemoteReservationStatus],
  );

  return <CapiLoopContext.Provider value={value}>{children}</CapiLoopContext.Provider>;
}

export function useCapiLoop() {
  const context = useContext(CapiLoopContext);
  if (!context) throw new Error("useCapiLoop deve ser usado dentro de CapiLoopProvider");
  return context;
}
