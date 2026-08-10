import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Offer } from "@/lib/capiloop-data";
import { applyOfferImpact, type ImpactTotals } from "@/lib/capiloop-domain";

export type Reservation = {
  id: string;
  offerId: string;
  code: string;
  createdAt: string;
};

export type Impact = ImpactTotals;

type CapiLoopContextValue = {
  reservations: Reservation[];
  impact: Impact;
  isReady: boolean;
  reserveOffer: (offer: Offer) => Promise<Reservation>;
};

const STORAGE_KEY = "capiloop-local-state";
const initialImpact: Impact = { savedBags: 4, co2Kg: 10.4, savings: 126.2 };
const CapiLoopContext = createContext<CapiLoopContextValue | null>(null);

export function CapiLoopProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [impact, setImpact] = useState<Impact>(initialImpact);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((rawValue) => {
        if (!rawValue) return;
        const parsed = JSON.parse(rawValue) as { reservations?: Reservation[]; impact?: Impact };
        setReservations(parsed.reservations ?? []);
        setImpact(parsed.impact ?? initialImpact);
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, []);

  const persist = useCallback(async (nextReservations: Reservation[], nextImpact: Impact) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ reservations: nextReservations, impact: nextImpact }),
    );
  }, []);

  const reserveOffer = useCallback(
    async (offer: Offer) => {
      const existing = reservations.find((reservation) => reservation.offerId === offer.id);
      if (existing) return existing;

      const reservation: Reservation = {
        id: `${offer.id}-${Date.now()}`,
        offerId: offer.id,
        code: `CAP-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
      };
      const nextReservations = [reservation, ...reservations];
      const nextImpact = applyOfferImpact(impact, offer);
      setReservations(nextReservations);
      setImpact(nextImpact);
      await persist(nextReservations, nextImpact);
      return reservation;
    },
    [impact, persist, reservations],
  );

  const value = useMemo(
    () => ({ reservations, impact, isReady, reserveOffer }),
    [impact, isReady, reservations, reserveOffer],
  );

  return <CapiLoopContext.Provider value={value}>{children}</CapiLoopContext.Provider>;
}

export function useCapiLoop() {
  const context = useContext(CapiLoopContext);
  if (!context) throw new Error("useCapiLoop deve ser usado dentro de CapiLoopProvider");
  return context;
}
