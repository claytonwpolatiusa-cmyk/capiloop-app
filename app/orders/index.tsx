import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/capiloop-data";
import { formatOrderDate, formatPickupWindow, orderStatusPresentation } from "@/lib/order-utils";
import { trpc } from "@/lib/trpc";

export default function OrderHistoryScreen() {
  const { isAuthenticated, loading } = useAuth();
  const orders = trpc.checkout.history.useQuery(undefined, { enabled: isAuthenticated });

  if (loading || (isAuthenticated && orders.isLoading)) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color="#5E7D00" /><Text style={styles.loading}>Carregando seus pedidos…</Text></ScreenContainer>;

  if (!isAuthenticated) return <ScreenContainer className="items-center justify-center px-7"><View style={styles.emptyIcon}><MaterialIcons name="lock" size={28} color="#5E7D00" /></View><Text style={styles.emptyTitle}>Entre para ver seus pedidos</Text><Text style={styles.emptyCopy}>Seu histórico e os comprovantes ficam vinculados à sua conta CapiLoop.</Text><Pressable onPress={() => router.push("/auth/welcome")} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Entrar na minha conta</Text></Pressable></ScreenContainer>;

  return <ScreenContainer className="flex-1"><FlatList
    data={orders.data ?? []}
    keyExtractor={(item) => item.id}
    contentContainerStyle={[styles.content, !orders.data?.length && styles.emptyContent]}
    ListHeaderComponent={<View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]} accessibilityLabel="Voltar"><MaterialIcons name="arrow-back" size={21} color="#151B14" /></Pressable><CapiLoopBrand compact /><Text style={styles.title}>Histórico de pedidos</Text><Text style={styles.subtitle}>Reveja pagamentos, horários e comprovantes de retirada.</Text></View>}
    renderItem={({ item }) => {
      const presentation = orderStatusPresentation(item.status, item.paymentStatus);
      return <Pressable onPress={() => router.push({ pathname: "/orders/[id]" as never, params: { id: item.id } })} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} accessibilityLabel={`Ver comprovante de ${item.store}`}>
        <View style={styles.cardTop}><View style={[styles.statusPill, { backgroundColor: presentation.background }]}><MaterialIcons name={presentation.icon} size={14} color={presentation.color} /><Text style={[styles.statusText, { color: presentation.color }]}>{presentation.label}</Text></View><MaterialIcons name="chevron-right" size={21} color="#697065" /></View>
        <Text style={styles.store}>{item.store}</Text><Text style={styles.category}>Sacola de {item.category.toLowerCase()}</Text>
        <View style={styles.meta}><View style={styles.metaItem}><MaterialIcons name="schedule" size={16} color="#5E7D00" /><Text style={styles.metaText}>{formatPickupWindow(item.pickupStartTime, item.pickupEndTime)}</Text></View><Text style={styles.price}>{formatCurrency(item.price)}</Text></View>
        <Text style={styles.createdAt}>Pedido em {formatOrderDate(item.createdAt)}</Text>
      </Pressable>;
    }}
    ListEmptyComponent={<View style={styles.empty}><View style={styles.emptyIcon}><MaterialIcons name="receipt-long" size={30} color="#5E7D00" /></View><Text style={styles.emptyTitle}>Ainda não há pedidos</Text><Text style={styles.emptyCopy}>Depois de reservar uma sacola, o comprovante aparecerá aqui para sua retirada.</Text><Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Descobrir sacolas</Text></Pressable></View>}
  /></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 28 }, emptyContent: { flexGrow: 1 }, header: { marginTop: 8, marginBottom: 24 }, back: { height: 40, width: 40, alignItems: "center", justifyContent: "center", marginLeft: -8, marginBottom: 8 }, title: { color: "#151B14", fontSize: 28, lineHeight: 34, fontWeight: "900", letterSpacing: -1.2, marginTop: 16 }, subtitle: { color: "#697065", fontSize: 13, lineHeight: 18, marginTop: 5 }, loading: { color: "#5E7D00", fontSize: 12, fontWeight: "800", marginTop: 12 }, card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4EADF", borderRadius: 22, padding: 16, marginBottom: 11 }, cardPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] }, cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, statusPill: { minHeight: 26, borderRadius: 10, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 4 }, statusText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.35 }, store: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.45, marginTop: 12 }, category: { color: "#697065", fontSize: 12, marginTop: 3 }, meta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#EEF1EA", marginTop: 14, paddingTop: 12 }, metaItem: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }, metaText: { color: "#4F574E", fontSize: 12, fontWeight: "800" }, price: { color: "#151B14", fontSize: 15, fontWeight: "900" }, createdAt: { color: "#8B9286", fontSize: 10, marginTop: 11, fontWeight: "700" }, empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 29, paddingBottom: 80 }, emptyIcon: { height: 72, width: 72, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: "#ECF6CD" }, emptyTitle: { color: "#151B14", fontSize: 22, fontWeight: "900", textAlign: "center", marginTop: 19 }, emptyCopy: { color: "#697065", fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 8 }, primaryButton: { minHeight: 48, borderRadius: 15, backgroundColor: "#151B14", justifyContent: "center", paddingHorizontal: 19, marginTop: 23 }, primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, pressed: { opacity: 0.65 },
});
