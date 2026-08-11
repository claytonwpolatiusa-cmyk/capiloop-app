import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { OfferCard } from "@/components/offer-card";
import { ScreenContainer } from "@/components/screen-container";
import { categories } from "@/lib/capiloop-data";
import { useCapiLoop } from "@/lib/capiloop-store";
import { useCatalog } from "@/lib/catalog";

export default function DiscoverScreen() {
  const { impact } = useCapiLoop();
  const { offers, isLoading, error, refresh } = useCatalog();

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OfferCard offer={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} tintColor="#5E7D00" />}
        ListHeaderComponent={
          <View>
            <View style={styles.topbar}>
              <CapiLoopBrand />
              <Pressable onPress={() => router.push("/(tabs)/bag")} accessibilityLabel="Abrir minhas sacolas" style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                <MaterialIcons name="shopping-bag" size={21} color="#151B14" />
              </Pressable>
            </View>

            <Pressable onPress={() => router.push("/(tabs)/explore")} style={({ pressed }) => [styles.locationRow, pressed && styles.pressed]} accessibilityLabel="Explorar sacolas no mapa">
              <MaterialIcons name="location-on" size={16} color="#5E7D00" />
              <Text style={styles.locationText}>Centro, Curitiba</Text>
              <MaterialIcons name="keyboard-arrow-down" size={18} color="#697065" />
            </Pressable>

            <View style={styles.hero}>
              <Text style={styles.eyebrow}>HOJE, PERTO DE VOCÊ</Text>
              <Text style={styles.heroTitle}>Comida boa.{"\n"}Fim do desperdício.</Text>
              <Text style={styles.heroCopy}>Sacolas reais, publicadas agora pelos parceiros CapiLoop.</Text>
            </View>

            <Pressable onPress={() => router.push("/(tabs)/impact")} style={({ pressed }) => [styles.impactCard, pressed && styles.cardPressed]} accessibilityLabel="Ver meu impacto">
              <View style={styles.impactIcon}><MaterialIcons name="bolt" size={22} color="#151B14" /></View>
              <View style={styles.impactTextBlock}>
                <Text style={styles.impactLabel}>SEU IMPACTO</Text>
                <Text style={styles.impactValue}>{impact.co2Kg.toFixed(1).replace(".", ",")} kg de CO₂ evitados</Text>
                <Text style={styles.impactCopy}>{impact.savedBags} sacolas salvas por você</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={21} color="#151B14" />
            </Pressable>

            <View style={styles.flowCard}>
              <View style={styles.flowCopy}><Text style={styles.flowTitle}>Reserve em três passos</Text><Text style={styles.flowText}>Escolha, pague com segurança e retire no horário indicado.</Text></View>
              <View style={styles.flowSteps}><Text style={styles.flowStep}>1</Text><MaterialIcons name="arrow-forward" size={13} color="#5E7D00" /><Text style={styles.flowStep}>2</Text><MaterialIcons name="arrow-forward" size={13} color="#5E7D00" /><Text style={styles.flowStep}>3</Text></View>
            </View>

            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>O que você procura?</Text></View>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item.label}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}
              renderItem={({ item }) => (
                <Pressable onPress={() => router.push("/(tabs)/explore")} accessibilityLabel={`Explorar sacolas de ${item.label}`} style={({ pressed }) => [styles.categoryItem, pressed && styles.pressed]}>
                  <View style={styles.categoryIcon}><MaterialIcons name={item.icon as never} size={21} color="#151B14" /></View>
                  <Text style={styles.categoryText}>{item.label}</Text>
                </Pressable>
              )}
            />

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Sacolas de hoje</Text>
                <Text style={styles.sectionSubtitle}>Disponibilidade publicada pelos restaurantes.</Text>
              </View>
              <Pressable onPress={() => router.push("/(tabs)/explore")} hitSlop={8} style={({ pressed }) => pressed && styles.pressed} accessibilityLabel="Ver ofertas no mapa"><Text style={styles.mapLink}>Ver no mapa</Text></Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name={error ? "cloud-off" : "shopping-bag"} size={27} color="#5E7D00" />
            <Text style={styles.emptyTitle}>{error ? "Não foi possível atualizar" : isLoading ? "Carregando sacolas" : "Ainda não há sacolas"}</Text>
            <Text style={styles.emptyText}>{error ?? "Quando um parceiro publicar uma sacola, ela aparecerá aqui."}</Text>
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
  heroTitle: { color: "#151B14", fontSize: 33, lineHeight: 38, letterSpacing: -1.6, fontWeight: "900", marginTop: 8 },
  heroCopy: { color: "#697065", fontSize: 14, lineHeight: 20, marginTop: 9 },
  impactCard: { marginHorizontal: 20, marginTop: 22, borderRadius: 22, padding: 16, backgroundColor: "#A5DF00", flexDirection: "row", alignItems: "center", gap: 12 },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  impactIcon: { height: 39, width: 39, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.52)" },
  impactTextBlock: { flex: 1 },
  impactLabel: { color: "#405500", fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  impactValue: { color: "#151B14", fontSize: 14, fontWeight: "900", marginTop: 3 },
  impactCopy: { color: "#425500", fontSize: 11, fontWeight: "700", marginTop: 2 },
  flowCard: { marginHorizontal: 20, marginTop: 11, padding: 15, borderRadius: 18, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", flexDirection: "row", alignItems: "center", gap: 12 },
  flowCopy: { flex: 1 }, flowTitle: { color: "#151B14", fontSize: 13, fontWeight: "900" }, flowText: { color: "#697065", fontSize: 11, lineHeight: 15, marginTop: 3 },
  flowSteps: { flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: 2 }, flowStep: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#ECF6CD", color: "#425500", fontSize: 10, fontWeight: "900", textAlign: "center", lineHeight: 20 },
  sectionHeader: { marginHorizontal: 20, marginTop: 27, marginBottom: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.65 },
  sectionSubtitle: { color: "#697065", fontSize: 12, marginTop: 3 },
  countText: { color: "#5E7D00", fontSize: 12, fontWeight: "800", maxWidth: 86, textAlign: "right" },
  mapLink: { color: "#5E7D00", fontSize: 12, fontWeight: "900" },
  categories: { paddingLeft: 20, paddingRight: 12, gap: 10 },
  categoryItem: { alignItems: "center", width: 72, gap: 7 },
  categoryIcon: { width: 57, height: 57, borderRadius: 19, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", alignItems: "center", justifyContent: "center" },
  categoryText: { color: "#4F574E", fontSize: 11, fontWeight: "700" },
  empty: { alignItems: "center", paddingHorizontal: 42, paddingVertical: 34, gap: 8 },
  emptyTitle: { color: "#151B14", fontSize: 16, fontWeight: "900", marginTop: 4 },
  emptyText: { color: "#697065", fontSize: 12, lineHeight: 18, textAlign: "center" },
  retry: { backgroundColor: "#151B14", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 13, marginTop: 6 },
  retryText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
});
