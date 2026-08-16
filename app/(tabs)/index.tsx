import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { OfferCard } from "@/components/offer-card";
import { ScreenContainer } from "@/components/screen-container";
import { categories, type OfferCategory } from "@/lib/capiloop-data";
import { useCapiLoop } from "@/lib/capiloop-store";
import { useCatalog } from "@/lib/catalog";
import { filterOffersByStore } from "@/lib/offer-search";
import { sortOffers, type OfferSort } from "@/lib/offer-sort";

export default function DiscoverScreen() {
  const { impact } = useCapiLoop();
  const { offers, isLoading, error, isReferenceCatalog, refresh } = useCatalog();
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory | "Todas">("Todas");
  const [sortBy, setSortBy] = useState<OfferSort>("distance");
  const [storeQuery, setStoreQuery] = useState("");
  const displayedOffers = useMemo(
    () => sortOffers(filterOffersByStore(selectedCategory === "Todas" ? offers : offers.filter((offer) => offer.category === selectedCategory), storeQuery), sortBy),
    [offers, selectedCategory, sortBy, storeQuery],
  );

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <FlatList
        data={displayedOffers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OfferCard offer={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} tintColor="#5E7D00" />}
        ListHeaderComponent={
          <View>
            <View style={styles.topbar}>
              <CapiLoopBrand />
              <Pressable accessibilityLabel="Notificações" style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                <MaterialIcons name="notifications-none" size={22} color="#151B14" />
              </Pressable>
            </View>

            <Pressable onPress={() => router.push("/(tabs)/explore")} style={({ pressed }) => [styles.locationRow, pressed && styles.pressed]} accessibilityLabel="Abrir mapa de ofertas">
              <View style={styles.locationIcon}><MaterialIcons name="location-on" size={15} color="#4A6410" /></View>
              <View><Text style={styles.locationLabel}>SACOLAS PERTO DE VOCÊ</Text><Text style={styles.locationText}>Centro, Curitiba</Text></View>
              <MaterialIcons name="keyboard-arrow-right" size={21} color="#697065" />
            </Pressable>

            <View style={styles.hero}>
              <View style={styles.heroAccent}><Text style={styles.heroAccentText}>HOJE</Text></View>
              <Text style={styles.heroTitle}>Sua próxima surpresa{`\n`}está por perto.</Text>
              <Text style={styles.heroCopy}>Reserve em poucos toques e retire no horário indicado.</Text>
              <Pressable onPress={() => router.push("/(tabs)/explore")} style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]}><MaterialIcons name="map" size={17} color="#151B14" /><Text style={styles.mapButtonText}>Ver no mapa</Text><MaterialIcons name="arrow-forward" size={16} color="#151B14" /></Pressable>
            </View>

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
              <View><Text style={styles.sectionTitle}>Escolha o que combina hoje</Text><Text style={styles.sectionSubtitle}>Toque em uma categoria para filtrar.</Text></View>
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
                  <View style={[styles.categoryIcon, selectedCategory === item.label && styles.categoryIconActive]}><MaterialIcons name={item.icon as never} size={20} color="#151B14" /></View>
                  <Text style={[styles.categoryText, selectedCategory === item.label && styles.categoryTextActive]}>{item.label}</Text>
                </Pressable>
              )}
            />

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.availableTitle}>{storeQuery ? `Resultados por estabelecimento` : selectedCategory === "Todas" ? "Disponíveis agora" : selectedCategory}</Text>
                <Text style={styles.sectionSubtitle}>{storeQuery ? `Buscando por “${storeQuery}”` : isReferenceCatalog ? "Sacolas de exemplo para conhecer o CapiLoop." : "Reserve antes que acabem."}</Text>
              </View>
              <Text style={styles.countText}>{displayedOffers.length} {displayedOffers.length === 1 ? "sacola" : "sacolas"}</Text>
            </View>
            <View style={styles.sortBar} accessibilityLabel="Ordenar sacolas">
              <Text style={styles.sortLabel}>Ordenar por</Text>
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
        ListFooterComponent={displayedOffers.length > 0 ? <View style={styles.impactCard}><View style={styles.impactIcon}><MaterialIcons name="eco" size={18} color="#253000" /></View><View style={styles.impactText}><Text style={styles.impactValue}>Seu impacto até agora</Text><Text style={styles.impactCopy}>{impact.savedBags} sacolas salvas · {impact.co2Kg.toFixed(1).replace(".", ",")} kg de CO₂ evitados</Text></View><MaterialIcons name="arrow-forward" size={18} color="#5E7D00" /></View> : null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24, flexGrow: 1 },
  topbar: { marginHorizontal: 20, marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { height: 42, width: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4" },
  pressed: { opacity: 0.6 },
  locationRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginTop: 22, gap: 9 },
  locationIcon: { height: 30, width: 30, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF6D0" },
  locationLabel: { color: "#8C9388", fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  locationText: { color: "#4F574E", fontSize: 13, fontWeight: "800", marginTop: 1, flex: 1 },
  hero: { marginHorizontal: 20, marginTop: 15, borderRadius: 28, padding: 22, backgroundColor: "#1B2417", overflow: "hidden" },
  heroAccent: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#B8E231" },
  heroAccentText: { color: "#273313", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  heroTitle: { color: "#FFFFFF", fontSize: 29, lineHeight: 34, letterSpacing: -1.35, fontWeight: "900", marginTop: 13 },
  heroCopy: { color: "#D6DBD1", fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 245 },
  mapButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#B8E231", marginTop: 19 },
  mapButtonText: { color: "#151B14", fontSize: 12, fontWeight: "900" },
  searchBox: { minHeight: 52, marginHorizontal: 20, marginTop: 14, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", flexDirection: "row", alignItems: "center", gap: 10 },
  searchInput: { flex: 1, minHeight: 48, color: "#151B14", fontSize: 14, fontWeight: "700", paddingVertical: 0 },
  clearSearch: { height: 30, width: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F2F4F0" },
  discoveryHeader: { marginHorizontal: 20, marginTop: 27, marginBottom: 13 },
  sectionHeader: { marginHorizontal: 20, marginTop: 26, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#151B14", fontSize: 18, fontWeight: "900", letterSpacing: -0.6 },
  availableTitle: { color: "#151B14", fontSize: 21, fontWeight: "900", letterSpacing: -0.85 },
  sectionSubtitle: { color: "#697065", fontSize: 12, marginTop: 3 },
  countText: { color: "#4A6410", fontSize: 11, fontWeight: "900", borderRadius: 10, backgroundColor: "#EEF6D0", paddingHorizontal: 9, paddingVertical: 6, maxWidth: 88, textAlign: "right" },
  sortBar: { marginHorizontal: 20, padding: 5, borderRadius: 14, backgroundColor: "#F2F4F0", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sortLabel: { color: "#697065", fontSize: 11, fontWeight: "800", marginLeft: 8 },
  sortOptions: { flexDirection: "row", gap: 4 },
  sortOption: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, borderRadius: 10 },
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
  referenceNotice: { marginHorizontal: 20, marginTop: 2, padding: 11, gap: 8, borderRadius: 14, backgroundColor: "#F4F8E8", flexDirection: "row", alignItems: "center" },
  referenceText: { flex: 1, color: "#4E5D21", fontSize: 11, lineHeight: 16, fontWeight: "600" },
  impactCard: { marginHorizontal: 20, marginTop: 8, borderRadius: 19, padding: 14, backgroundColor: "#EDF8C8", flexDirection: "row", alignItems: "center", gap: 10 },
  impactIcon: { height: 34, width: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#C9EC64" },
  impactText: { flex: 1 },
  impactValue: { color: "#253000", fontSize: 12, fontWeight: "900" },
  impactCopy: { color: "#5A6D1C", fontSize: 10, fontWeight: "700", marginTop: 2 },
  empty: { alignItems: "center", paddingHorizontal: 42, paddingVertical: 34, gap: 8 },
  emptyTitle: { color: "#151B14", fontSize: 16, fontWeight: "900", marginTop: 4 },
  emptyText: { color: "#697065", fontSize: 12, lineHeight: 18, textAlign: "center" },
  retry: { backgroundColor: "#151B14", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 13, marginTop: 6 },
  retryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
});
