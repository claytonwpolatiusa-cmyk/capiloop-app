import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { formatCurrency } from "@/lib/capiloop-data";
import { useCatalog } from "@/lib/catalog";
import { useCapiLoop } from "@/lib/capiloop-store";
import { getVisibleReputation, hasEnoughSalesForPublicStats } from "@/lib/offer-reputation";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOffer, isLoading } = useCatalog();
  const offer = getOffer(id);
  const { reservations, isFavoriteStore, toggleFavoriteStore } = useCapiLoop();
  const [activeTab, setActiveTab] = useState<"details" | "photos">("details");
  const currentReservation = reservations.find((reservation) => reservation.offerId === id && reservation.paymentStatus !== "failed");
  const galleryImages = offer?.galleryImages?.length ? offer.galleryImages.slice(0, 3) : offer ? [offer.image] : [];
  const displayedGallery = Array.from({ length: 3 }, (_, index) => galleryImages[index % galleryImages.length] ?? offer?.image).filter(Boolean);

  if (!offer) {
    return <ScreenContainer className="items-center justify-center px-8"><Text className="text-center text-foreground">{isLoading ? "Atualizando oferta…" : "Esta sacola não está mais disponível."}</Text></ScreenContainer>;
  }

  const openReservationConfirmation = () => {
    if (currentReservation) {
      router.push({ pathname: "/reservation/[id]", params: { id: currentReservation.id } });
      return;
    }
    router.push({ pathname: "/offer/confirm", params: { id: offer.id } });
  };

  const reputation = getVisibleReputation(offer.reputation);
  const filledStars = reputation?.isEstablished ? Math.round(reputation.averageRating ?? 0) : 0;
  const canShowSoldBags = reputation ? hasEnoughSalesForPublicStats(reputation.soldBags) : false;
  const isAvailable = offer.isAvailable !== false;
  const isFavorite = isFavoriteStore(offer.store);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageWrap}>
          <Image source={offer.image} style={styles.image} />
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.62 }]} accessibilityLabel="Voltar"><MaterialIcons name="arrow-back" size={22} color="#151B14" /></Pressable>
          <Pressable onPress={() => void toggleFavoriteStore(offer.store)} style={({ pressed }) => [styles.favoriteButton, pressed && { opacity: 0.62 }]} accessibilityRole="button" accessibilityLabel={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}><MaterialIcons name={isFavorite ? "favorite" : "favorite-border"} size={21} color={isFavorite ? "#C83C3C" : "#151B14"} /></Pressable>
          <View style={styles.categoryPill}><Text style={styles.categoryText}>{offer.category.toUpperCase()}</Text></View>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}><View style={styles.titleInfo}><Text style={styles.store}>{offer.store}</Text><Text style={styles.bagType}>{offer.subtitle}</Text></View><View style={styles.stock}><Text style={styles.stockText}>{offer.stockLabel}</Text></View></View>
          <Text style={styles.expected}>{offer.expected}</Text>
          {!isAvailable ? <View style={styles.unavailableNotice}><MaterialIcons name="block" size={17} color="#697065" /><Text style={styles.unavailableText}>Esta loja não tem sacolas disponíveis hoje. Volte em breve para novas publicações.</Text></View> : null}
          {reputation ? <View style={styles.reputationCard} accessibilityLabel={reputation.isEstablished ? `Avaliação ${reputation.averageRating?.toFixed(1)} de 5 estrelas` : "Reputação em formação"}>
            <View style={styles.reputationHeading}>
              <View style={styles.reputationTitleBlock}>
                <Text style={styles.reputationEyebrow}>REPUTAÇÃO</Text>
                <Text style={styles.reputationTitle}>O que as pessoas acham daqui</Text>
              </View>
              {reputation.isEstablished ? <View style={styles.ratingBadge}>
                <View style={styles.stars}>{Array.from({ length: 5 }, (_, index) => <MaterialIcons key={index} name="star" size={15} color={index < filledStars ? "#D58A00" : "#DDE1D9"} />)}</View>
                <Text style={styles.ratingValue}>{reputation.averageRating?.toFixed(1)}</Text>
                <Text style={styles.ratingOutOf}>/5</Text>
              </View> : <View style={styles.collectingBadge}><MaterialIcons name="hourglass-empty" size={15} color="#66704F" /><Text style={styles.collectingText}>Em formação</Text></View>}
            </View>
            {canShowSoldBags ? <View style={styles.soldBagsRow}><MaterialIcons name="shopping-bag" size={15} color="#5E7D00" /><Text style={styles.soldBagsText}>{reputation.soldBags} sacolas vendidas</Text><Text style={styles.soldBagsRule}>Dados publicados após 40 vendas</Text></View> : <Text style={styles.reputationNotice}>As avaliações e o total de vendas aparecem quando o estabelecimento alcança dados suficientes.</Text>}
          </View> : null}
          <View style={styles.tabBar} accessibilityRole="tablist">
            <Pressable onPress={() => setActiveTab("details")} accessibilityRole="tab" accessibilityState={{ selected: activeTab === "details" }} style={({ pressed }) => [styles.tab, activeTab === "details" && styles.tabActive, pressed && styles.pressed]}><Text style={[styles.tabText, activeTab === "details" && styles.tabTextActive]}>Detalhes</Text></Pressable>
            <Pressable onPress={() => setActiveTab("photos")} accessibilityRole="tab" accessibilityState={{ selected: activeTab === "photos" }} style={({ pressed }) => [styles.tab, activeTab === "photos" && styles.tabActive, pressed && styles.pressed]}><MaterialIcons name="photo-library" size={15} color={activeTab === "photos" ? "#253000" : "#697065"} /><Text style={[styles.tabText, activeTab === "photos" && styles.tabTextActive]}>Fotos · 3</Text></Pressable>
          </View>
          {activeTab === "details" ? <>
            <View style={styles.metaCard}>
              <MetaRow icon="schedule" label="Retirada" value={`Hoje, ${offer.pickupWindow}`} />
              <View style={styles.metaDivider} />
              <MetaRow icon="location-on" label="Endereço" value={offer.address} />
            </View>
            <View style={styles.impactRow}><View style={styles.impactIcon}><MaterialIcons name="eco" size={19} color="#151B14" /></View><View style={styles.impactCopyBlock}><Text style={styles.impactTitle}>Uma escolha que faz diferença</Text><Text style={styles.impactCopy}>Esta sacola evita cerca de {offer.co2Kg.toFixed(1).replace(".", ",")} kg de CO₂.</Text></View></View>
            <View style={styles.paymentHint}><MaterialIcons name={offer.source === "reference" ? "info-outline" : "lock-outline"} size={16} color="#5E7D00" /><Text style={styles.paymentHintText}>{offer.source === "reference" ? "Oferta de referência para você explorar a experiência de reserva. A retirada é sempre no local." : "Somente retirada no local. Escolha o horário e pague por PIX, Apple Pay ou cartão no checkout."}</Text></View>
          </> : <View style={styles.gallerySection}>
            <Text style={styles.galleryTitle}>Fotos do estabelecimento</Text>
            <Text style={styles.galleryCopy}>Conheça um pouco mais do lugar antes de reservar.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
              {displayedGallery.map((image, index) => <Image key={`${offer.id}-gallery-${index}`} source={image} style={styles.galleryImage} accessibilityLabel={`Foto ${index + 1} de ${offer.store}`} />)}
            </ScrollView>
          </View>}
        </View>
      </ScrollView>
      <View style={styles.actionBar}>
        <View><Text style={styles.original}>{formatCurrency(offer.originalPrice)}</Text><Text style={styles.price}>{formatCurrency(offer.price)}</Text></View>
        <Pressable disabled={!isAvailable} onPress={openReservationConfirmation} style={({ pressed }) => [styles.reserveButton, !isAvailable && styles.reserveButtonDisabled, pressed && isAvailable && { opacity: 0.78, transform: [{ scale: 0.98 }] }]}><Text style={styles.reserveText}>{!isAvailable ? "Esgotada" : currentReservation ? "Ver reserva" : "Reservar"}</Text><MaterialIcons name={isAvailable ? "arrow-forward" : "block"} size={18} color="#FFFFFF" /></Pressable>
      </View>
    </ScreenContainer>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <View style={styles.metaRow}><View style={styles.metaIcon}><MaterialIcons name={icon as never} size={18} color="#5E7D00" /></View><View style={styles.metaTextBlock}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View></View>;
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 145 }, imageWrap: { height: 305, backgroundColor: "#E3E9DE" }, image: { height: "100%", width: "100%" }, backButton: { position: "absolute", top: 14, left: 18, height: 43, width: 43, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.94)", alignItems: "center", justifyContent: "center" }, favoriteButton: { position: "absolute", top: 14, right: 18, height: 43, width: 43, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.94)", alignItems: "center", justifyContent: "center" }, categoryPill: { position: "absolute", bottom: 15, left: 20, backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 }, categoryText: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 0.8 }, body: { paddingHorizontal: 20, paddingTop: 23 }, titleRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, titleInfo: { flex: 1 }, store: { color: "#151B14", fontSize: 27, lineHeight: 32, fontWeight: "900", letterSpacing: -1.2 }, bagType: { color: "#697065", fontSize: 13, marginTop: 4 }, stock: { alignSelf: "flex-start", borderRadius: 11, backgroundColor: "#F4F8E8", paddingHorizontal: 9, paddingVertical: 6 }, stockText: { color: "#5E7D00", fontSize: 10, fontWeight: "900" }, expected: { color: "#4F574E", fontSize: 14, lineHeight: 20, marginTop: 17 }, unavailableNotice: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginTop: 15, padding: 13, borderRadius: 16, backgroundColor: "#F0F1EF" }, unavailableText: { color: "#697065", flex: 1, fontSize: 11, fontWeight: "700", lineHeight: 16 }, reputationCard: { marginTop: 20, backgroundColor: "#F7FAED", borderRadius: 20, padding: 15, borderWidth: 1, borderColor: "#E5EDCF" }, reputationHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, reputationTitleBlock: { flex: 1 }, reputationEyebrow: { color: "#6B7F25", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 }, reputationTitle: { color: "#151B14", fontSize: 14, fontWeight: "900", marginTop: 3 }, ratingBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 7, borderRadius: 12, backgroundColor: "#FFFFFF" }, stars: { flexDirection: "row" }, ratingValue: { color: "#895A00", fontSize: 14, fontWeight: "900", marginLeft: 2 }, ratingOutOf: { color: "#8C9388", fontSize: 10, fontWeight: "800" }, collectingBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 7, borderRadius: 12, backgroundColor: "#EEF2E8" }, collectingText: { color: "#66704F", fontSize: 10, fontWeight: "800" }, soldBagsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 13 }, soldBagsText: { color: "#334312", fontSize: 12, fontWeight: "900" }, soldBagsRule: { color: "#7B866A", fontSize: 10, fontWeight: "700", marginLeft: "auto" }, reputationNotice: { color: "#697065", fontSize: 11, lineHeight: 16, marginTop: 12 }, tabBar: { flexDirection: "row", marginTop: 22, padding: 4, borderRadius: 15, backgroundColor: "#F2F4F0", gap: 4 }, tab: { flex: 1, minHeight: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 5 }, tabActive: { backgroundColor: "#FFFFFF", shadowColor: "#182314", shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1 }, tabText: { color: "#697065", fontSize: 12, fontWeight: "800" }, tabTextActive: { color: "#253000", fontWeight: "900" }, metaCard: { backgroundColor: "#FFFFFF", borderRadius: 21, padding: 16, marginTop: 15, borderWidth: 1, borderColor: "#E8ECE4" }, metaRow: { flexDirection: "row", gap: 11, alignItems: "center" }, metaIcon: { width: 36, height: 36, borderRadius: 13, backgroundColor: "#ECF6CD", alignItems: "center", justifyContent: "center" }, metaTextBlock: { flex: 1 }, metaLabel: { color: "#697065", fontSize: 10, fontWeight: "800" }, metaValue: { color: "#151B14", fontSize: 13, lineHeight: 18, fontWeight: "800", marginTop: 2 }, metaDivider: { height: 1, backgroundColor: "#E8ECE4", marginVertical: 14 }, gallerySection: { marginTop: 15 }, galleryTitle: { color: "#151B14", fontSize: 16, fontWeight: "900", letterSpacing: -0.4 }, galleryCopy: { color: "#697065", fontSize: 12, marginTop: 3 }, galleryRow: { gap: 10, paddingTop: 13, paddingRight: 20 }, galleryImage: { width: 174, height: 136, borderRadius: 18, backgroundColor: "#E3E9DE" }, impactRow: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 19, padding: 15, borderRadius: 19, backgroundColor: "#F4F8E8" }, impactIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#A5DF00", alignItems: "center", justifyContent: "center" }, impactCopyBlock: { flex: 1 }, impactTitle: { color: "#151B14", fontSize: 13, fontWeight: "900" }, impactCopy: { color: "#4A6410", fontSize: 11, marginTop: 2 }, paymentHint: { flexDirection: "row", gap: 9, alignItems: "center", marginTop: 15, padding: 13, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4" }, paymentHintText: { flex: 1, color: "#4F574E", fontSize: 11, lineHeight: 16, fontWeight: "700" }, actionBar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E8ECE4", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, original: { color: "#8C9388", fontSize: 11, fontWeight: "700", textDecorationLine: "line-through" }, price: { color: "#151B14", fontSize: 24, fontWeight: "900", letterSpacing: -1 }, reserveButton: { backgroundColor: "#151B14", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 17, paddingVertical: 15, borderRadius: 16 }, reserveButtonDisabled: { backgroundColor: "#929892" }, reserveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
