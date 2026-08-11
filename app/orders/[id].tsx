import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { formatCurrency } from "@/lib/capiloop-data";
import { formatOrderDate, formatPickupWindow, orderStatusPresentation } from "@/lib/order-utils";
import { trpc } from "@/lib/trpc";

export default function OrderReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const receipt = trpc.checkout.receipt.useQuery({ reservationId: Number(id) }, { enabled: Number.isFinite(Number(id)) });

  if (receipt.isLoading) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color="#5E7D00" /><Text style={styles.loading}>Preparando seu comprovante…</Text></ScreenContainer>;
  if (!receipt.data) return <ScreenContainer className="items-center justify-center px-7"><Text style={styles.errorTitle}>Comprovante indisponível</Text><Text style={styles.errorCopy}>{receipt.error?.message ?? "Não foi possível localizar este pedido."}</Text><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Voltar ao histórico</Text></Pressable></ScreenContainer>;

  const order = receipt.data;
  const presentation = orderStatusPresentation(order.status, order.paymentStatus);
  const ready = order.status === "confirmed" || order.status === "picked_up" || order.paymentStatus === "completed";

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1"><View style={styles.page}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]} accessibilityLabel="Voltar"><MaterialIcons name="arrow-back" size={21} color="#151B14" /></Pressable><Text style={styles.headerTitle}>Comprovante</Text><View style={styles.headerSpacer} /></View>
    <View style={[styles.statusIcon, { backgroundColor: presentation.background }]}><MaterialIcons name={presentation.icon} size={33} color={presentation.color} /></View>
    <Text style={[styles.eyebrow, { color: presentation.color }]}>{presentation.label}</Text><Text style={styles.title}>{ready ? "Sua retirada está registrada." : "Acompanhe seu pagamento."}</Text><Text style={styles.copy}>{ready ? "Apresente este comprovante no balcão durante a janela de retirada." : "Assim que o pagamento for confirmado, este comprovante ficará pronto para a retirada."}</Text>
    <View style={styles.ticket}>
      <Text style={styles.ticketLabel}>SACOLA RESERVADA</Text><Text style={styles.store}>{order.store}</Text><Text style={styles.category}>Sacola de {order.category.toLowerCase()}</Text>
      <View style={styles.divider} />
      <View style={styles.detailRow}><View style={styles.detailIcon}><MaterialIcons name="schedule" size={18} color="#5E7D00" /></View><View style={styles.detailCopy}><Text style={styles.detailLabel}>RETIRADA</Text><Text style={styles.detailValue}>{formatPickupWindow(order.pickupStartTime, order.pickupEndTime)}</Text><Text style={styles.detailDescription}>{order.address}</Text></View></View>
      <View style={styles.detailRow}><View style={styles.detailIcon}><MaterialIcons name="payments" size={18} color="#5E7D00" /></View><View style={styles.detailCopy}><Text style={styles.detailLabel}>PAGAMENTO</Text><Text style={styles.detailValue}>{formatCurrency(order.price)}</Text><Text style={styles.detailDescription}>{order.paymentStatus === "completed" ? "Pagamento confirmado" : order.paymentStatus === "pending" ? "Em análise pelo Mercado Pago" : "Status de pagamento indisponível"}</Text></View></View>
      <View style={styles.dashed} />
      <Text style={styles.codeLabel}>CÓDIGO DE RETIRADA</Text><Text style={styles.code}>{order.code}</Text><Text style={styles.codeHelp}>Mostre este código ao parceiro no balcão.</Text>
    </View>
    <View style={styles.note}><MaterialIcons name="info-outline" size={17} color="#52604B" /><Text style={styles.noteText}>Pedido feito em {formatOrderDate(order.createdAt)}. Itens: {order.expectedItems}</Text></View>
  </View><View style={styles.footer}><Pressable onPress={() => router.replace("/(tabs)/bag")} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Ver minhas sacolas</Text><MaterialIcons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable></View></ScreenContainer>;
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 22 }, header: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { height: 42, width: 42, alignItems: "center", justifyContent: "center", marginLeft: -8 }, headerTitle: { color: "#151B14", fontSize: 14, fontWeight: "900" }, headerSpacer: { width: 34 }, statusIcon: { height: 72, width: 72, borderRadius: 26, alignItems: "center", justifyContent: "center", marginTop: 24 }, eyebrow: { fontSize: 10, letterSpacing: 0.95, fontWeight: "900", marginTop: 20 }, title: { color: "#151B14", fontSize: 29, lineHeight: 35, letterSpacing: -1.2, fontWeight: "900", marginTop: 7 }, copy: { color: "#697065", fontSize: 13, lineHeight: 19, marginTop: 8 }, ticket: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 19, borderWidth: 1, borderColor: "#E4EADF", marginTop: 22 }, ticketLabel: { color: "#697065", fontSize: 9, letterSpacing: 0.8, fontWeight: "900" }, store: { color: "#151B14", fontSize: 21, letterSpacing: -0.6, fontWeight: "900", marginTop: 7 }, category: { color: "#697065", fontSize: 12, marginTop: 3 }, divider: { height: 1, backgroundColor: "#EEF1EA", marginVertical: 17 }, detailRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 14 }, detailIcon: { width: 33, height: 33, borderRadius: 11, backgroundColor: "#ECF6CD", alignItems: "center", justifyContent: "center" }, detailCopy: { flex: 1 }, detailLabel: { color: "#697065", fontSize: 9, letterSpacing: 0.7, fontWeight: "900" }, detailValue: { color: "#151B14", fontSize: 14, fontWeight: "900", marginTop: 2 }, detailDescription: { color: "#697065", fontSize: 11, lineHeight: 15, marginTop: 2 }, dashed: { borderTopWidth: 1, borderColor: "#C7D0C0", borderStyle: "dashed", marginTop: 5, marginBottom: 16 }, codeLabel: { color: "#5E7D00", fontSize: 9, letterSpacing: 0.85, fontWeight: "900", textAlign: "center" }, code: { color: "#151B14", fontSize: 25, letterSpacing: 2.6, fontWeight: "900", textAlign: "center", marginTop: 5 }, codeHelp: { color: "#697065", fontSize: 10, textAlign: "center", marginTop: 4 }, note: { flexDirection: "row", alignItems: "flex-start", gap: 7, marginTop: 15, paddingHorizontal: 3 }, noteText: { color: "#52604B", fontSize: 10, lineHeight: 14, flex: 1 }, footer: { paddingHorizontal: 22, paddingBottom: 8 }, primaryButton: { minHeight: 52, borderRadius: 16, backgroundColor: "#151B14", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 }, primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, loading: { color: "#5E7D00", fontSize: 12, fontWeight: "800", marginTop: 12 }, errorTitle: { color: "#151B14", fontSize: 20, fontWeight: "900", textAlign: "center" }, errorCopy: { color: "#697065", fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 7 }, pressed: { opacity: 0.68 },
});
