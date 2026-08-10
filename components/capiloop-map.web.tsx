import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, View } from "react-native";

import { offers } from "@/lib/capiloop-data";

const markerPositions = [{ top: 50, left: "27%" }, { top: 92, right: "23%" }, { bottom: 52, left: "43%" }, { bottom: 30, right: "15%" }] as const;

export function CapiLoopMap() {
  return (
    <View style={[styles.mapShell, styles.webMap]}>
      <View style={styles.mapRoadOne} /><View style={styles.mapRoadTwo} /><View style={styles.mapRoadThree} />
      {offers.map((offer, index) => <View key={offer.id} style={[styles.webMarker, markerPositions[index]]}><MaterialIcons name="shopping-bag" size={16} color="#151B14" /></View>)}
      <View style={styles.mapBadge}><MaterialIcons name="bolt" size={15} color="#151B14" /><Text style={styles.mapBadgeText}>4 sacolas por perto</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapShell: { height: 248, borderRadius: 25, overflow: "hidden", marginTop: 22 },
  webMap: { position: "relative", backgroundColor: "#DDE7D5" },
  mapRoadOne: { position: "absolute", height: 24, width: "130%", left: "-20%", top: 84, backgroundColor: "#F9FAF7", transform: [{ rotate: "-16deg" }] },
  mapRoadTwo: { position: "absolute", height: 18, width: "130%", left: "-25%", top: 157, backgroundColor: "#F9FAF7", transform: [{ rotate: "17deg" }] },
  mapRoadThree: { position: "absolute", width: 22, height: "140%", top: "-20%", left: "52%", backgroundColor: "#F9FAF7", transform: [{ rotate: "14deg" }] },
  webMarker: { position: "absolute", width: 37, height: 37, borderRadius: 14, backgroundColor: "#A5DF00", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFFFFF" },
  mapBadge: { position: "absolute", left: 14, bottom: 14, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 11, paddingVertical: 9, shadowColor: "#182314", shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  mapBadgeText: { color: "#151B14", fontSize: 11, fontWeight: "800" },
});
