import type { ImageSourcePropType } from "react-native";

export type OfferCategory = "Padaria" | "Café" | "Mercado" | "Restaurante";

export type Offer = {
  id: string;
  store: string;
  subtitle: string;
  category: OfferCategory;
  price: number;
  originalPrice: number;
  distance: string;
  pickupWindow: string;
  address: string;
  stockLabel: string;
  expected: string;
  image: ImageSourcePropType;
  accent: string;
  co2Kg: number;
  latitude: number;
  longitude: number;
};

export const categories: { label: OfferCategory; icon: string }[] = [
  { label: "Padaria", icon: "bakery-dining" },
  { label: "Café", icon: "local-cafe" },
  { label: "Mercado", icon: "shopping-basket" },
  { label: "Restaurante", icon: "restaurant" },
];

export const offers: Offer[] = [
  {
    id: "pao-do-bosque",
    store: "Pão do Bosque",
    subtitle: "Sacola de padaria",
    category: "Padaria",
    price: 13.9,
    originalPrice: 42,
    distance: "0,8 km",
    pickupWindow: "18h–19h",
    address: "Rua do Rosário, 431 · Centro",
    stockLabel: "Resta 1",
    expected: "Pães, folhados, doces e itens de vitrine do dia.",
    image: require("../assets/images/offers/padaria.jpg"),
    accent: "#F5BC73",
    co2Kg: 2.2,
    latitude: -25.4303,
    longitude: -49.2731,
  },
  {
    id: "cafe-amarelo",
    store: "Café Amarelo",
    subtitle: "Sacola de café",
    category: "Café",
    price: 14.9,
    originalPrice: 45,
    distance: "1,1 km",
    pickupWindow: "17h30–18h30",
    address: "Alameda Cabral, 724 · São Francisco",
    stockLabel: "Resta 2",
    expected: "Salgados, fatias doces e acompanhamentos do balcão.",
    image: require("../assets/images/offers/cafe.jpg"),
    accent: "#DEAD88",
    co2Kg: 2.6,
    latitude: -25.4254,
    longitude: -49.2794,
  },
  {
    id: "mercado-estacao",
    store: "Mercado Estação",
    subtitle: "Sacola de hortifruti",
    category: "Mercado",
    price: 18.9,
    originalPrice: 56,
    distance: "1,4 km",
    pickupWindow: "19h–20h",
    address: "Av. Sete de Setembro, 803 · Rebouças",
    stockLabel: "Últimas 3",
    expected: "Frutas, legumes e verduras em perfeito estado.",
    image: require("../assets/images/offers/mercado.jpeg"),
    accent: "#A5DF00",
    co2Kg: 3.1,
    latitude: -25.4407,
    longitude: -49.266,
  },
  {
    id: "doce-canto",
    store: "Doce Canto",
    subtitle: "Sacola de confeitaria",
    category: "Restaurante",
    price: 16.9,
    originalPrice: 49,
    distance: "1,7 km",
    pickupWindow: "18h–19h",
    address: "Rua Saldanha Marinho, 587 · Centro",
    stockLabel: "Resta 1",
    expected: "Bolos, doces e preparos frescos da confeitaria.",
    image: require("../assets/images/offers/doces.jpg"),
    accent: "#E7B5CE",
    co2Kg: 2.8,
    latitude: -25.4367,
    longitude: -49.277,
  },
];

export const findOffer = (id?: string | string[]) => offers.find((offer) => offer.id === id);

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
