import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { startOAuthLogin } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/capiloop-data";
import { useCatalog } from "@/lib/catalog";
import { useCapiLoop } from "@/lib/capiloop-store";
import { createTRPCClient } from "@/lib/trpc";
import { buildPickupSlots } from "@/lib/pickup-slots";

type PaymentMethod = "pix" | "apple-pay" | "card";

const paymentMethods: Array<{ id: PaymentMethod; label: string; description: string; icon: "qr-code-2" | "apple" | "credit-card" }> = [
  { id: "pix", label: "PIX", description: "Pague pelo QR Code no Mercado Pago", icon: "qr-code-2" },
  { id: "apple-pay", label: "Apple Pay", description: "Use quando estiver disponível no seu dispositivo", icon: "apple" },
  { id: "card", label: "Cartão de crédito", description: "Use um cartão salvo ou cadastre outro no Mercado Pago", icon: "credit-card" },
];

const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: "PIX",
  "apple-pay": "Apple Pay",
  card: "Cartão de crédito",
};

export default function ConfirmReservationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height, width } = useWindowDimensions();
  const isCompact = height < 720 || width < 365;
  const { getOffer, isLoading } = useCatalog();
  const { isAuthenticated } = useAuth();
  const { reserveOffer, recordRemoteReservation, updateRemoteReservationStatus } = useCapiLoop();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("pix");
  const [isContinuing, setIsContinuing] = useState(false);
  const offer = getOffer(id);
  const pickupSlots = offer ? buildPickupSlots(offer.pickupWindow) : [];
  const [pickupTime, setPickupTime] = useState(() => pickupSlots[0]?.value ?? "");
  const isReference = offer?.source === "reference";

  if (!offer) {
    return <ScreenContainer className="items-center justify-center px-8"><Text style={styles.missing}>{isLoading ? "Carregando a reserva…" : "Esta oferta não está mais disponível."}</Text></ScreenContainer>;
  }

  const confirmReservation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    if (isReference) {
      setIsContinuing(true);
      try {
        const reservation = await reserveOffer(offer, pickupTime);
        router.replace({ pathname: "/reservation/[id]", params: { id: reservation.id } });
      } finally {
        setIsContinuing(false);
      }
      return;
    }

    if (!isAuthenticated) {
      Alert.alert("Entre para continuar", "A reserva é vinculada à sua conta para proteger a retirada.", [
        { text: "Agora não", style: "cancel" },
        { text: "Fazer login", onPress: () => void startOAuthLogin() },
      ]);
      return;
    }

    const bagId = Number(offer.id);
    if (!Number.isSafeInteger(bagId) || bagId <= 0) {
      Alert.alert("Oferta indisponível", "Atualize o catálogo e tente novamente.");
      return;
    }

    setIsContinuing(true);
    try {
      const client = createTRPCClient();
      if (selectedMethod === "pix") {
        const result = await client.checkout.startPix.mutate({ bagId, pickupTime });
        await recordRemoteReservation({ id: String(result.reservation.id), offer, code: result.reservation.code, pickupTime, paymentMethod: paymentMethodLabels[selectedMethod] });
        if (result.payment.ticketUrl) {
          await WebBrowser.openBrowserAsync(result.payment.ticketUrl);
        } else {
          Alert.alert("PIX gerado", "Abra a aba Minhas sacolas para acompanhar a confirmação do pagamento.");
        }
        router.replace({ pathname: "/checkout/result", params: { reservationId: result.reservation.id, status: result.payment.status } });
        return;
      }
      const result = await client.checkout.startCheckoutPro.mutate({ bagId, pickupTime });
      await recordRemoteReservation({ id: String(result.reservation.id), offer, code: result.reservation.code, pickupTime, paymentMethod: paymentMethodLabels[selectedMethod] });

      if (Platform.OS === "web") {
        await WebBrowser.openBrowserAsync(result.preference.initPoint);
        router.replace({ pathname: "/checkout/result", params: { reservationId: result.reservation.id, status: "pending" } });
        return;
      }

      const response = await WebBrowser.openAuthSessionAsync(result.preference.initPoint, "capiloop://checkout/result");
      const returnedStatus = response.type === "success" && response.url ? new URL(response.url).searchParams.get("status") : "pending";
      await updateRemoteReservationStatus(String(result.reservation.id), returnedStatus === "approved" ? "confirmed" : returnedStatus === "failed" || returnedStatus === "failure" ? "failed" : "pending");
      router.replace({ pathname: "/checkout/result", params: { reservationId: result.reservation.id, status: returnedStatus ?? "pending" } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível iniciar o pagamento.";
      Alert.alert("Pagamento indisponível", message);
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1">
      <ScrollView contentContainerStyle={[styles.content, isCompact && styles.contentCompact]} showsVerticalScrollIndicator={false}>
        <View style={[styles.topBar, isCompact && styles.topBarCompact]}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.65 }]} accessibilityLabel="Voltar para a oferta"><MaterialIcons name="arrow-back" size={22} color="#151B14" /></Pressable>
          <Text style={styles.topTitle}>Confirmar reserva</Text>
          <View style={styles.topSpacer} />
        </View>

        <Text style={styles.eyebrow}>{isReference ? "EXPERIÊNCIA DE RESERVA" : "ÚLTIMA ETAPA"}</Text>
        <Text style={[styles.title, isCompact && styles.titleCompact]}>{isReference ? "Vamos guardar esta sacola?" : "Quer mesmo reservar esta sacola?"}</Text>
        <Text style={[styles.intro, isCompact && styles.introCompact]}>{isReference ? "Você verá o comprovante de retirada sem nenhuma cobrança." : "Revise a retirada e escolha como prefere concluir o pagamento."}</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeading}><View style={styles.bagIcon}><MaterialIcons name="shopping-bag" size={20} color="#151B14" /></View><View style={styles.summaryHeadingCopy}><Text style={styles.store}>{offer.store}</Text><Text style={styles.subtitle}>{offer.subtitle}</Text></View><Text style={styles.price}>{formatCurrency(offer.price)}</Text></View>
          <View style={styles.rule} />
          <View style={styles.infoRow}><MaterialIcons name="storefront" size={18} color="#5E7D00" /><View style={styles.infoCopy}><Text style={styles.infoLabel}>FORMA DE RECEBIMENTO</Text><Text style={styles.infoValue}>Retirada no local · sem delivery</Text></View></View>
          <View style={styles.infoRow}><MaterialIcons name="schedule" size={18} color="#5E7D00" /><View style={styles.infoCopy}><Text style={styles.infoLabel}>JANELA DE RETIRADA</Text><Text style={styles.infoValue}>Hoje, {offer.pickupWindow}</Text></View></View>
          <View style={styles.infoRow}><MaterialIcons name="location-on" size={18} color="#5E7D00" /><View style={styles.infoCopy}><Text style={styles.infoLabel}>LOCAL DE RETIRADA</Text><Text style={styles.infoValue}>{offer.address}</Text></View></View>
        </View>

        <Text style={styles.sectionTitle}>Que horas você retira?</Text>
        <Text style={styles.sectionCopy}>Selecione um horário dentro da janela da loja.</Text>
        <View style={styles.slotRow}>{pickupSlots.map((slot) => { const selected = pickupTime === slot.value; return <Pressable key={slot.value} onPress={() => setPickupTime(slot.value)} accessibilityRole="radio" accessibilityState={{ selected }} style={({ pressed }) => [styles.slot, selected && styles.slotSelected, pressed && { opacity: 0.75 }]}><Text style={[styles.slotText, selected && styles.slotTextSelected]}>{slot.label}</Text></Pressable>; })}</View>

        {isReference ? <View style={styles.note}><MaterialIcons name="info-outline" size={18} color="#5E7D00" /><Text style={styles.noteText}>Esta é uma oferta de referência. Ela gera um comprovante demonstrativo e não abre uma cobrança.</Text></View> : <>
          <Text style={styles.sectionTitle}>Como quer pagar?</Text>
          <Text style={styles.sectionCopy}>{selectedMethod === "pix" ? "O QR Code será gerado na próxima etapa." : "Você concluirá a opção escolhida no ambiente seguro do Mercado Pago."}</Text>
          <View style={styles.methods}>
            {paymentMethods.map((method) => {
              const selected = selectedMethod === method.id;
              return <Pressable key={method.id} onPress={() => setSelectedMethod(method.id)} accessibilityRole="radio" accessibilityState={{ selected }} style={({ pressed }) => [styles.methodCard, selected && styles.methodCardSelected, pressed && { opacity: 0.78 }]}>
                <View style={[styles.methodIcon, selected && styles.methodIconSelected]}><MaterialIcons name={method.icon} size={20} color="#151B14" /></View>
                <View style={styles.methodCopy}><Text style={styles.methodTitle}>{method.label}</Text><Text style={styles.methodDescription}>{method.description}</Text></View>
                <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
              </Pressable>;
            })}
          </View>
        </>}

        <View style={styles.security}><MaterialIcons name="lock-outline" size={16} color="#4A6410" /><Text style={styles.securityCopy}>{isReference ? "Você pode cancelar antes de concluir." : "A reserva só é confirmada após o retorno do pagamento aprovado."}</Text></View>
      </ScrollView>

      <View style={[styles.footer, isCompact && styles.footerCompact]}><View><Text style={styles.totalLabel}>{isReference ? "SEM COBRANÇA" : "TOTAL"}</Text><Text style={[styles.total, isCompact && styles.totalCompact]}>{isReference ? "Demonstração" : formatCurrency(offer.price)}</Text></View><Pressable disabled={isContinuing} onPress={() => void confirmReservation()} style={({ pressed }) => [styles.confirmButton, isCompact && styles.confirmButtonCompact, (pressed || isContinuing) && { opacity: 0.78, transform: [{ scale: 0.98 }] }]}><Text style={styles.confirmButtonText}>{isContinuing ? "Preparando…" : isReference ? "Confirmar demonstração" : "Reservar e continuar"}</Text><MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" /></Pressable></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 132 }, contentCompact: { paddingHorizontal: 16, paddingBottom: 122 }, topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, marginBottom: 30 }, topBarCompact: { marginBottom: 20 }, backButton: { width: 43, height: 43, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", alignItems: "center", justifyContent: "center" }, topTitle: { color: "#151B14", fontSize: 14, fontWeight: "900" }, topSpacer: { width: 43 }, eyebrow: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 1.05 }, title: { color: "#151B14", fontSize: 31, lineHeight: 36, letterSpacing: -1.35, fontWeight: "900", marginTop: 7 }, titleCompact: { fontSize: 27, lineHeight: 32, letterSpacing: -1.1 }, intro: { color: "#697065", fontSize: 14, lineHeight: 20, marginTop: 10 }, introCompact: { fontSize: 13, lineHeight: 18, marginTop: 8 }, summaryCard: { marginTop: 24, padding: 17, borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4" }, summaryHeading: { flexDirection: "row", alignItems: "center", gap: 11 }, bagIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: "#ECF6CD", alignItems: "center", justifyContent: "center" }, summaryHeadingCopy: { flex: 1 }, store: { color: "#151B14", fontSize: 15, fontWeight: "900" }, subtitle: { color: "#697065", fontSize: 11, marginTop: 2 }, price: { color: "#151B14", fontSize: 18, fontWeight: "900" }, rule: { height: 1, backgroundColor: "#E8ECE4", marginVertical: 16 }, infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 12 }, infoCopy: { flex: 1 }, infoLabel: { color: "#8C9388", fontSize: 9, fontWeight: "900", letterSpacing: 0.65 }, infoValue: { color: "#151B14", fontSize: 13, lineHeight: 18, fontWeight: "800", marginTop: 3 }, sectionTitle: { color: "#151B14", fontSize: 18, fontWeight: "900", marginTop: 28 }, sectionCopy: { color: "#697065", fontSize: 12, lineHeight: 17, marginTop: 4 }, slotRow: { flexDirection: "row", gap: 8, marginTop: 13 }, slot: { backgroundColor: "#FFFFFF", borderColor: "#E8ECE4", borderRadius: 14, borderWidth: 1, flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center" }, slotSelected: { backgroundColor: "#ECF6CD", borderColor: "#8DAF25" }, slotText: { color: "#697065", fontSize: 12, fontWeight: "900" }, slotTextSelected: { color: "#3B5000" }, methods: { gap: 10, marginTop: 15 }, methodCard: { minHeight: 73, flexDirection: "row", alignItems: "center", gap: 11, padding: 12, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4" }, methodCardSelected: { borderColor: "#8DAF25", backgroundColor: "#F8FCEB" }, methodIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#F2F4EF", alignItems: "center", justifyContent: "center" }, methodIconSelected: { backgroundColor: "#D7F07C" }, methodCopy: { flex: 1 }, methodTitle: { color: "#151B14", fontSize: 14, fontWeight: "900" }, methodDescription: { color: "#697065", fontSize: 10, lineHeight: 14, marginTop: 2 }, radio: { width: 21, height: 21, borderRadius: 11, borderWidth: 1.5, borderColor: "#C7CEC1", alignItems: "center", justifyContent: "center" }, radioSelected: { borderColor: "#5E7D00" }, radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: "#5E7D00" }, note: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 14, borderRadius: 16, backgroundColor: "#F4F8E8", marginTop: 24 }, noteText: { flex: 1, color: "#4A6410", fontSize: 11, lineHeight: 16, fontWeight: "700" }, security: { flexDirection: "row", gap: 8, alignItems: "center", paddingTop: 20 }, securityCopy: { flex: 1, color: "#697065", fontSize: 11, lineHeight: 16 }, footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E8ECE4", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, footerCompact: { paddingHorizontal: 16, paddingVertical: 11 }, totalLabel: { color: "#8C9388", fontSize: 9, fontWeight: "900", letterSpacing: 0.7 }, total: { color: "#151B14", fontSize: 20, fontWeight: "900", marginTop: 2 }, totalCompact: { fontSize: 18 }, confirmButton: { minHeight: 54, borderRadius: 17, paddingHorizontal: 15, backgroundColor: "#151B14", flexDirection: "row", alignItems: "center", gap: 7 }, confirmButtonCompact: { minHeight: 50, paddingHorizontal: 12 }, confirmButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" }, missing: { color: "#697065", fontSize: 14, textAlign: "center" },
});
