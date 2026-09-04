import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CapiLoopMap } from "@/components/capiloop-map";
import { OfferCard } from "@/components/offer-card";
import { ScreenContainer } from "@/components/screen-container";
import { useCatalog } from "@/lib/catalog";

export default function ExploreScreen() {
  const { offers, isLoading, error, refresh } = useCatalog();
  const insets = useSafeAreaInsets();
  return (
    <ScreenContainer edges={["left", "right"]} className="flex-1">
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <OfferCard offer={item} variant="compact" />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} tintColor="#5E7D00" />}
        ListHeaderComponent={
          <View>
            <View style={styles.headingRow}>
              <View><Text style={styles.title}>Explore por perto</Text><Text style={styles.subtitle}>Sacolas disponíveis publicadas pelos parceiros.</Text></View>
              <Pressable style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.6 }]} accessibilityLabel="Atualizar ofertas" onPress={() => void refresh()}>
                <MaterialIcons name="refresh" size={20} color="#151B14" />
              </Pressable>
            </View>
            <CapiLoopMap offers={offers} />
            <View style={styles.nearbyHeader}><Text style={styles.nearbyTitle}>Disponíveis agora</Text><Text style={styles.nearbyCount}>{offers.length} locais</Text></View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{error ? "Catálogo indisponível" : isLoading ? "Carregando ofertas…" : "Nenhuma sacola disponível agora"}</Text>
            <Text style={styles.emptyText}>{error ?? "Volte mais tarde ou atualize para consultar novas publicações."}</Text>
          </View>
        }
              />
      </View>
    </ScreenContainer>

  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  title: { color: "#151B14", fontSize: 27, lineHeight: 33, fontWeight: "900", letterSpacing: -1.2 },
  subtitle: { color: "#697065", fontSize: 13, marginTop: 4, maxWidth: 255 },
  filterButton: { height: 42, width: 42, borderRadius: 15, backgroundColor: "#FFFFFF", borderColor: "#E8ECE4", borderWidth: 1, alignItems: "center", justifyContent: "center" },
  nearbyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 26, marginBottom: 13 },
  nearbyTitle: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.6 },
  nearbyCount: { color: "#5E7D00", fontSize: 12, fontWeight: "800" },
  empty: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 28, gap: 6 },
  emptyTitle: { color: "#151B14", fontWeight: "900", fontSize: 15, textAlign: "center" },
  emptyText: { color: "#697065", fontSize: 12, textAlign: "center", lineHeight: 18 },
});
