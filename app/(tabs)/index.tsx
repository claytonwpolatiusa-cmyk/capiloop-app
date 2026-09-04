import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { CapiLoopMascot } from "@/components/capiloop-mascot";
import { MotionReveal } from "@/components/motion-reveal";
import { NearbyOffersSheet } from "@/components/nearby-offers-sheet";
import { OfferCard } from "@/components/offer-card";
import { ScreenContainer } from "@/components/screen-container";
import { TactilePressable } from "@/components/tactile-pressable";
import { categories, type OfferCategory } from "@/lib/capiloop-data";
import { useCapiLoop } from "@/lib/capiloop-store";
import { useCatalog } from "@/lib/catalog";
import { filterOffersByStore } from "@/lib/offer-search";
import { sortOffers, type OfferSort } from "@/lib/offer-sort";
import { getNearbyOffers } from "@/lib/nearby-offers";
import { getFavoriteAvailabilityAlerts } from "@/lib/favorite-alerts";

export default function DiscoverScreen() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isCompact = height < 720 || width < 365;
  const { impact, favoriteStores, mutedFavoriteStores } = useCapiLoop();
  const { offers, isLoading, error, isReferenceCatalog, refresh } = useCatalog();
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory | "Todas">("Todas");
  const [sortBy, setSortBy] = useState<OfferSort>("distance");
  const [storeQuery, setStoreQuery] = useState("");
  const [isNearbySheetVisible, setIsNearbySheetVisible] = useState(true);
  const displayedOffers = useMemo(
    () => sortOffers(filterOffersByStore(selectedCategory === "Todas" ? offers : offers.filter((offer) => offer.category === selectedCategory), storeQuery), sortBy),
    [offers, selectedCategory, sortBy, storeQuery],
  );
  const nearbyOffers = useMemo(() => getNearbyOffers(offers), [offers]);
  const favoriteAlerts = useMemo(() => getFavoriteAvailabilityAlerts(offers, favoriteStores, mutedFavoriteStores), [favoriteStores, mutedFavoriteStores, offers]);
  const favoriteBagCount = useMemo(() => favoriteAlerts.reduce((total, alert) => total + alert.availableBags, 0), [favoriteAlerts]);

  return (
    <ScreenContainer edges={["left", "right"]} className="flex-1" containerClassName="bg-background" safeAreaClassName="bg-background">
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <FlatList
          data={displayedOffers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OfferCard offer={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} tintColor="#5E7D00" />}
          ListHeaderComponent={
            <View>
              <View style={[styles.topbar, isCompact && styles.topbarCompact]}>
                <CapiLoopBrand />
                <Pressable accessibilityLabel="Notificações" style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                  <MaterialIcons name="notifications-none" size={21} color="#151B14" />
                </Pressable>
              </View>

              <Pressable onPress={() => router.push("/(tabs)/explore")} style={({ pressed }) => [styles.locationRow, pressed && styles.pressed]} accessibilityLabel="Abrir mapa de ofertas">
                <View style={styles.locationIcon}><MaterialIcons name="location-on" size={16} color="#4A6410" /></View>
                <View><Text style={styles.locationLabel}>VOCÊ ESTÁ EM</Text><Text style={styles.locationText}>Centro, Curitiba</Text></View>
                <MaterialIcons name="keyboard-arrow-right" size={20} color="#697065" />
              </Pressable>

              <MotionReveal delay={50}>
                <View style={[styles.hero, isCompact && styles.heroCompact]}>
                  <View style={styles.heroGlow} />
                  <View style={styles.heroContent}>
                    <Text style={styles.heroEyebrow}>COMIDA BOA MERECE UM LOOP</Text>
                    <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}>Uma surpresa{`\n`}boa está perto.</Text>
                    <Text style={styles.heroCopy}>Resgate por menos, retire no horário certo e faça a comida circular.</Text>
                    <TactilePressable onPress={() => setIsNearbySheetVisible(true)} style={styles.nearbyButton} accessibilityLabel="Ver sacolas mais próximas">
                    <MaterialIcons name="near-me" size={16} color="#253000" />
                    <Text style={styles.nearbyButtonText}>Ver mais perto</Text>
                    </TactilePressable>
                  </View>
                  <CapiLoopMascot variant="nearby" style={[styles.mascot, isCompact && styles.mascotCompact]} accessibilityLabel="Capivara CapiLoop em uma sacola, apresentando ofertas próximas" />
                </View>
              </MotionReveal>

              <View style={styles.searchBox}>
              <MaterialIcons name="search" size={20} color="#697065" />
              <TextInput
                accessibilityLabel="Buscar por nome do estabelecimento"
                value={storeQuery}
                onChangeText={setStoreQuery}
                placeholder="Buscar estabelecimento"
                placeholderTextColor="#8C9388"
                returnKeyType="search"
                style={styles.searchInput}
              />
              {storeQuery ? (
                <Pressable onPress={() => setStoreQuery("")} accessibilityRole="button" accessibilityLabel="Limpar busca" style={({ pressed }) => [styles.clearSearch, pressed && styles.pressed]}>
                  <MaterialIcons name="close" size={17} color="#4F574E" />
                </Pressable>
              ) : null}
              </View>

              <View style={styles.discoveryHeader}>
                <View><Text style={styles.sectionTitle}>O que combina hoje?</Text><Text style={styles.sectionSubtitle}>Escolha uma categoria ou explore tudo.</Text></View>
              </View>
              <FlatList
                horizontal
                data={[{ label: "Todas", icon: "apps" }, ...categories]}
                keyExtractor={(item) => item.label}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categories}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setSelectedCategory(item.label as OfferCategory | "Todas")}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedCategory === item.label }}
                    style={({ pressed }) => [styles.categoryItem, selectedCategory === item.label && styles.categoryItemActive, pressed && styles.pressed]}
                  >
                    <View style={[styles.categoryIcon, selectedCategory === item.label && styles.categoryIconActive]}><MaterialIcons name={item.icon as never} size={19} color="#151B14" /></View>
                    <Text style={[styles.categoryText, selectedCategory === item.label && styles.categoryTextActive]}>{item.label}</Text>
                  </Pressable>
                )}
              />

              {favoriteAlerts.length > 0 ? (
                <Pressable onPress={() => router.push("/favorites")} accessibilityRole="button" accessibilityLabel="Ver novas sacolas das lojas favoritada" style={({ pressed }) => [styles.favoriteAlert, pressed && styles.pressed]}>
                  <View style={styles.favoriteAlertIcon}><MaterialIcons name="favorite" size={18} color="#9A2548" /></View>
                  <View style={styles.favoriteAlertCopy}>
                    <Text style={styles.favoriteAlertTitle}>{favoriteBagCount === 1 ? "Nova sacola em uma loja favorita" : `${favoriteBagCount} sacolas em lojas favoritas`}</Text>
                    <Text style={styles.favoriteAlertText}>{favoriteAlerts.length === 1 ? `${favoriteAlerts[0].store} acabou de ficar disponível.` : "Uma seleção que você salvou está disponível agora."}</Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={19} color="#9A2548" />
                </Pressable>
              ) : null}

              {!isNearbySheetVisible ? (
                <Pressable onPress={() => setIsNearbySheetVisible(true)} style={({ pressed }) => [styles.reopenNearby, pressed && styles.pressed]} accessibilityLabel="Mostrar sacolas próximas">
                  <View style={styles.reopenIcon}><MaterialIcons name="near-me" size={16} color="#4A6410" /></View>
                  <View style={styles.reopenCopy}><Text style={styles.reopenTitle}>As mais perto de você</Text><Text style={styles.reopenText}>Veja uma seleção rápida antes de explorar.</Text></View>
                  <MaterialIcons name="keyboard-arrow-up" size={20} color="#4A6410" />
                </Pressable>
              ) : null}

              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.availableTitle}>{storeQuery ? "Resultados por estabelecimento" : selectedCategory === "Todas" ? "Lojas para descobrir" : selectedCategory}</Text>
                  <Text style={styles.sectionSubtitle}>{storeQuery ? `Buscando por “${storeQuery}”` : isReferenceCatalog ? "Sacolas de exemplo para conhecer o CapiLoop." : "Reserve antes que acabem."}</Text>
                </View>
                <Text style={styles.countText}>{displayedOffers.length} {displayedOffers.length === 1 ? "sacola" : "sacolas"}</Text>
              </View>
              <View style={styles.sortBar} accessibilityLabel="Ordenar sacolas">
                <Text style={styles.sortLabel}>Ordenar</Text>
                <View style={styles.sortOptions}>
                  <Pressable onPress={() => setSortBy("distance")} accessibilityRole="button" accessibilityState={{ selected: sortBy === "distance" }} style={({ pressed }) => [styles.sortOption, sortBy === "distance" && styles.sortOptionActive, pressed && styles.pressed]}>
                    <MaterialIcons name="near-me" size={14} color={sortBy === "distance" ? "#253000" : "#697065"} /><Text style={[styles.sortOptionText, sortBy === "distance" && styles.sortOptionTextActive]}>Distância</Text>
                  </Pressable>
                  <Pressable onPress={() => setSortBy("pickup")} accessibilityRole="button" accessibilityState={{ selected: sortBy === "pickup" }} style={({ pressed }) => [styles.sortOption, sortBy === "pickup" && styles.sortOptionActive, pressed && styles.pressed]}>
                    <MaterialIcons name="schedule" size={14} color={sortBy === "pickup" ? "#253000" : "#697065"} /><Text style={[styles.sortOptionText, sortBy === "pickup" && styles.sortOptionTextActive]}>Horário</Text>
                  </Pressable>
                  <Pressable onPress={() => setSortBy("price")} accessibilityRole="button" accessibilityState={{ selected: sortBy === "price" }} style={({ pressed }) => [styles.sortOption, sortBy === "price" && styles.sortOptionActive, pressed && styles.pressed]}>
                    <MaterialIcons name="sell" size={14} color={sortBy === "price" ? "#253000" : "#697065"} /><Text style={[styles.sortOptionText, sortBy === "price" && styles.sortOptionTextActive]}>Preço</Text>
                  </Pressable>
                </View>
              </View>
              {isReferenceCatalog ? <View style={styles.referenceNotice}><MaterialIcons name="auto-awesome" size={16} color="#4A6410" /><Text style={styles.referenceText}>Novas sacolas reais aparecerão aqui assim que parceiros publicarem.</Text></View> : null}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name={error ? "cloud-off" : "shopping-bag"} size={27} color="#5E7D00" />
              <Text style={styles.emptyTitle}>{storeQuery ? "Nenhum estabelecimento encontrado" : selectedCategory !== "Todas" ? "Nenhuma sacola nesta categoria" : error ? "Não foi possível atualizar" : isLoading ? "Carregando sacolas" : "Ainda não há sacolas"}</Text>
              <Text style={styles.emptyText}>{storeQuery ? "Tente buscar por outro nome ou limpe a busca para ver todas as sacolas." : selectedCategory !== "Todas" ? "Escolha outra categoria para ver mais opções." : error ?? "Quando um parceiro publicar uma sacola, ela aparecerá aqui."}</Text>
              {storeQuery ? <Pressable onPress={() => setStoreQuery("")} style={styles.retry}><Text style={styles.retryText}>Limpar busca</Text></Pressable> : null}
              {error ? <Pressable onPress={() => void refresh()} style={styles.retry}><Text style={styles.retryText}>Tentar novamente</Text></Pressable> : null}
            </View>
          }
          ListFooterComponent={displayedOffers.length > 0 ? (
            <View style={styles.footer}>
              <View style={styles.impactCard}><View style={styles.impactIcon}><MaterialIcons name="eco" size={18} color="#253000" /></View><View style={styles.impactText}><Text style={styles.impactValue}>Seu impacto até agora</Text><Text style={styles.impactCopy}>{impact.savedBags} sacolas salvas · {impact.co2Kg.toFixed(1).replace(".", ",")} kg de CO₂ evitados</Text></View><MaterialIcons name="arrow-forward" size={18} color="#5E7D00" /></View>
              <Pressable onPress={() => router.push("/(tabs)/explore")} accessibilityRole="button" accessibilityLabel="Explorar ofertas no mapa" style={({ pressed }) => [styles.exploreMore, pressed && styles.pressed]}>
                <View style={styles.exploreMoreIcon}><MaterialIcons name="map" size={19} color="#253000" /></View>
                <View style={styles.exploreMoreCopy}><Text style={styles.exploreMoreTitle}>Quer ampliar a busca?</Text><Text style={styles.exploreMoreText}>Veja todas as ofertas no mapa.</Text></View>
                <MaterialIcons name="arrow-forward" size={18} color="#4A6410" />
              </Pressable>
            </View>
          ) : null}
        />
        {isNearbySheetVisible ? <NearbyOffersSheet offers={nearbyOffers} isLoading={isLoading} error={error} onDismiss={() => setIsNearbySheetVisible(false)} /> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, width: "100%", maxWidth: 560, alignSelf: "center" },
  content: { paddingBottom: 132, flexGrow: 1, paddingTop: 14 },
  contentCompact: { paddingTop: 6, paddingBottom: 112 },
  topbar: { marginHorizontal: 20, marginTop: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topbarCompact: { marginHorizontal: 16 },
  iconButton: { height: 42, width: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", shadowColor: "#182314", shadowOpacity: 0.04, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  pressed: { opacity: 0.6 },
  locationRow: { alignSelf: "center", flexDirection: "row", alignItems: "center", marginTop: 17, gap: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, backgroundColor: "#F0F5E3" },
  locationIcon: { height: 27, width: 27, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  locationLabel: { color: "#8C9388", fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  locationText: { color: "#4F574E", fontSize: 13, fontWeight: "800", marginTop: 1 },
  hero: { minHeight: 220, marginHorizontal: 20, marginTop: 18, borderRadius: 30, padding: 22, backgroundColor: "#E7F4C8", overflow: "hidden" },
  heroCompact: { minHeight: 202, marginHorizontal: 16, marginTop: 14, borderRadius: 25, padding: 18 },
  heroGlow: { position: "absolute", height: 220, width: 220, borderRadius: 110, backgroundColor: "#D0ED76", right: -76, top: -76 },
  heroContent: { position: "relative", zIndex: 2, maxWidth: "63%" },
  heroEyebrow: { color: "#4A6410", fontSize: 9, fontWeight: "900", letterSpacing: 0.75 },
  heroTitle: { color: "#151B14", fontSize: 29, lineHeight: 33, letterSpacing: -1.4, fontWeight: "900", marginTop: 10 },
  heroTitleCompact: { fontSize: 26, lineHeight: 30, marginTop: 8 },
  heroCopy: { color: "#4F574E", fontSize: 12, lineHeight: 17, marginTop: 8 },
  nearbyButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 9, backgroundColor: "#B8E231", marginTop: 15 },
  nearbyButtonText: { color: "#253000", fontSize: 11, fontWeight: "900" },
  mascot: { position: "absolute", right: -4, bottom: -14, width: 156, height: 193, zIndex: 1 },
  mascotCompact: { right: -10, bottom: -18, width: 142, height: 176 },
  searchBox: { minHeight: 52, marginHorizontal: 20, marginTop: 16, paddingHorizontal: 14, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", flexDirection: "row", alignItems: "center", gap: 10, shadowColor: "#182314", shadowOpacity: 0.04, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  searchInput: { flex: 1, minHeight: 48, color: "#151B14", fontSize: 14, fontWeight: "700", paddingVertical: 0 },
  clearSearch: { height: 30, width: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F2F4F0" },
  discoveryHeader: { marginHorizontal: 20, marginTop: 26, marginBottom: 13, alignItems: "center" },
  favoriteAlert: { marginHorizontal: 20, marginTop: 18, padding: 13, borderRadius: 19, flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: "#FFF3F5", borderWidth: 1, borderColor: "#F3D2DC" },
  favoriteAlertIcon: { height: 38, width: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFE0E8" },
  favoriteAlertCopy: { flex: 1 },
  favoriteAlertTitle: { color: "#5F1B31", fontSize: 13, fontWeight: "900" },
  favoriteAlertText: { color: "#8A5264", fontSize: 11, lineHeight: 15, marginTop: 2 },
  sectionHeader: { marginHorizontal: 20, marginTop: 25, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  sectionTitle: { color: "#151B14", fontSize: 18, fontWeight: "900", letterSpacing: -0.6 },
  availableTitle: { color: "#151B14", fontSize: 21, fontWeight: "900", letterSpacing: -0.85 },
  sectionSubtitle: { color: "#697065", fontSize: 12, marginTop: 3 },
  countText: { color: "#4A6410", fontSize: 11, fontWeight: "900", borderRadius: 10, backgroundColor: "#EEF6D0", paddingHorizontal: 9, paddingVertical: 6, maxWidth: 88, textAlign: "right" },
  sortBar: { marginHorizontal: 20, padding: 5, borderRadius: 14, backgroundColor: "#F2F4F0", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sortLabel: { color: "#697065", fontSize: 11, fontWeight: "800", marginLeft: 8 },
  sortOptions: { flex: 1, flexDirection: "row", gap: 3, justifyContent: "flex-end" },
  sortOption: { flex: 1, minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 4, borderRadius: 10 },
  sortOptionActive: { backgroundColor: "#FFFFFF", shadowColor: "#1B2417", shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  sortOptionText: { color: "#697065", fontSize: 11, fontWeight: "800" },
  sortOptionTextActive: { color: "#253000", fontWeight: "900" },
  categories: { paddingLeft: 20, paddingRight: 14, gap: 10 },
  categoryItem: { alignItems: "center", width: 70, gap: 7, paddingBottom: 3 },
  categoryItemActive: { opacity: 1 },
  categoryIcon: { width: 53, height: 53, borderRadius: 17, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", alignItems: "center", justifyContent: "center" },
  categoryIconActive: { backgroundColor: "#B8E231", borderColor: "#B8E231" },
  categoryText: { color: "#4F574E", fontSize: 11, fontWeight: "700" },
  categoryTextActive: { color: "#151B14", fontWeight: "900" },
  reopenNearby: { marginHorizontal: 20, marginTop: 23, borderRadius: 19, padding: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", flexDirection: "row", alignItems: "center", gap: 10 },
  reopenIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF6D0" },
  reopenCopy: { flex: 1 },
  reopenTitle: { color: "#253000", fontSize: 12, fontWeight: "900" },
  reopenText: { color: "#697065", fontSize: 10, marginTop: 2 },
  referenceNotice: { marginHorizontal: 20, marginTop: 2, padding: 11, gap: 8, borderRadius: 14, backgroundColor: "#F4F8E8", flexDirection: "row", alignItems: "center" },
  referenceText: { flex: 1, color: "#4E5D21", fontSize: 11, lineHeight: 16, fontWeight: "600" },
  footer: { paddingBottom: 8 },
  impactCard: { marginHorizontal: 20, marginTop: 8, borderRadius: 19, padding: 14, backgroundColor: "#EDF8C8", flexDirection: "row", alignItems: "center", gap: 10 },
  impactIcon: { height: 34, width: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#C9EC64" },
  impactText: { flex: 1 },
  impactValue: { color: "#253000", fontSize: 12, fontWeight: "900" },
  impactCopy: { color: "#5A6D1C", fontSize: 10, fontWeight: "700", marginTop: 2 },
  exploreMore: { marginHorizontal: 20, marginTop: 13, borderRadius: 19, padding: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", flexDirection: "row", alignItems: "center", gap: 11 },
  exploreMoreIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#E7F4C8", alignItems: "center", justifyContent: "center" },
  exploreMoreCopy: { flex: 1 },
  exploreMoreTitle: { color: "#151B14", fontSize: 13, fontWeight: "900" },
  exploreMoreText: { color: "#697065", fontSize: 11, marginTop: 2 },
  empty: { alignItems: "center", paddingHorizontal: 42, paddingVertical: 34, gap: 8 },
  emptyTitle: { color: "#151B14", fontSize: 16, fontWeight: "900", marginTop: 4 },
  emptyText: { color: "#697065", fontSize: 12, lineHeight: 18, textAlign: "center" },
  retry: { backgroundColor: "#151B14", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 13, marginTop: 6 },
  retryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
});
