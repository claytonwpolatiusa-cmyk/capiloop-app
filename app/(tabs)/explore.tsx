import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { CapiLoopMap } from "@/components/capiloop-map";
import { OfferCard } from "@/components/offer-card";
import { ScreenContainer } from "@/components/screen-container";
import { offers } from "@/lib/capiloop-data";

export default function ExploreScreen() {
  return (
    <ScreenContainer className="flex-1">
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <OfferCard offer={item} variant="compact" />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.headingRow}>
              <View>
                <Text style={styles.title}>Explore por perto</Text>
                <Text style={styles.subtitle}>Sacolas disponíveis na sua região.</Text>
              </View>
              <Pressable style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.6 }]} accessibilityLabel="Filtrar ofertas">
                <MaterialIcons name="tune" size={20} color="#151B14" />
              </Pressable>
            </View>
            <CapiLoopMap />
            <View style={styles.nearbyHeader}>
              <Text style={styles.nearbyTitle}>Em até 2 km</Text>
              <Text style={styles.nearbyCount}>{offers.length} locais</Text>
            </View>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  title: { color: "#151B14", fontSize: 27, lineHeight: 33, fontWeight: "900", letterSpacing: -1.2 },
  subtitle: { color: "#697065", fontSize: 13, marginTop: 4 },
  filterButton: { height: 42, width: 42, borderRadius: 15, backgroundColor: "#FFFFFF", borderColor: "#E8ECE4", borderWidth: 1, alignItems: "center", justifyContent: "center" },
  nearbyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 26, marginBottom: 13 },
  nearbyTitle: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.6 },
  nearbyCount: { color: "#5E7D00", fontSize: 12, fontWeight: "800" },
});
