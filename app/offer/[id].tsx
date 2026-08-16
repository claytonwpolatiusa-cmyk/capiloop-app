import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { formatCurrency } from "@/lib/capiloop-data";
import { useCatalog } from "@/lib/catalog";
import { useCapiLoop } from "@/lib/capiloop-store";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOffer, isLoading } = useCatalog();
  const offer = getOffer(id);
  const { reservations } = useCapiLoop();
  const currentReservation = reservations.find((reservation) => reservation.offerId === id && reservation.paymentStatus !== "failed");

  if (!offer) {
    return <ScreenContainer className="items-center justify-center px-8"><Text className="text-center text-foreground">{isLoading ? "Atualizando oferta…" : "Esta sacola não está mais disponível."}</Text></ScreenContainer>;
  }

  const openReservationConfirmation = () => {
    if (currentReservation) {
      router.push({ pathname: "/reservation/[id]", params: { id: currentReservation.id } });
      return;
    }
    router.push({ pathname: "/offer/confirm", params: { id: offer.id } });
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageWrap}>
          <Image source={offer.image} style={styles.image} />
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.62 }]} accessibilityLabel="Voltar"><MaterialIcons name="arrow-back" size={22} color="#151B14" /></Pressable>
          <View style={styles.categoryPill}><Text style={styles.categoryText}>{offer.category.toUpperCase()}</Text></View>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}><View style={styles.titleInfo}><Text style={styles.store}>{offer.store}</Text><Text style={styles.bagType}>{offer.subtitle}</Text></View><View style={styles.stock}><Text style={styles.stockText}>{offer.stockLabel}</Text></View></View>
          <Text style={styles.expected}>{offer.expected}</Text>
          <View style={styles.metaCard}>
            <MetaRow icon="schedule" label="Retirada" value={`Hoje, ${offer.pickupWindow}`} />
            <View style={styles.metaDivider} />
            <MetaRow icon="location-on" label="Endereço" value={offer.address} />
          </View>
          <View style={styles.impactRow}><View style={styles.impactIcon}><MaterialIcons name="eco" size={19} color="#151B14" /></View><View style={styles.impactCopyBlock}><Text style={styles.impactTitle}>Uma escolha que faz diferença</Text><Text style={styles.impactCopy}>Esta sacola evita cerca de {offer.co2Kg.toFixed(1).replace(".", ",")} kg de CO₂.</Text></View></View>
          <View style={styles.paymentHint}><MaterialIcons name={offer.source === "reference" ? "info-outline" : "lock-outline"} size={16} color="#5E7D00" /><Text style={styles.paymentHintText}>{offer.source === "reference" ? "Oferta de referência para você explorar a experiência de reserva. Sacolas publicadas por parceiros usam pagamento via PIX ou cartão." : "Pagamento seguro via Mercado Pago. Escolha PIX ou cartão no checkout."}</Text></View>
        </View>
      </ScrollView>
      <View style={styles.actionBar}>
        <View><Text style={styles.original}>{formatCurrency(offer.originalPrice)}</Text><Text style={styles.price}>{formatCurrency(offer.price)}</Text></View>
        <Pressable onPress={openReservationConfirmation} style={({ pressed }) => [styles.reserveButton, pressed && { opacity: 0.78, transform: [{ scale: 0.98 }] }]}><Text style={styles.reserveText}>{currentReservation ? "Ver reserva" : "Reservar"}</Text><MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" /></Pressable>
      </View>
    </ScreenContainer>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <View style={styles.metaRow}><View style={styles.metaIcon}><MaterialIcons name={icon as never} size={18} color="#5E7D00" /></View><View style={styles.metaTextBlock}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View></View>;
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 145 }, imageWrap: { height: 305, backgroundColor: "#E3E9DE" }, image: { height: "100%", width: "100%" }, backButton: { position: "absolute", top: 14, left: 18, height: 43, width: 43, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.94)", alignItems: "center", justifyContent: "center" }, categoryPill: { position: "absolute", bottom: 15, left: 20, backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 }, categoryText: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 0.8 }, body: { paddingHorizontal: 20, paddingTop: 23 }, titleRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, titleInfo: { flex: 1 }, store: { color: "#151B14", fontSize: 27, lineHeight: 32, fontWeight: "900", letterSpacing: -1.2 }, bagType: { color: "#697065", fontSize: 13, marginTop: 4 }, stock: { alignSelf: "flex-start", borderRadius: 11, backgroundColor: "#F4F8E8", paddingHorizontal: 9, paddingVertical: 6 }, stockText: { color: "#5E7D00", fontSize: 10, fontWeight: "900" }, expected: { color: "#4F574E", fontSize: 14, lineHeight: 20, marginTop: 17 }, metaCard: { backgroundColor: "#FFFFFF", borderRadius: 21, padding: 16, marginTop: 22, borderWidth: 1, borderColor: "#E8ECE4" }, metaRow: { flexDirection: "row", gap: 11, alignItems: "center" }, metaIcon: { width: 36, height: 36, borderRadius: 13, backgroundColor: "#ECF6CD", alignItems: "center", justifyContent: "center" }, metaTextBlock: { flex: 1 }, metaLabel: { color: "#697065", fontSize: 10, fontWeight: "800" }, metaValue: { color: "#151B14", fontSize: 13, lineHeight: 18, fontWeight: "800", marginTop: 2 }, metaDivider: { height: 1, backgroundColor: "#E8ECE4", marginVertical: 14 }, impactRow: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 19, padding: 15, borderRadius: 19, backgroundColor: "#F4F8E8" }, impactIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#A5DF00", alignItems: "center", justifyContent: "center" }, impactCopyBlock: { flex: 1 }, impactTitle: { color: "#151B14", fontSize: 13, fontWeight: "900" }, impactCopy: { color: "#4A6410", fontSize: 11, marginTop: 2 }, paymentHint: { flexDirection: "row", gap: 9, alignItems: "center", marginTop: 15, padding: 13, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4" }, paymentHintText: { flex: 1, color: "#4F574E", fontSize: 11, lineHeight: 16, fontWeight: "700" }, actionBar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E8ECE4", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, original: { color: "#8C9388", fontSize: 11, fontWeight: "700", textDecorationLine: "line-through" }, price: { color: "#151B14", fontSize: 24, fontWeight: "900", letterSpacing: -1 }, reserveButton: { backgroundColor: "#151B14", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 17, paddingVertical: 15, borderRadius: 16 }, reserveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
});
