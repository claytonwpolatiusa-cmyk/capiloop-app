import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, Text, View } from "react-native";

import { offers } from "@/lib/capiloop-data";

export function CapiLoopMap() {
  return (
    <View style={styles.mapShell}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: -25.4337, longitude: -49.2732, latitudeDelta: 0.028, longitudeDelta: 0.028 }}
        showsUserLocation={false}
        rotateEnabled={false}
      >
        {offers.map((offer) => (
          <Marker key={offer.id} coordinate={{ latitude: offer.latitude, longitude: offer.longitude }}>
            <View style={styles.mapMarker}><MaterialIcons name="shopping-bag" size={16} color="#151B14" /></View>
          </Marker>
        ))}
      </MapView>
      <MapBadge />
    </View>
  );
}

function MapBadge() {
  return <View style={styles.mapBadge}><MaterialIcons name="bolt" size={15} color="#151B14" /><Text style={styles.mapBadgeText}>4 sacolas por perto</Text></View>;
}

const styles = StyleSheet.create({
  mapShell: { height: 248, borderRadius: 25, overflow: "hidden", marginTop: 22, backgroundColor: "#DEE6D4" },
  mapBadge: { position: "absolute", left: 14, bottom: 14, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 11, paddingVertical: 9, shadowColor: "#182314", shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  mapBadgeText: { color: "#151B14", fontSize: 11, fontWeight: "800" },
  mapMarker: { width: 37, height: 37, borderRadius: 14, backgroundColor: "#A5DF00", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFFFFF" },
});
