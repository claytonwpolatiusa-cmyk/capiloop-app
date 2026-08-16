import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { formatCurrency, type Offer } from "@/lib/capiloop-data";

export function OfferCard({ offer, variant = "large" }: { offer: Offer; variant?: "large" | "compact" }) {
  const compact = variant === "compact";
  const savings = Math.round((1 - offer.price / offer.originalPrice) * 100);

  const openOffer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    router.push({ pathname: "/offer/[id]", params: { id: offer.id } });
  };

  return (
    <Pressable onPress={openOffer} accessibilityRole="button" accessibilityLabel={`Ver sacola de ${offer.store}`} style={({ pressed }) => [styles.card, compact && styles.cardCompact, pressed && styles.pressed]}>
      <Image source={offer.image} style={[styles.image, compact && styles.imageCompact]} />
      <View style={[styles.content, compact && styles.contentCompact]}>
        <View style={styles.topline}>
          <Text numberOfLines={1} style={styles.store}>{offer.store}</Text>
          <View style={styles.stockPill}>
            <Text style={styles.stockText}>{offer.stockLabel}</Text>
          </View>
        </View>
        <Text numberOfLines={1} style={styles.subtitle}>{offer.subtitle}</Text>
        <View style={styles.detailsRow}>
          <MaterialIcons name="near-me" size={13} color="#697065" />
          <Text style={styles.detailText}>{offer.distance}</Text>
          <View style={styles.dot} />
          <MaterialIcons name="schedule" size={13} color="#697065" />
          <Text style={styles.detailText}>{offer.pickupWindow}</Text>
        </View>
        <View style={styles.pricingRow}>
          <Text style={styles.price}>{formatCurrency(offer.price)}</Text>
          <Text style={styles.originalPrice}>{formatCurrency(offer.originalPrice)}</Text>
          <Text style={styles.savings}>{savings}% off</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 14,
    minHeight: 138,
    overflow: "hidden",
    shadowColor: "#182314",
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
    flexDirection: "row",
  },
  cardCompact: { marginHorizontal: 0, marginBottom: 12, minHeight: 112 },
  pressed: { opacity: 0.77, transform: [{ scale: 0.987 }] },
  image: { width: 124, height: "100%", backgroundColor: "#EEF0EB" },
  imageCompact: { width: 104 },
  content: { flex: 1, padding: 14, justifyContent: "space-between" },
  contentCompact: { padding: 12 },
  topline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  store: { color: "#151B14", fontSize: 16, fontWeight: "800", letterSpacing: -0.25, flex: 1 },
  stockPill: { backgroundColor: "#ECF6C5", borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  stockText: { color: "#5E7D00", fontSize: 10, fontWeight: "800" },
  subtitle: { color: "#697065", fontSize: 12, marginTop: 2 },
  detailsRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  detailText: { color: "#697065", fontSize: 11, fontWeight: "600" },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#BEC4B9", marginHorizontal: 2 },
  pricingRow: { flexDirection: "row", alignItems: "baseline", gap: 7, marginTop: 7 },
  price: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.7 },
  originalPrice: { color: "#8C9388", fontSize: 11, textDecorationLine: "line-through" },
  savings: { color: "#5E7D00", fontSize: 11, fontWeight: "800" },
});
