import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { CapiLoopMascot } from "@/components/capiloop-mascot";
import { ScreenContainer } from "@/components/screen-container";
import { useCapiLoop } from "@/lib/capiloop-store";

export default function OrderHistoryScreen() {
  const { reservations, isReady } = useCapiLoop();
  const orderedReservations = [...reservations].sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  if (!isReady) return <ScreenContainer />;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1"><FlatList
    data={orderedReservations}
    keyExtractor={(item) => item.id}
    contentContainerStyle={[styles.content, orderedReservations.length === 0 && styles.emptyContent]}
    ListHeaderComponent={<View style={styles.header}><CapiLoopBrand compact /><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]} accessibilityLabel="Voltar"><MaterialIcons name="arrow-back" size={21} color="#151B14" /></Pressable><Text style={styles.title}>Histórico de pedidos</Text><Text style={styles.subtitle}>Veja pedidos anteriores e abra cada comprovante de retirada.</Text></View>}
    renderItem={({ item }) => { const offer = item.offerSnapshot; if (!offer) return null; const confirmed = item.paymentStatus === "confirmed"; return <Pressable onPress={() => router.push({ pathname: "/reservation/[id]", params: { id: item.id } })} style={({ pressed }) => [styles.order, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`Abrir comprovante de ${offer.store}`}><View style={styles.orderTop}><View style={[styles.status, confirmed ? styles.confirmed : styles.pending]}><Text style={[styles.statusText, confirmed ? styles.confirmedText : styles.pendingText]}>{confirmed ? "CONFIRMADO" : "EM ANÁLISE"}</Text></View><Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</Text></View><Text style={styles.store}>{offer.store}</Text><Text style={styles.bag}>{offer.subtitle}</Text><View style={styles.rule} /><View style={styles.meta}><MaterialIcons name="receipt-long" size={18} color="#5E7D00" /><Text style={styles.metaText}>Abrir comprovante · código {item.code}</Text><MaterialIcons name="chevron-right" size={20} color="#8C9388" /></View></Pressable>; }}
    ListEmptyComponent={<View style={styles.empty}><CapiLoopMascot variant="emptyBag" size={130} accessibilityLabel="Capivara CapiLoop convidando você a descobrir sacolas" /><Text style={styles.emptyTitle}>Nenhum pedido ainda</Text><Text style={styles.emptyCopy}>Quando você reservar uma sacola, o comprovante ficará salvo aqui.</Text><Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [styles.discover, pressed && styles.pressed]}><Text style={styles.discoverText}>Descobrir sacolas</Text></Pressable></View>}
  /></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 }, emptyContent: { flexGrow: 1 }, header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }, back: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E8ECE4", borderRadius: 15, borderWidth: 1, height: 43, justifyContent: "center", marginTop: 18, width: 43 }, title: { color: "#151B14", fontSize: 28, fontWeight: "900", letterSpacing: -1.1, marginTop: 18 }, subtitle: { color: "#697065", fontSize: 13, lineHeight: 19, marginTop: 5 }, order: { backgroundColor: "#FFFFFF", borderColor: "#E8ECE4", borderRadius: 22, borderWidth: 1, marginHorizontal: 20, marginBottom: 12, padding: 17 }, orderTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, status: { borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 }, confirmed: { backgroundColor: "#EAF7BE" }, pending: { backgroundColor: "#FFF0D4" }, statusText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.6 }, confirmedText: { color: "#527500" }, pendingText: { color: "#8A6500" }, date: { color: "#8C9388", fontSize: 10, fontWeight: "700" }, store: { color: "#151B14", fontSize: 17, fontWeight: "900", marginTop: 13 }, bag: { color: "#697065", fontSize: 12, marginTop: 3 }, rule: { backgroundColor: "#E8ECE4", height: 1, marginVertical: 14 }, meta: { alignItems: "center", flexDirection: "row", gap: 8 }, metaText: { color: "#4F574E", flex: 1, fontSize: 11, fontWeight: "700" }, empty: { alignItems: "center", flex: 1, justifyContent: "center", paddingBottom: 70, paddingHorizontal: 34 }, emptyTitle: { color: "#151B14", fontSize: 22, fontWeight: "900", marginTop: 18 }, emptyCopy: { color: "#697065", fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: "center" }, discover: { backgroundColor: "#151B14", borderRadius: 16, marginTop: 22, paddingHorizontal: 19, paddingVertical: 14 }, discoverText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
