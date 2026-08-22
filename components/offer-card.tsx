import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { formatCurrency, type Offer } from "@/lib/capiloop-data";
import { getVisibleReputation, hasEnoughSalesForPublicStats, REPUTATION_HIGHLIGHTS } from "@/lib/offer-reputation";

export function OfferCard({ offer, variant = "large" }: { offer: Offer; variant?: "large" | "compact" }) {
  const compact = variant === "compact";
  const savings = Math.round((1 - offer.price / offer.originalPrice) * 100);
  const reputation = getVisibleReputation(offer.reputation);
  const filledStars = reputation?.averageRating === null ? 0 : Math.round(reputation?.averageRating ?? 0);
  const isAvailable = offer.isAvailable !== false;

  const openOffer = () => {
    if (!isAvailable) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    router.push({ pathname: "/offer/[id]", params: { id: offer.id } });
  };

  return (
    <Pressable disabled={!isAvailable} onPress={openOffer} accessibilityRole="button" accessibilityState={{ disabled: !isAvailable }} accessibilityLabel={isAvailable ? `Ver sacola de ${offer.store}` : `${offer.store} está sem sacolas disponíveis`} style={({ pressed }) => [styles.card, compact && styles.cardCompact, !isAvailable && styles.cardUnavailable, pressed && isAvailable && styles.pressed]}>
      <Image source={offer.image} style={[styles.image, compact && styles.imageCompact, !isAvailable && styles.imageUnavailable]} />
      <View style={[styles.content, compact && styles.contentCompact]}>
        <View style={styles.topline}>
          <Text numberOfLines={1} style={styles.store}>{offer.store}</Text>
          <View style={[styles.stockPill, !isAvailable && styles.stockPillUnavailable]}>
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
          <Text style={[styles.price, !isAvailable && styles.textUnavailable]}>{isAvailable ? formatCurrency(offer.price) : "Indisponível"}</Text>
          <Text style={styles.originalPrice}>{formatCurrency(offer.originalPrice)}</Text>
          <Text style={styles.savings}>{savings}% off</Text>
        </View>
        {reputation ? (
          <View style={styles.reputationBlock}>
            <View style={styles.reputationTopline}>
              {reputation.isEstablished ? (
                <View style={styles.ratingRow} accessibilityLabel={`Avaliação ${reputation.averageRating?.toFixed(1)} de 5 estrelas`}>
                  <View style={styles.stars}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <MaterialIcons key={index} name="star" size={13} color={index < filledStars ? "#D58A00" : "#DDE1D9"} />
                    ))}
                  </View>
                  <Text style={styles.ratingValue}>{reputation.averageRating?.toFixed(1)}</Text>
                </View>
              ) : (
                <Text style={styles.collectingText}>Reputação em formação</Text>
              )}
              {hasEnoughSalesForPublicStats(reputation.soldBags) ? <View style={styles.soldRow}>
                <MaterialIcons name="shopping-bag" size={12} color="#697065" />
                <Text style={styles.soldText}>{reputation.soldBags} sacolas vendidas</Text>
              </View> : null}
            </View>
            {reputation.isEstablished && !compact ? (
              <View style={styles.highlightsList}>
                {reputation.highlights.slice(0, 2).map((highlight) => (
                  <View key={highlight} style={styles.highlightItem}>
                    <View style={styles.highlightBullet} />
                    <Text numberOfLines={1} style={styles.highlightText}>{REPUTATION_HIGHLIGHTS[highlight]}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
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
    minHeight: 166,
    overflow: "hidden",
    shadowColor: "#182314",
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEF1EB",
    flexDirection: "row",
  },
  cardCompact: { marginHorizontal: 0, marginBottom: 12, minHeight: 128 },
  cardUnavailable: { backgroundColor: "#F0F1EF", shadowOpacity: 0, borderColor: "#E3E6E0" },
  pressed: { opacity: 0.77, transform: [{ scale: 0.987 }] },
  image: { width: 124, height: "100%", backgroundColor: "#EEF0EB" },
  imageCompact: { width: 104 },
  imageUnavailable: { opacity: 0.34 },
  content: { flex: 1, padding: 14, justifyContent: "space-between" },
  contentCompact: { padding: 12 },
  topline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  store: { color: "#151B14", fontSize: 16, fontWeight: "800", letterSpacing: -0.25, flex: 1 },
  stockPill: { backgroundColor: "#ECF6C5", borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  stockPillUnavailable: { backgroundColor: "#E0E3DE" },
  stockText: { color: "#5E7D00", fontSize: 10, fontWeight: "800" },
  subtitle: { color: "#697065", fontSize: 12, marginTop: 2 },
  detailsRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  detailText: { color: "#697065", fontSize: 11, fontWeight: "600" },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#BEC4B9", marginHorizontal: 2 },
  pricingRow: { flexDirection: "row", alignItems: "baseline", gap: 7, marginTop: 7 },
  price: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.7 },
  textUnavailable: { color: "#7C8378", fontSize: 14 },
  originalPrice: { color: "#8C9388", fontSize: 11, textDecorationLine: "line-through" },
  savings: { color: "#5E7D00", fontSize: 11, fontWeight: "800" },
  reputationBlock: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E9ECE5", marginTop: 8, paddingTop: 7, gap: 5 },
  reputationTopline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 7 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  stars: { flexDirection: "row" },
  ratingValue: { color: "#895A00", fontSize: 12, fontWeight: "900" },
  soldRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  soldText: { color: "#697065", fontSize: 10, fontWeight: "700" },
  collectingText: { color: "#8C9388", fontSize: 10, fontWeight: "700" },
  highlightsList: { gap: 3 },
  highlightItem: { alignItems: "center", flexDirection: "row", gap: 5 },
  highlightBullet: { backgroundColor: "#A5DF00", borderRadius: 3, height: 5, width: 5 },
  highlightText: { color: "#586052", fontSize: 10, fontWeight: "600", flex: 1 },
});
