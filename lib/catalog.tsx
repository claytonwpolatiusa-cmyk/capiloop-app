import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ImageSourcePropType } from "react-native";

import { getApiBaseUrl } from "@/constants/oauth";
import type { Offer, OfferCategory } from "@/lib/capiloop-data";

type CatalogBag = {
  id: number;
  category: string;
  originalPrice: number | string;
  salePrice: number | string;
  expectedItems: string | null;
  pickupStartTime: string;
  pickupEndTime: string;
  quantity: number;
  reserved: number;
  co2Kg: number | string;
  imageUrl: string | null;
  partner: { businessName: string; address: string; latitude: string | null; longitude: string | null };
};

type CatalogState = {
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getOffer: (id?: string | string[]) => Offer | undefined;
};

const CatalogContext = createContext<CatalogState | null>(null);

const fallbackImages: Record<OfferCategory, ImageSourcePropType> = {
  Padaria: require("../assets/images/offers/padaria.jpg"),
  Café: require("../assets/images/offers/cafe.jpg"),
  Mercado: require("../assets/images/offers/mercado.jpeg"),
  Restaurante: require("../assets/images/offers/doces.jpg"),
};

const accents: Record<OfferCategory, string> = {
  Padaria: "#F5BC73",
  Café: "#DEAD88",
  Mercado: "#A5DF00",
  Restaurante: "#E7B5CE",
};

function normalizeCategory(value: string): OfferCategory {
  return ["Padaria", "Café", "Mercado", "Restaurante"].includes(value) ? (value as OfferCategory) : "Restaurante";
}

function formatPickupWindow(startValue: string, endValue: string) {
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Horário informado pela loja";
  const format = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${format.format(start)}–${format.format(end)}`;
}

function mapBagToOffer(bag: CatalogBag): Offer {
  const category = normalizeCategory(bag.category);
  const remaining = Math.max(0, Number(bag.quantity) - Number(bag.reserved));
  return {
    id: String(bag.id),
    store: bag.partner.businessName,
    subtitle: `Sacola de ${category.toLowerCase()}`,
    category,
    price: Number(bag.salePrice),
    originalPrice: Number(bag.originalPrice),
    distance: "Distância disponível ao ativar a localização",
    pickupWindow: formatPickupWindow(bag.pickupStartTime, bag.pickupEndTime),
    address: bag.partner.address,
    stockLabel: remaining === 1 ? "Resta 1" : `Restam ${remaining}`,
    expected: bag.expectedItems || "Itens surpresa selecionados pela loja no final do dia.",
    image: bag.imageUrl ? { uri: bag.imageUrl } : fallbackImages[category],
    accent: accents[category],
    co2Kg: Number(bag.co2Kg),
    latitude: bag.partner.latitude ? Number(bag.partner.latitude) : undefined,
    longitude: bag.partner.longitude ? Number(bag.partner.longitude) : undefined,
    pickupStartTime: bag.pickupStartTime,
    pickupEndTime: bag.pickupEndTime,
  };
}

async function fetchCatalog(): Promise<Offer[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/catalog/bags`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Não foi possível carregar as sacolas disponíveis.");
  const body = (await response.json()) as { bags?: CatalogBag[] };
  return (body.bags ?? []).map(mapBagToOffer);
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setOffers(await fetchCatalog());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o catálogo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<CatalogState>(() => ({
    offers,
    isLoading,
    error,
    refresh,
    getOffer: (id) => offers.find((offer) => offer.id === String(id)),
  }), [error, isLoading, offers, refresh]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog deve ser usado dentro de CatalogProvider.");
  return context;
}
