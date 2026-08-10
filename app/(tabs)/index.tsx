import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { OfferCard } from "@/components/offer-card";
import { ScreenContainer } from "@/components/screen-container";
import { categories, offers } from "@/lib/capiloop-data";
import { useCapiLoop } from "@/lib/capiloop-store";

export default function DiscoverScreen() {
  const { impact } = useCapiLoop();

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OfferCard offer={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
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
              <Text style={styles.eyebrow}>HOJE, PERTO DE VOCÊ</Text>
              <Text style={styles.heroTitle}>Comida boa.{"\n"}Fim do desperdício.</Text>
              <Text style={styles.heroCopy}>Surpreenda-se com sabores incríveis por menos.</Text>
            </View>

            <View style={styles.impactCard}>
              <View style={styles.impactIcon}><MaterialIcons name="bolt" size={22} color="#151B14" /></View>
              <View style={styles.impactTextBlock}>
                <Text style={styles.impactLabel}>SEU IMPACTO</Text>
                <Text style={styles.impactValue}>{impact.co2Kg.toFixed(1).replace(".", ",")} kg de CO₂ evitados</Text>
                <Text style={styles.impactCopy}>{impact.savedBags} sacolas salvas por você</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={21} color="#151B14" />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>O que você procura?</Text>
            </View>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(item) => item.label}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}
              renderItem={({ item }) => (
                <View style={styles.categoryItem}>
                  <View style={styles.categoryIcon}><MaterialIcons name={item.icon as never} size={21} color="#151B14" /></View>
                  <Text style={styles.categoryText}>{item.label}</Text>
                </View>
              )}
            />

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Sacolas de hoje</Text>
                <Text style={styles.sectionSubtitle}>Retire ainda hoje e economize muito.</Text>
              </View>
              <Text style={styles.countText}>{offers.length} perto</Text>
            </View>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
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
  impactIcon: { height: 39, width: 39, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.52)" },
  impactTextBlock: { flex: 1 },
  impactLabel: { color: "#405500", fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  impactValue: { color: "#151B14", fontSize: 14, fontWeight: "900", marginTop: 3 },
  impactCopy: { color: "#425500", fontSize: 11, fontWeight: "700", marginTop: 2 },
  sectionHeader: { marginHorizontal: 20, marginTop: 27, marginBottom: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.65 },
  sectionSubtitle: { color: "#697065", fontSize: 12, marginTop: 3 },
  countText: { color: "#5E7D00", fontSize: 12, fontWeight: "800" },
  categories: { paddingLeft: 20, paddingRight: 12, gap: 10 },
  categoryItem: { alignItems: "center", width: 72, gap: 7 },
  categoryIcon: { width: 57, height: 57, borderRadius: 19, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", alignItems: "center", justifyContent: "center" },
  categoryText: { color: "#4F574E", fontSize: 11, fontWeight: "700" },
});
