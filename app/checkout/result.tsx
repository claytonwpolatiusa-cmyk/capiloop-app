import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";

export default function CheckoutResultScreen() {
  const { reservationId, status } = useLocalSearchParams<{ reservationId?: string; status?: string }>();
  const approved = status === "approved";
  const failed = status === "failed" || status === "failure";
  const title = approved ? "Pagamento aprovado" : failed ? "Pagamento não concluído" : "Pagamento em análise";
  const copy = approved ? "Sua sacola está garantida. Confira o código e o horário de retirada." : failed ? "Nenhuma cobrança foi confirmada. Você pode tentar outra sacola ou iniciar o pagamento novamente." : "Assim que o Mercado Pago confirmar a cobrança, sua reserva aparecerá como confirmada.";
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6">
    <View style={[styles.icon, approved && styles.approved, failed && styles.failed]}><MaterialIcons name={approved ? "check" : failed ? "close" : "schedule"} size={35} color="#151B14" /></View>
    <Text style={styles.title}>{title}</Text><Text style={styles.copy}>{copy}</Text>
    {reservationId ? <Pressable onPress={() => router.replace({ pathname: "/reservation/[id]", params: { id: reservationId } })} style={styles.primary}><Text style={styles.primaryText}>Ver minha sacola</Text><MaterialIcons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable> : null}
    <Pressable onPress={() => router.replace("/(tabs)")} style={styles.secondary}><Text style={styles.secondaryText}>Voltar para descobrir</Text></Pressable>
  </ScreenContainer>;
}

const styles = StyleSheet.create({ icon: { width: 82, height: 82, borderRadius: 29, backgroundColor: "#ECF6CD", alignItems: "center", justifyContent: "center" }, approved: { backgroundColor: "#A5DF00" }, failed: { backgroundColor: "#F7D7D4" }, title: { color: "#151B14", fontSize: 27, fontWeight: "900", letterSpacing: -0.9, marginTop: 22, textAlign: "center" }, copy: { color: "#697065", fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: "center", maxWidth: 310 }, primary: { marginTop: 28, minHeight: 52, paddingHorizontal: 20, backgroundColor: "#151B14", borderRadius: 17, flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center" }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" }, secondary: { padding: 15, marginTop: 7 }, secondaryText: { color: "#5E7D00", fontSize: 13, fontWeight: "900" } });
