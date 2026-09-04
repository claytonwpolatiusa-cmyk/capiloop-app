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
  reservationStatus?: "pending" | "confirmed" | "picked_up" | "cancelled" | "disputed";
  disputeStatus?: "open" | "under_review" | "approved" | "rejected" | "refunded";
  refundStatus?: "not_requested" | "pending" | "processing" | "completed" | "failed";
  paymentMethod?: string;
  pickupTime?: string;
  offerSnapshot?: Pick<Offer, "store" | "subtitle" | "pickupWindow" | "address" | "price">;
};

export type Impact = ImpactTotals;

type CapiLoopContextValue = {
  reservations: Reservation[];
  impact: Impact;
  favoriteStores: string[];
  mutedFavoriteStores: string[];
  isReady: boolean;
  reserveOffer: (offer: Offer, pickupTime?: string) => Promise<Reservation>;
  recordRemoteReservation: (input: { id: string; offer: Offer; code: string; pickupTime?: string; paymentMethod?: string }) => Promise<Reservation>;
  updateRemoteReservationStatus: (id: string, paymentStatus: Reservation["paymentStatus"]) => Promise<void>;
  updateReservationDispute: (id: string, disputeStatus: NonNullable<Reservation["disputeStatus"]>, refundStatus?: Reservation["refundStatus"]) => Promise<void>;
  isFavoriteStore: (store: string) => boolean;
  toggleFavoriteStore: (store: string) => Promise<void>;
  isFavoriteAlertEnabled: (store: string) => boolean;
  toggleFavoriteAlert: (store: string) => Promise<void>;
};

const STORAGE_KEY = "capiloop-local-state";
const initialImpact: Impact = { savedBags: 4, co2Kg: 10.4, savings: 126.2 };
const CapiLoopContext = createContext<CapiLoopContextValue | null>(null);

function createOfferSnapshot(offer: Offer): Reservation["offerSnapshot"] {
  return { store: offer.store, subtitle: offer.subtitle, pickupWindow: offer.pickupWindow, address: offer.address, price: offer.price };
}

export function CapiLoopProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [impact, setImpact] = useState<Impact>(initialImpact);
  const [favoriteStores, setFavoriteStores] = useState<string[]>([]);
  const [mutedFavoriteStores, setMutedFavoriteStores] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((rawValue) => {
        if (!rawValue) return;
        const parsed = JSON.parse(rawValue) as { reservations?: Reservation[]; impact?: Impact; favoriteStores?: string[]; mutedFavoriteStores?: string[] };
        setReservations((parsed.reservations ?? []).map((reservation) => ({ ...reservation, paymentStatus: reservation.paymentStatus ?? "pending" })));
        setImpact(parsed.impact ?? initialImpact);
        setFavoriteStores(parsed.favoriteStores ?? []);
        setMutedFavoriteStores(parsed.mutedFavoriteStores ?? []);
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, []);

  const persist = useCallback(async (nextReservations: Reservation[], nextImpact: Impact, nextFavorites: string[], nextMutedFavorites: string[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ reservations: nextReservations, impact: nextImpact, favoriteStores: nextFavorites, mutedFavoriteStores: nextMutedFavorites }));
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
    await persist(nextReservations, nextImpact, favoriteStores, mutedFavoriteStores);
    return reservation;
  }, [favoriteStores, impact, mutedFavoriteStores, persist, reservations]);

  const recordRemoteReservation = useCallback(async ({ id, offer, code, pickupTime, paymentMethod }: { id: string; offer: Offer; code: string; pickupTime?: string; paymentMethod?: string }) => {
    const existing = reservations.find((reservation) => reservation.id === id);
    if (existing) return existing;
    const reservation: Reservation = { id, offerId: offer.id, code, createdAt: new Date().toISOString(), paymentStatus: "pending", paymentMethod, pickupTime, offerSnapshot: createOfferSnapshot(offer) };
    const nextReservations = [reservation, ...reservations];
    setReservations(nextReservations);
    await persist(nextReservations, impact, favoriteStores, mutedFavoriteStores);
    return reservation;
  }, [favoriteStores, impact, mutedFavoriteStores, persist, reservations]);

  const updateRemoteReservationStatus = useCallback(async (id: string, paymentStatus: Reservation["paymentStatus"]) => {
    const nextReservations = reservations.map((reservation) => reservation.id === id ? { ...reservation, paymentStatus } : reservation);
    setReservations(nextReservations);
    await persist(nextReservations, impact, favoriteStores, mutedFavoriteStores);
  }, [favoriteStores, impact, mutedFavoriteStores, persist, reservations]);

  const updateReservationDispute = useCallback(async (id: string, disputeStatus: NonNullable<Reservation["disputeStatus"]>, refundStatus?: Reservation["refundStatus"]) => {
    const nextReservations = reservations.map((reservation) => reservation.id === id ? { ...reservation, reservationStatus: "disputed" as const, disputeStatus, refundStatus: refundStatus ?? reservation.refundStatus } : reservation);
    setReservations(nextReservations);
    await persist(nextReservations, impact, favoriteStores, mutedFavoriteStores);
  }, [favoriteStores, impact, mutedFavoriteStores, persist, reservations]);

  const isFavoriteStore = useCallback((store: string) => favoriteStores.includes(store), [favoriteStores]);
  const toggleFavoriteStore = useCallback(async (store: string) => {
    const isRemoving = favoriteStores.includes(store);
    const nextFavorites = isRemoving ? favoriteStores.filter((item) => item !== store) : [...favoriteStores, store];
    const nextMutedFavorites = isRemoving ? mutedFavoriteStores.filter((item) => item !== store) : mutedFavoriteStores;
    setFavoriteStores(nextFavorites);
    setMutedFavoriteStores(nextMutedFavorites);
    await persist(reservations, impact, nextFavorites, nextMutedFavorites);
  }, [favoriteStores, impact, mutedFavoriteStores, persist, reservations]);

  const isFavoriteAlertEnabled = useCallback((store: string) => favoriteStores.includes(store) && !mutedFavoriteStores.includes(store), [favoriteStores, mutedFavoriteStores]);
  const toggleFavoriteAlert = useCallback(async (store: string) => {
    if (!favoriteStores.includes(store)) return;
    const nextMutedFavorites = mutedFavoriteStores.includes(store)
      ? mutedFavoriteStores.filter((item) => item !== store)
      : [...mutedFavoriteStores, store];
    setMutedFavoriteStores(nextMutedFavorites);
    await persist(reservations, impact, favoriteStores, nextMutedFavorites);
  }, [favoriteStores, impact, mutedFavoriteStores, persist, reservations]);

  const value = useMemo(
    () => ({ reservations, impact, favoriteStores, mutedFavoriteStores, isReady, reserveOffer, recordRemoteReservation, updateRemoteReservationStatus, updateReservationDispute, isFavoriteStore, toggleFavoriteStore, isFavoriteAlertEnabled, toggleFavoriteAlert }),
    [favoriteStores, impact, isFavoriteAlertEnabled, isFavoriteStore, isReady, mutedFavoriteStores, recordRemoteReservation, reservations, reserveOffer, toggleFavoriteAlert, toggleFavoriteStore, updateRemoteReservationStatus, updateReservationDispute],
  );

  return <CapiLoopContext.Provider value={value}>{children}</CapiLoopContext.Provider>;
}

export function useCapiLoop() {
  const context = useContext(CapiLoopContext);
  if (!context) throw new Error("useCapiLoop deve ser usado dentro de CapiLoopProvider");
  return context;
}
