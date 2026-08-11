import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCatalog } from "@/lib/catalog";
import { useCapiLoop } from "@/lib/capiloop-store";

export default function ReservationSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reservations } = useCapiLoop();
  const { getOffer } = useCatalog();
  const reservation = reservations.find((item) => item.id === id);
  const offer = reservation?.offerSnapshot ?? getOffer(reservation?.offerId);
  const pending = reservation?.paymentStatus === "pending";
  const goToBag = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined); router.replace("/(tabs)/bag"); };
  if (!reservation || !offer) return <ScreenContainer className="items-center justify-center"><Text style={styles.missing}>Não foi possível localizar esta reserva.</Text></ScreenContainer>;
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1"><View style={styles.content}>
    <View style={[styles.successBadge, pending && styles.pendingBadge]}><MaterialIcons name={pending ? "schedule" : "check"} size={35} color="#151B14" /></View>
    <Text style={styles.eyebrow}>{pending ? "PAGAMENTO EM ANÁLISE" : "SACOLA GARANTIDA"}</Text><Text style={styles.title}>{pending ? "Quase lá." : "Boa escolha."}</Text>
    <Text style={styles.copy}>{pending ? "Estamos aguardando a confirmação do Mercado Pago. Você receberá a confirmação da sua sacola assim que o pagamento for aprovado." : <>Você salvou uma sacola de <Text style={styles.copyStrong}>{offer.store}</Text>. Prepare-se para uma surpresa saborosa.</>}</Text>
    <View style={styles.ticket}><View style={styles.ticketTop}><View><Text style={styles.ticketLabel}>RETIRADA</Text><Text style={styles.pickup}>{offer.pickupWindow}</Text><Text style={styles.address}>{offer.address}</Text></View><MaterialIcons name="shopping-bag" size={27} color="#151B14" /></View><View style={styles.dashed} /><Text style={styles.codeLabel}>SEU CÓDIGO</Text><Text style={styles.code}>{reservation.code}</Text></View>
  </View><View style={styles.footer}><Pressable onPress={goToBag} style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}><Text style={styles.primaryText}>Ver minha sacola</Text><MaterialIcons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable><Text style={styles.footerCopy}>Mostre o código no balcão somente após a confirmação do pagamento.</Text></View></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { flex: 1, paddingHorizontal: 25, justifyContent: "center", paddingBottom: 40 }, successBadge: { width: 76, height: 76, borderRadius: 28, backgroundColor: "#A5DF00", alignItems: "center", justifyContent: "center", marginBottom: 25 }, pendingBadge: { backgroundColor: "#F5BC73" }, eyebrow: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 }, title: { color: "#151B14", fontSize: 35, lineHeight: 40, letterSpacing: -1.7, fontWeight: "900", marginTop: 8 }, copy: { color: "#697065", fontSize: 14, lineHeight: 20, marginTop: 12 }, copyStrong: { color: "#151B14", fontWeight: "800" }, ticket: { backgroundColor: "#FFFFFF", borderRadius: 25, padding: 20, marginTop: 28, shadowColor: "#182314", shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 }, ticketTop: { flexDirection: "row", justifyContent: "space-between" }, ticketLabel: { color: "#697065", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 }, pickup: { color: "#151B14", fontSize: 22, letterSpacing: -0.6, fontWeight: "900", marginTop: 4 }, address: { color: "#697065", fontSize: 12, marginTop: 3 }, dashed: { borderTopWidth: 1, borderStyle: "dashed", borderColor: "#CAD1C5", marginVertical: 18 }, codeLabel: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 0.8, textAlign: "center" }, code: { color: "#151B14", fontSize: 28, fontWeight: "900", letterSpacing: 3, textAlign: "center", marginTop: 5 }, footer: { paddingHorizontal: 25, paddingBottom: 12 }, primaryButton: { backgroundColor: "#151B14", borderRadius: 17, minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" }, footerCopy: { color: "#8C9388", fontSize: 11, textAlign: "center", marginTop: 10 }, missing: { color: "#697065", fontSize: 14 } });
