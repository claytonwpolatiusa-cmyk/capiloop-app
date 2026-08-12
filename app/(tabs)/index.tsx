import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { OfferCard } from "@/components/offer-card";
import { ScreenContainer } from "@/components/screen-container";
import { categories, type OfferCategory } from "@/lib/capiloop-data";
import { useCapiLoop } from "@/lib/capiloop-store";
import { useCatalog } from "@/lib/catalog";

export default function DiscoverScreen() {
  const { impact } = useCapiLoop();
  const { offers, isLoading, error, isReferenceCatalog, refresh } = useCatalog();
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory | "Todas">("Todas");
  const displayedOffers = useMemo(
    () => selectedCategory === "Todas" ? offers : offers.filter((offer) => offer.category === selectedCategory),
    [offers, selectedCategory],
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

            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color="#5E7D00" />
              <Text style={styles.locationText}>Centro, Curitiba</Text>
              <MaterialIcons name="keyboard-arrow-down" size={18} color="#697065" />
            </View>

            <View style={styles.hero}>
              <Text style={styles.eyebrow}>SACOLAS PERTO DE VOCÊ</Text>
              <Text style={styles.heroTitle}>Resgate uma boa surpresa hoje.</Text>
              <Text style={styles.heroCopy}>Escolha uma categoria e encontre a próxima retirada disponível.</Text>
            </View>

            <View style={styles.impactCard}>
              <View style={styles.impactIcon}><MaterialIcons name="eco" size={19} color="#151B14" /></View>
              <Text style={styles.impactValue}>{impact.co2Kg.toFixed(1).replace(".", ",")} kg de CO₂ evitados</Text>
              <Text style={styles.impactCopy}>{impact.savedBags} sacolas salvas</Text>
            </View>

            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Encontre sua sacola</Text></View>
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

            {isReferenceCatalog ? (
              <View style={styles.referenceNotice}>
                <MaterialIcons name="info-outline" size={17} color="#5E7D00" />
                <Text style={styles.referenceText}>Veja exemplos de sacolas locais enquanto novos parceiros publicam as próximas retiradas.</Text>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>{selectedCategory === "Todas" ? "Sacolas disponíveis" : selectedCategory}</Text>
                <Text style={styles.sectionSubtitle}>{isReferenceCatalog ? "Inspire-se e volte para ver novas publicações." : "Reserve agora e retire no horário indicado."}</Text>
              </View>
              <Text style={styles.countText}>{displayedOffers.length} {displayedOffers.length === 1 ? "sacola" : "sacolas"}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name={error ? "cloud-off" : "shopping-bag"} size={27} color="#5E7D00" />
            <Text style={styles.emptyTitle}>{selectedCategory !== "Todas" ? "Nenhuma sacola nesta categoria" : error ? "Não foi possível atualizar" : isLoading ? "Carregando sacolas" : "Ainda não há sacolas"}</Text>
            <Text style={styles.emptyText}>{selectedCategory !== "Todas" ? "Escolha outra categoria para ver mais opções." : error ?? "Quando um parceiro publicar uma sacola, ela aparecerá aqui."}</Text>
            {error ? <Pressable onPress={() => void refresh()} style={styles.retry}><Text style={styles.retryText}>Tentar novamente</Text></Pressable> : null}
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24, flexGrow: 1 },
  topbar: { marginHorizontal: 20, marginTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { height: 40, width: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4" },
  pressed: { opacity: 0.6 },
  locationRow: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginLeft: 20, marginTop: 20, gap: 3 },
  locationText: { color: "#4F574E", fontSize: 13, fontWeight: "700" },
  hero: { marginHorizontal: 20, marginTop: 17 },
  eyebrow: { color: "#5E7D00", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  heroTitle: { color: "#151B14", fontSize: 28, lineHeight: 33, letterSpacing: -1.25, fontWeight: "900", marginTop: 7, maxWidth: 320 },
  heroCopy: { color: "#697065", fontSize: 14, lineHeight: 20, marginTop: 9 },
  impactCard: { marginHorizontal: 20, marginTop: 18, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 10, backgroundColor: "#EDF8C8", flexDirection: "row", alignItems: "center", gap: 8 },
  impactIcon: { height: 28, width: 28, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#A5DF00" },
  impactValue: { color: "#253000", fontSize: 12, fontWeight: "900", flex: 1 },
  impactCopy: { color: "#5A6D1C", fontSize: 11, fontWeight: "700" },
  sectionHeader: { marginHorizontal: 20, marginTop: 27, marginBottom: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.65 },
  sectionSubtitle: { color: "#697065", fontSize: 12, marginTop: 3 },
  countText: { color: "#5E7D00", fontSize: 12, fontWeight: "800", maxWidth: 86, textAlign: "right" },
  categories: { paddingLeft: 20, paddingRight: 12, gap: 10 },
  categoryItem: { alignItems: "center", width: 72, gap: 7, paddingBottom: 3 },
  categoryItemActive: { opacity: 1 },
  categoryIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", alignItems: "center", justifyContent: "center" },
  categoryIconActive: { backgroundColor: "#A5DF00", borderColor: "#A5DF00" },
  categoryText: { color: "#4F574E", fontSize: 11, fontWeight: "700" },
  categoryTextActive: { color: "#151B14", fontWeight: "900" },
  referenceNotice: { marginHorizontal: 20, marginTop: 20, padding: 12, gap: 8, borderRadius: 15, backgroundColor: "#F4F8E8", borderWidth: 1, borderColor: "#DFECC4", flexDirection: "row", alignItems: "flex-start" },
  referenceText: { flex: 1, color: "#4E5D21", fontSize: 11, lineHeight: 16, fontWeight: "600" },
  empty: { alignItems: "center", paddingHorizontal: 42, paddingVertical: 34, gap: 8 },
  emptyTitle: { color: "#151B14", fontSize: 16, fontWeight: "900", marginTop: 4 },
  emptyText: { color: "#697065", fontSize: 12, lineHeight: 18, textAlign: "center" },
  retry: { backgroundColor: "#151B14", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 13, marginTop: 6 },
  retryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
});
