import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { ScreenContainer } from "@/components/screen-container";
import { useCatalog } from "@/lib/catalog";
import { useCapiLoop } from "@/lib/capiloop-store";

export default function BagScreen() {
  const { reservations, isReady } = useCapiLoop();
  const { getOffer } = useCatalog();
  if (!isReady) return <ScreenContainer />;
  const sortedReservations = [...reservations].sort((a, b) => (a.paymentStatus === "pending" ? -1 : 1) - (b.paymentStatus === "pending" ? -1 : 1));
  return <ScreenContainer className="flex-1"><FlatList
    data={sortedReservations} keyExtractor={(item) => item.id} contentContainerStyle={[styles.content, reservations.length === 0 && styles.emptyContent]}
    renderItem={({ item }) => {
      const liveOffer = getOffer(item.offerId);
      const offer = item.offerSnapshot ?? liveOffer;
      if (!offer) return null;
      const isPending = item.paymentStatus === "pending";
      return <Pressable onPress={() => router.push({ pathname: "/reservation/[id]", params: { id: item.id } })} style={({ pressed }) => [styles.reservationCard, pressed && { opacity: 0.72 }]}>
        <View style={styles.statusRow}><View style={[styles.statusDot, isPending && styles.pendingDot]} /><Text style={[styles.statusText, isPending && styles.pendingText]}>{isPending ? "PAGAMENTO EM ANÁLISE" : "PRONTA PARA RETIRAR"}</Text><MaterialIcons name="chevron-right" size={21} color="#697065" /></View>
        <Text style={styles.store}>{offer.store}</Text><Text style={styles.bagType}>{offer.subtitle}</Text><View style={styles.divider} />
        <View style={styles.pickupRow}><MaterialIcons name="schedule" size={20} color="#5E7D00" /><View style={styles.pickupInfo}><Text style={styles.pickupTitle}>Retire hoje, {offer.pickupWindow}</Text><Text style={styles.pickupAddress}>{offer.address}</Text></View></View>
        <View style={[styles.codeBox, isPending && styles.pendingBox]}><Text style={styles.codeLabel}>{isPending ? "PRÓXIMO PASSO" : "CÓDIGO DE RETIRADA"}</Text><Text style={styles.code}>{isPending ? "Acompanhar pagamento" : item.code}</Text></View>
      </Pressable>;
    }}
    ListHeaderComponent={<View style={styles.header}><CapiLoopBrand compact /><Text style={styles.title}>Minhas sacolas</Text><Text style={styles.subtitle}>{sortedReservations.length > 0 ? "Confira primeiro a retirada ou o pagamento pendente." : "Suas reservas aparecerão aqui."}</Text></View>}
    ListEmptyComponent={<EmptyBag />}
  /></ScreenContainer>;
}

function EmptyBag() { return <View style={styles.emptyState}><View style={styles.emptyIcon}><MaterialIcons name="shopping-bag" size={35} color="#5E7D00" /></View><Text style={styles.emptyTitle}>Sua próxima sacola{"\n"}está por perto.</Text><Text style={styles.emptyCopy}>Reserve uma oferta e retire sabores incríveis por menos.</Text><Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.78 }]}><Text style={styles.primaryButtonText}>Ver sacolas de hoje</Text></Pressable></View>; }

const styles = StyleSheet.create({ content: { paddingHorizontal: 20, paddingBottom: 26 }, emptyContent: { flexGrow: 1 }, header: { marginTop: 8, marginBottom: 25 }, title: { color: "#151B14", fontSize: 28, fontWeight: "900", letterSpacing: -1.2, marginTop: 17 }, subtitle: { color: "#697065", fontSize: 13, marginTop: 5 }, reservationCard: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 25, shadowColor: "#182314", shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3, marginBottom: 13 }, statusRow: { flexDirection: "row", alignItems: "center", gap: 6 }, statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#A5DF00" }, pendingDot: { backgroundColor: "#F5BC73" }, statusText: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 0.8, flex: 1 }, pendingText: { color: "#9A6500" }, store: { color: "#151B14", fontSize: 23, fontWeight: "900", letterSpacing: -0.7, marginTop: 13 }, bagType: { color: "#697065", fontSize: 13, marginTop: 3 }, divider: { height: 1, backgroundColor: "#EBEEE8", marginVertical: 18 }, pickupRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" }, pickupInfo: { flex: 1 }, pickupTitle: { color: "#151B14", fontSize: 14, fontWeight: "800" }, pickupAddress: { color: "#697065", fontSize: 12, lineHeight: 17, marginTop: 3 }, codeBox: { marginTop: 19, backgroundColor: "#F4F8E8", borderRadius: 17, padding: 14, alignItems: "center" }, pendingBox: { backgroundColor: "#FFF5DF" }, codeLabel: { color: "#5E7D00", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 }, code: { color: "#151B14", fontSize: 18, fontWeight: "900", letterSpacing: 0.3, marginTop: 4 }, emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, paddingBottom: 70 }, emptyIcon: { width: 80, height: 80, borderRadius: 29, backgroundColor: "#ECF6CD", alignItems: "center", justifyContent: "center" }, emptyTitle: { color: "#151B14", fontSize: 24, lineHeight: 30, fontWeight: "900", letterSpacing: -0.8, textAlign: "center", marginTop: 21 }, emptyCopy: { color: "#697065", fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 10 }, primaryButton: { backgroundColor: "#151B14", paddingHorizontal: 21, paddingVertical: 15, borderRadius: 16, marginTop: 24 }, primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" } });
