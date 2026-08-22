import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, FlatList, Image, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { formatCurrency, type Offer } from "@/lib/capiloop-data";

type NearbyOffersSheetProps = {
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
  onDismiss: () => void;
};

export function NearbyOffersSheet({ offers, isLoading, error, onDismiss }: NearbyOffersSheetProps) {
  const { height } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(120)).current;
  const sheetHeight = Math.min(Math.max(height * 0.49, 360), 460);

  useEffect(() => {
    translateY.setValue(Math.min(sheetHeight * 0.28, 128));
    const animation = Animated.timing(translateY, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [sheetHeight, translateY]);

  const settleAtTop = () => {
    Animated.timing(translateY, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  const dismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    Animated.timing(translateY, { toValue: sheetHeight + 24, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      if (finished) onDismiss();
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_event, gesture) => gesture.dy > 2 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => translateY.stopAnimation(),
        onPanResponderMove: (_event, gesture) => translateY.setValue(Math.min(sheetHeight, Math.max(0, gesture.dy))),
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dy > Math.max(72, sheetHeight * 0.18) || gesture.vy > 0.55) {
            dismiss();
            return;
          }
          settleAtTop();
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: settleAtTop,
      }),
    [sheetHeight, translateY],
  );

  return (
    <Animated.View style={[styles.sheet, { height: sheetHeight, transform: [{ translateY }] }]} accessibilityViewIsModal>
      <View {...panResponder.panHandlers} style={styles.dragArea} accessibilityLabel="Arraste a barra para baixo para continuar explorando">
        <View style={styles.handle} />
        <Text style={styles.dragHint}>Arraste para baixo para explorar</Text>
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>UMA BOA PRIMEIRA ESCOLHA</Text>
          <Text style={styles.title}>Mais perto de você</Text>
        </View>
        <Pressable onPress={dismiss} accessibilityRole="button" accessibilityLabel="Continuar explorando lojas" style={({ pressed }) => [styles.dismissButton, pressed && styles.pressed]}>
          <Text style={styles.dismissText}>Continuar</Text>
          <MaterialIcons name="keyboard-arrow-down" size={18} color="#253000" />
        </Pressable>
      </View>

      {offers.length > 0 ? (
        <FlatList
          horizontal
          data={offers}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cards}
          renderItem={({ item }) => <NearbyOfferCard offer={item} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><MaterialIcons name={error ? "cloud-off" : "shopping-bag"} size={19} color="#4A6410" /></View>
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTitle}>{isLoading ? "Buscando sacolas próximas" : error ? "Catálogo indisponível agora" : "As próximas sacolas aparecerão aqui"}</Text>
            <Text style={styles.emptyText}>{isLoading ? "Só um instante." : error ?? "Continue explorando enquanto novos parceiros publicam."}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

function NearbyOfferCard({ offer }: { offer: Offer }) {
  const isAvailable = offer.isAvailable !== false;
  const openOffer = () => {
    if (!isAvailable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    router.push({ pathname: "/offer/[id]", params: { id: offer.id } });
  };

  return (
    <Pressable disabled={!isAvailable} onPress={openOffer} accessibilityRole="button" accessibilityState={{ disabled: !isAvailable }} accessibilityLabel={isAvailable ? `Ver sacola próxima de ${offer.store}` : `${offer.store} está sem sacolas disponíveis`} style={({ pressed }) => [styles.card, { backgroundColor: offer.accent }, !isAvailable && styles.cardUnavailable, pressed && isAvailable && styles.pressed]}>
      <Image source={offer.image} style={[styles.cardImage, !isAvailable && styles.imageUnavailable]} />
      <View style={styles.cardContent}>
        <Text numberOfLines={1} style={styles.cardStore}>{offer.store}</Text>
        <View style={styles.metaRow}>
          <MaterialIcons name="near-me" size={12} color="#4F574E" />
          <Text style={styles.metaText}>{offer.distance}</Text>
          <MaterialIcons name="schedule" size={12} color="#4F574E" />
          <Text style={styles.metaText}>{offer.pickupWindow}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.price, !isAvailable && styles.textUnavailable]}>{isAvailable ? formatCurrency(offer.price) : "Esgotada"}</Text>
          <View style={[styles.plus, !isAvailable && styles.plusUnavailable]}><MaterialIcons name={isAvailable ? "add" : "block"} size={17} color="#FFFFFF" /></View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF", borderTopLeftRadius: 34, borderTopRightRadius: 34, paddingTop: 8, shadowColor: "#151B14", shadowOpacity: 0.18, shadowRadius: 26, shadowOffset: { width: 0, height: -8 }, elevation: 18, zIndex: 20 },
  dragArea: { alignItems: "center", minHeight: 48, justifyContent: "flex-start", paddingTop: 2 },
  handle: { width: 42, height: 5, borderRadius: 99, backgroundColor: "#DDE2D6", marginTop: 2 },
  dragHint: { color: "#8C9388", fontSize: 10, fontWeight: "700", marginTop: 5 },
  header: { marginHorizontal: 20, marginTop: 5, marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  eyebrow: { color: "#6F8421", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  title: { color: "#151B14", fontSize: 23, lineHeight: 28, fontWeight: "900", letterSpacing: -0.8, marginTop: 3 },
  dismissButton: { minHeight: 38, borderRadius: 14, paddingHorizontal: 10, backgroundColor: "#EEF6D0", flexDirection: "row", alignItems: "center", gap: 2 },
  dismissText: { color: "#253000", fontSize: 11, fontWeight: "900" },
  cards: { paddingLeft: 20, paddingRight: 8, gap: 12 },
  card: { width: 178, height: 198, borderRadius: 22, overflow: "hidden", shadowColor: "#182314", shadowOpacity: 0.1, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cardUnavailable: { backgroundColor: "#D9DDD6", shadowOpacity: 0 },
  cardImage: { width: "100%", height: 86, backgroundColor: "#F2F4F0" },
  imageUnavailable: { opacity: 0.32 },
  cardContent: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FFFFFF" },
  cardStore: { color: "#151B14", fontSize: 14, fontWeight: "900", letterSpacing: -0.3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 5 },
  metaText: { color: "#4F574E", fontSize: 9, fontWeight: "800", marginRight: 2 },
  priceRow: { marginTop: "auto", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { color: "#151B14", fontSize: 18, fontWeight: "900", letterSpacing: -0.7 },
  textUnavailable: { color: "#747A73", fontSize: 13 },
  plus: { width: 30, height: 30, borderRadius: 12, backgroundColor: "#151B14", alignItems: "center", justifyContent: "center" },
  plusUnavailable: { backgroundColor: "#8E958C" },
  emptyState: { borderRadius: 22, marginHorizontal: 20, padding: 18, backgroundColor: "#F4F8E8", flexDirection: "row", alignItems: "center", gap: 12 },
  emptyIcon: { height: 38, width: 38, borderRadius: 14, backgroundColor: "#E3F1B8", alignItems: "center", justifyContent: "center" },
  emptyContent: { flex: 1 },
  emptyTitle: { color: "#253000", fontSize: 13, fontWeight: "900" },
  emptyText: { color: "#5A6D1C", fontSize: 11, lineHeight: 16, marginTop: 2 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
