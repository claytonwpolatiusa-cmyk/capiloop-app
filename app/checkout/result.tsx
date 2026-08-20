import * as Haptics from "expo-haptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { formatCurrency } from "@/lib/capiloop-data";
import { useCatalog } from "@/lib/catalog";
import { useCapiLoop } from "@/lib/capiloop-store";

export default function CheckoutResultScreen() {
  const { reservationId, status } = useLocalSearchParams<{ reservationId?: string; status?: string }>();
  const { reservations } = useCapiLoop();
  const { getOffer } = useCatalog();
  const badgeScale = useRef(new Animated.Value(0.7)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const approved = status === "approved";
  const failed = status === "failed" || status === "failure";
  const reservation = reservations.find((item) => item.id === reservationId);
  const offer = reservation?.offerSnapshot ?? getOffer(reservation?.offerId);
  const pickupTime = reservation?.pickupTime ?? offer?.pickupWindow;
  const title = approved ? "Pedido confirmado" : failed ? "Pagamento não concluído" : "Pedido recebido";
  const copy = approved ? "Sua sacola está garantida. Guarde este código para retirar no balcão." : failed ? "Nenhuma cobrança foi confirmada. Você pode iniciar outra reserva." : "Seu pedido foi criado. Assim que o pagamento for aprovado, sua retirada estará garantida.";

  useEffect(() => {
    Animated.parallel([
      Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 7 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    if (approved) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [approved, badgeScale, cardOpacity]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1">
      <View style={styles.content}>
        <Animated.View style={[styles.icon, approved && styles.approved, failed && styles.failed, { transform: [{ scale: badgeScale }] }]}>
          <MaterialIcons name={approved ? "check" : failed ? "close" : "schedule"} size={37} color="#151B14" />
        </Animated.View>
        <Text style={styles.eyebrow}>{approved ? "TUDO CERTO" : failed ? "TENTE NOVAMENTE" : "PAGAMENTO EM ANÁLISE"}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.copy}>{copy}</Text>

        {offer ? (
          <Animated.View style={[styles.orderCard, { opacity: cardOpacity, transform: [{ translateY: cardOpacity.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
            <View style={styles.orderTop}><View><Text style={styles.cardEyebrow}>SEU PEDIDO</Text><Text style={styles.store}>{offer.store}</Text><Text style={styles.subtitle}>{offer.subtitle}</Text></View><View style={styles.bagIcon}><MaterialIcons name="shopping-bag" size={22} color="#253000" /></View></View>
            <View style={styles.rule} />
            <View style={styles.detailRow}><MaterialIcons name="storefront" size={17} color="#5E7D00" /><View style={styles.detailCopy}><Text style={styles.detailLabel}>RETIRADA NO LOCAL</Text><Text style={styles.detailValue}>{pickupTime ?? "Horário a confirmar"} · {offer.address}</Text></View></View>
            <View style={styles.detailRow}><MaterialIcons name="payments" size={17} color="#5E7D00" /><View style={styles.detailCopy}><Text style={styles.detailLabel}>FORMA DE PAGAMENTO</Text><Text style={styles.detailValue}>{reservation?.paymentMethod ?? "Mercado Pago"}</Text></View>{offer.price ? <Text style={styles.amount}>{formatCurrency(offer.price)}</Text> : null}</View>
            <View style={styles.codeBox}><Text style={styles.codeLabel}>CÓDIGO DE RETIRADA</Text><Text style={styles.code}>{reservation?.code ?? "A caminho"}</Text>{!approved ? <Text style={styles.codeHint}>Ele será liberado após a confirmação do pagamento.</Text> : null}</View>
          </Animated.View>
        ) : null}
      </View>
      <View style={styles.footer}>
        {reservationId ? <Pressable onPress={() => router.replace({ pathname: "/reservation/[id]", params: { id: reservationId } })} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>{approved ? "Ver comprovante de retirada" : "Acompanhar meu pedido"}</Text><MaterialIcons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable> : null}
        <Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}><Text style={styles.secondaryText}>Voltar para descobrir</Text></Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 24, paddingTop: 20 },
  icon: { width: 82, height: 82, borderRadius: 29, backgroundColor: "#ECF6CD", alignItems: "center", justifyContent: "center", alignSelf: "center" },
  approved: { backgroundColor: "#A5DF00" }, failed: { backgroundColor: "#F7D7D4" },
  eyebrow: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 1.05, textAlign: "center", marginTop: 22 },
  title: { color: "#151B14", fontSize: 29, lineHeight: 34, letterSpacing: -1.1, fontWeight: "900", textAlign: "center", marginTop: 7 },
  copy: { color: "#697065", fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 9, paddingHorizontal: 8 },
  orderCard: { backgroundColor: "#FFFFFF", borderRadius: 25, padding: 18, borderWidth: 1, borderColor: "#E8ECE4", marginTop: 25, shadowColor: "#182314", shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  orderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, cardEyebrow: { color: "#8C9388", fontSize: 9, fontWeight: "900", letterSpacing: 0.7 }, store: { color: "#151B14", fontSize: 17, fontWeight: "900", marginTop: 4 }, subtitle: { color: "#697065", fontSize: 11, marginTop: 2 }, bagIcon: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#ECF6CD" },
  rule: { height: 1, backgroundColor: "#E8ECE4", marginVertical: 15 }, detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 9, marginTop: 11 }, detailCopy: { flex: 1 }, detailLabel: { color: "#8C9388", fontSize: 9, fontWeight: "900", letterSpacing: 0.65 }, detailValue: { color: "#283027", fontSize: 12, lineHeight: 17, fontWeight: "700", marginTop: 3 }, amount: { color: "#151B14", fontSize: 14, fontWeight: "900", marginTop: 7 },
  codeBox: { paddingVertical: 13, paddingHorizontal: 12, borderRadius: 17, backgroundColor: "#F4F8E8", marginTop: 17, alignItems: "center" }, codeLabel: { color: "#5E7D00", fontSize: 9, fontWeight: "900", letterSpacing: 0.75 }, code: { color: "#151B14", fontSize: 23, letterSpacing: 2.2, fontWeight: "900", marginTop: 4 }, codeHint: { color: "#697065", fontSize: 10, lineHeight: 14, textAlign: "center", marginTop: 5 },
  footer: { paddingHorizontal: 24, paddingBottom: 14, paddingTop: 10 }, primary: { minHeight: 53, borderRadius: 17, backgroundColor: "#151B14", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, secondary: { padding: 14, alignItems: "center" }, secondaryText: { color: "#5E7D00", fontSize: 13, fontWeight: "900" }, pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
