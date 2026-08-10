import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { ScreenContainer } from "@/components/screen-container";

const options = [
  { icon: "location-on", title: "Localização", detail: "Centro, Curitiba" },
  { icon: "favorite-border", title: "Favoritos", detail: "Lojas que você acompanha" },
  { icon: "help-outline", title: "Central de ajuda", detail: "Dúvidas sobre retirada" },
  { icon: "tune", title: "Preferências", detail: "Ajuste sua experiência" },
];

export default function ProfileScreen() {
  return (
    <ScreenContainer className="flex-1">
      <FlatList
        data={options}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [styles.option, pressed && { opacity: 0.65 }]}>
            <View style={styles.optionIcon}><MaterialIcons name={item.icon as never} size={20} color="#151B14" /></View>
            <View style={styles.optionInfo}><Text style={styles.optionTitle}>{item.title}</Text><Text style={styles.optionDetail}>{item.detail}</Text></View>
            <MaterialIcons name="chevron-right" size={23} color="#AEB5AA" />
          </Pressable>
        )}
        ListHeaderComponent={
          <View>
            <CapiLoopBrand compact />
            <View style={styles.profileHead}>
              <View style={styles.avatar}><Text style={styles.avatarText}>AL</Text></View>
              <View><Text style={styles.name}>Alex Lima</Text><Text style={styles.member}>Membro do CapiLoop</Text></View>
            </View>
            <View style={styles.demoCard}><MaterialIcons name="info-outline" size={17} color="#5E7D00" /><Text style={styles.demoText}>Você está navegando em uma experiência demonstrativa.</Text></View>
            <Text style={styles.sectionTitle}>Conta</Text>
          </View>
        }
        ListFooterComponent={<Text style={styles.version}>CapiLoop · Versão de demonstração</Text>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 25 },
  profileHead: { flexDirection: "row", alignItems: "center", gap: 13, marginTop: 25 },
  avatar: { height: 64, width: 64, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "#A5DF00" },
  avatarText: { color: "#151B14", fontSize: 17, fontWeight: "900" },
  name: { color: "#151B14", fontSize: 22, fontWeight: "900", letterSpacing: -0.6 },
  member: { color: "#697065", fontSize: 12, marginTop: 3 },
  demoCard: { backgroundColor: "#F4F8E8", borderRadius: 16, padding: 13, flexDirection: "row", gap: 9, alignItems: "center", marginTop: 24 },
  demoText: { color: "#4A6410", fontSize: 11, lineHeight: 16, fontWeight: "700", flex: 1 },
  sectionTitle: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.6, marginTop: 28, marginBottom: 12 },
  option: { minHeight: 74, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#E8ECE4" },
  optionIcon: { width: 41, height: 41, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", alignItems: "center", justifyContent: "center" },
  optionInfo: { flex: 1 },
  optionTitle: { color: "#151B14", fontSize: 14, fontWeight: "800" },
  optionDetail: { color: "#697065", fontSize: 11, marginTop: 3 },
  version: { color: "#9AA198", fontSize: 11, textAlign: "center", marginTop: 25 },
});
