import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCatalog } from "@/lib/catalog";
import { useCapiLoop } from "@/lib/capiloop-store";
import { trpc } from "@/lib/trpc";

export default function ReservationSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reservations, updateReservationDispute } = useCapiLoop();
  const { getOffer } = useCatalog();
  const reservation = reservations.find((item) => item.id === id);
  const offer = reservation?.offerSnapshot ?? getOffer(reservation?.offerId);
  const pending = reservation?.paymentStatus === "pending";
  const disputeMutation = trpc.disputes.create.useMutation();
  const submitIssue = async (reason: "bag_unavailable" | "pickup_issue") => {
    if (!reservation || !/^\d+$/.test(reservation.id)) {
      Alert.alert("Reserva local", "Este comprovante ainda não está vinculado a uma reserva online.");
      return;
    }
    try {
      const result = await disputeMutation.mutateAsync({ reservationId: Number(reservation.id), reason });
      const status = String((result as { status?: string }).status ?? "under_review") as NonNullable<NonNullable<typeof reservation.disputeStatus>>;
      const refundStatus = String((result as { refundStatus?: string }).refundStatus ?? "pending") as NonNullable<typeof reservation.refundStatus>;
      await updateReservationDispute(reservation.id, status, refundStatus);
      Alert.alert(
        refundStatus === "completed" ? "Reembolso iniciado" : "Problema registrado",
        refundStatus === "completed" ? "O Mercado Pago recebeu o pedido de reembolso. Acompanhe o prazo no seu banco." : "Nossa equipe acompanhará este caso e atualizará o status do pedido.",
      );
    } catch (error) {
      Alert.alert("Não foi possível registrar", error instanceof Error ? error.message : "Tente novamente em instantes.");
    }
  };
  const openIssueMenu = () => Alert.alert("Reportar problema", "Escolha o que aconteceu com esta retirada.", [
    { text: "Cancelar", style: "cancel" },
    { text: "Sacola indisponível", onPress: () => { void submitIssue("bag_unavailable"); } },
    { text: "Problema na retirada", onPress: () => { void submitIssue("pickup_issue"); } },
  ]);
  const goToBag = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined); router.replace("/(tabs)/bag"); };
  if (!reservation || !offer) return <ScreenContainer className="items-center justify-center"><Text style={styles.missing}>Não foi possível localizar esta reserva.</Text></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1"><View style={styles.content}>
    <View style={[styles.successBadge, pending && styles.pendingBadge]}><MaterialIcons name={pending ? "schedule" : "check"} size={35} color="#151B14" /></View>
    <Text style={styles.eyebrow}>{pending ? "PAGAMENTO EM ANÁLISE" : "SACOLA GARANTIDA"}</Text><Text style={styles.title}>{pending ? "Quase lá." : "Boa escolha."}</Text>
    <Text style={styles.copy}>{pending ? "Estamos aguardando a confirmação do Mercado Pago. Você receberá a confirmação da sua sacola assim que o pagamento for aprovado." : <>Você salvou uma sacola de <Text style={styles.copyStrong}>{offer.store}</Text>. Prepare-se para uma surpresa saborosa.</>}</Text>
    <View style={styles.ticket}><View style={styles.ticketTop}><View><Text style={styles.ticketLabel}>RETIRADA</Text><Text style={styles.pickup}>{offer.pickupWindow}</Text><Text style={styles.address}>{offer.address}</Text></View><MaterialIcons name="shopping-bag" size={27} color="#151B14" /></View><View style={styles.dashed} /><Text style={styles.codeLabel}>SEU CÓDIGO</Text><Text style={styles.code}>{reservation.code}</Text></View>
  </View><View style={styles.footer}><Pressable onPress={goToBag} style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}><Text style={styles.primaryText}>Ver minha sacola</Text><MaterialIcons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable>{reservation.disputeStatus ? <View style={styles.issueStatus}><MaterialIcons name="info-outline" size={17} color="#5E7D00" /><Text style={styles.issueStatusText}>{reservation.refundStatus === "completed" ? "Reembolso solicitado ao Mercado Pago" : "Problema registrado para análise"}</Text></View> : <Pressable disabled={pending || disputeMutation.isPending} onPress={openIssueMenu} style={({ pressed }) => [styles.reportButton, pressed && styles.reportButtonPressed, (pending || disputeMutation.isPending) && styles.disabledButton]}>{disputeMutation.isPending ? <ActivityIndicator size="small" color="#5E7D00" /> : <MaterialIcons name="report-problem" size={17} color="#5E7D00" />}<Text style={styles.reportText}>{disputeMutation.isPending ? "Registrando problema..." : "Reportar problema com esta retirada"}</Text></Pressable>}<Text style={styles.footerCopy}>Mostre o código no balcão somente após a confirmação do pagamento.</Text></View></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { flex: 1, paddingHorizontal: 25, justifyContent: "center", paddingBottom: 40 }, successBadge: { width: 76, height: 76, borderRadius: 28, backgroundColor: "#A5DF00", alignItems: "center", justifyContent: "center", marginBottom: 25 }, pendingBadge: { backgroundColor: "#F5BC73" }, eyebrow: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 }, title: { color: "#151B14", fontSize: 35, lineHeight: 40, letterSpacing: -1.7, fontWeight: "900", marginTop: 8 }, copy: { color: "#697065", fontSize: 14, lineHeight: 20, marginTop: 12 }, copyStrong: { color: "#151B14", fontWeight: "800" }, ticket: { backgroundColor: "#FFFFFF", borderRadius: 25, padding: 20, marginTop: 28, shadowColor: "#182314", shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 }, ticketTop: { flexDirection: "row", justifyContent: "space-between" }, ticketLabel: { color: "#697065", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 }, pickup: { color: "#151B14", fontSize: 22, letterSpacing: -0.6, fontWeight: "900", marginTop: 4 }, address: { color: "#697065", fontSize: 12, marginTop: 3 }, dashed: { borderTopWidth: 1, borderStyle: "dashed", borderColor: "#CAD1C5", marginVertical: 18 }, codeLabel: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 0.8, textAlign: "center" }, code: { color: "#151B14", fontSize: 28, fontWeight: "900", letterSpacing: 3, textAlign: "center", marginTop: 5 },   footer: { paddingHorizontal: 25, paddingBottom: 12 }, reportButton: { minHeight: 46, borderRadius: 15, borderWidth: 1, borderColor: "#CAD1C5", marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, reportButtonPressed: { opacity: 0.72 }, disabledButton: { opacity: 0.5 }, reportText: { color: "#5E7D00", fontSize: 12, fontWeight: "800" }, issueStatus: { minHeight: 46, borderRadius: 15, backgroundColor: "#F0F6E5", marginTop: 10, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, issueStatusText: { color: "#4D611C", fontSize: 12, fontWeight: "800" }, primaryButton: { backgroundColor: "#151B14", borderRadius: 17, minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" }, footerCopy: { color: "#8C9388", fontSize: 11, textAlign: "center", marginTop: 10 }, missing: { color: "#697065", fontSize: 14 } });
