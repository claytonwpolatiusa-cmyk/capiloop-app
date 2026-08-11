import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useRef } from "react";

import { ScreenContainer } from "@/components/screen-container";

export default function CheckoutResultScreen() {
  const { reservationId, offerId, status } = useLocalSearchParams<{ reservationId?: string; offerId?: string; status?: string }>();
  const approved = status === "approved";
  const failed = status === "failed" || status === "failure";
  const title = approved ? "Pagamento aprovado" : failed ? "Pagamento não concluído" : "Pagamento em análise";
  const copy = approved ? "Sua sacola está garantida. Confira o código e o horário de retirada." : failed ? "Nenhuma cobrança foi confirmada. Você pode tentar outra sacola ou iniciar o pagamento novamente." : "Assim que o Mercado Pago confirmar a cobrança, sua reserva aparecerá como confirmada.";
  const actionLabel = approved ? "Ver horário de retirada" : failed ? "Tentar novamente" : "Acompanhar pagamento";
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }), Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true })]).start();
  }, [opacity, translateY]);

  const handlePrimaryAction = () => {
    if (failed && offerId) { router.replace({ pathname: "/offer/[id]", params: { id: offerId } }); return; }
    if (reservationId) { router.replace({ pathname: "/reservation/[id]", params: { id: reservationId } }); return; }
    router.replace("/(tabs)");
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6">
    <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.icon, approved && styles.approved, failed && styles.failed]}><MaterialIcons name={approved ? "check" : failed ? "close" : "schedule"} size={35} color="#151B14" /></View>
      <Text style={styles.title}>{title}</Text><Text style={styles.copy}>{copy}</Text>
      {status === "pending" ? <View style={styles.pendingNote}><MaterialIcons name="info-outline" size={16} color="#8A6400" /><Text style={styles.pendingText}>O status será atualizado assim que a confirmação chegar.</Text></View> : null}
      <Pressable onPress={handlePrimaryAction} style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}><Text style={styles.primaryText}>{actionLabel}</Text><MaterialIcons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable>
      <Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.62 }]}><Text style={styles.secondaryText}>Voltar para descobrir</Text></Pressable>
    </Animated.View>
  </ScreenContainer>;
}

const styles = StyleSheet.create({ content: { width: "100%", alignItems: "center" }, icon: { width: 82, height: 82, borderRadius: 29, backgroundColor: "#ECF6CD", alignItems: "center", justifyContent: "center" }, approved: { backgroundColor: "#A5DF00" }, failed: { backgroundColor: "#F7D7D4" }, title: { color: "#151B14", fontSize: 27, fontWeight: "900", letterSpacing: -0.9, marginTop: 22, textAlign: "center" }, copy: { color: "#697065", fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: "center", maxWidth: 310 }, pendingNote: { width: "100%", marginTop: 19, flexDirection: "row", gap: 9, alignItems: "center", padding: 13, borderRadius: 16, backgroundColor: "#FFF5DF" }, pendingText: { color: "#77540A", fontSize: 11, lineHeight: 16, fontWeight: "700", flex: 1 }, primary: { width: "100%", marginTop: 28, minHeight: 52, paddingHorizontal: 20, backgroundColor: "#151B14", borderRadius: 17, flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center" }, primaryPressed: { opacity: 0.86, transform: [{ scale: 0.98 }] }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" }, secondary: { padding: 15, marginTop: 7 }, secondaryText: { color: "#5E7D00", fontSize: 13, fontWeight: "900" } });
