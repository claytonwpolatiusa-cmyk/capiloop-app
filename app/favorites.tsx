import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { OfferCard } from "@/components/offer-card";
import { ScreenContainer } from "@/components/screen-container";
import { useCatalog } from "@/lib/catalog";
import { useCapiLoop } from "@/lib/capiloop-store";

export default function FavoritesScreen() {
  const { offers } = useCatalog();
  const { favoriteStores } = useCapiLoop();
  const favorites = offers.filter((offer) => favoriteStores.includes(offer.store));

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1">
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OfferCard offer={item} />}
        contentContainerStyle={[styles.content, favorites.length === 0 && styles.emptyContent]}
        ListHeaderComponent={<View style={styles.header}><CapiLoopBrand compact /><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && { opacity: 0.65 }]} accessibilityLabel="Voltar"><MaterialIcons name="arrow-back" size={21} color="#151B14" /></Pressable><Text style={styles.title}>Favoritos</Text><Text style={styles.subtitle}>Lojas que você quer acompanhar de perto.</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><View style={styles.emptyIcon}><MaterialIcons name="favorite-border" size={27} color="#5E7D00" /></View><Text style={styles.emptyTitle}>Ainda não há favoritos</Text><Text style={styles.emptyCopy}>Abra uma loja e toque no coração para salvá-la aqui.</Text><Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => [styles.discover, pressed && { opacity: 0.76 }]}><Text style={styles.discoverText}>Explorar lojas</Text></Pressable></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 },
  emptyContent: { flexGrow: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  back: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E8ECE4", borderRadius: 15, borderWidth: 1, height: 43, justifyContent: "center", marginTop: 18, width: 43 },
  title: { color: "#151B14", fontSize: 29, fontWeight: "900", letterSpacing: -1.1, marginTop: 18 },
  subtitle: { color: "#697065", fontSize: 13, marginTop: 5 },
  empty: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 34, paddingBottom: 70 },
  emptyIcon: { alignItems: "center", backgroundColor: "#ECF6CD", borderRadius: 25, height: 76, justifyContent: "center", width: 76 },
  emptyTitle: { color: "#151B14", fontSize: 21, fontWeight: "900", marginTop: 20 },
  emptyCopy: { color: "#697065", fontSize: 13, lineHeight: 19, marginTop: 7, textAlign: "center" },
  discover: { backgroundColor: "#151B14", borderRadius: 16, marginTop: 22, paddingHorizontal: 19, paddingVertical: 14 },
  discoverText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
});
