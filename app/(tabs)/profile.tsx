import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { MotionReveal } from "@/components/motion-reveal";
import { ScreenContainer } from "@/components/screen-container";
import { TactilePressable } from "@/components/tactile-pressable";
import { startOAuthLogin } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";

const options = [
  { icon: "location-on", title: "Localização", detail: "Centro, Curitiba" },
  { icon: "favorite-border", title: "Favoritos", detail: "Lojas que você acompanha" },
  { icon: "receipt-long", title: "Histórico de pedidos", detail: "Pedidos e comprovantes" },
  { icon: "help-outline", title: "Central de ajuda", detail: "Dúvidas sobre retirada" },
  { icon: "tune", title: "Preferências", detail: "Ajuste sua experiência" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const isCompact = height < 720 || width < 365;
  const { user, isAuthenticated, loading, logout } = useAuth();
  const displayName = user?.name || user?.email?.split("@")[0] || "Visitante";
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <ScreenContainer edges={["top", "left", "right"]} className="flex-1"><FlatList
    data={options} keyExtractor={(item) => item.title} contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
    renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => item.title === "Central de ajuda" ? router.push("/help" as never) : item.title === "Favoritos" ? router.push("/favorites" as never) : item.title === "Histórico de pedidos" ? router.push("/order-history" as never) : undefined} style={({ pressed }) => [styles.option, pressed && { opacity: 0.65 }]}><View style={styles.optionIcon}><MaterialIcons name={item.icon as never} size={20} color="#151B14" /></View><View style={styles.optionInfo}><Text style={styles.optionTitle}>{item.title}</Text><Text style={styles.optionDetail}>{item.detail}</Text></View><MaterialIcons name="chevron-right" size={23} color="#AEB5AA" /></Pressable>}
    ListHeaderComponent={<View><CapiLoopBrand compact /><MotionReveal delay={40}><View style={[styles.profileHead, isCompact && styles.profileHeadCompact]}><View style={[styles.avatar, isCompact && styles.avatarCompact]}><Text style={styles.avatarText}>{initials}</Text></View><View style={styles.profileCopy}><Text style={[styles.name, isCompact && styles.nameCompact]}>{displayName}</Text><Text style={styles.member}>{isAuthenticated ? "Membro do CapiLoop" : "Entre para reservar e pagar"}</Text></View></View><TactilePressable disabled={loading} onPress={() => isAuthenticated ? void logout() : void startOAuthLogin()} style={[styles.authButton, isCompact && styles.authButtonCompact]}><MaterialIcons name={isAuthenticated ? "logout" : "login"} size={18} color="#FFFFFF" /><Text style={styles.authText}>{isAuthenticated ? "Sair da conta" : "Entrar ou criar conta"}</Text></TactilePressable></MotionReveal><Text style={[styles.sectionTitle, isCompact && styles.sectionTitleCompact]}>Conta</Text></View>}
    ListFooterComponent={<Text style={styles.version}>CapiLoop · pagamento seguro via Mercado Pago</Text>}
  /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }, contentCompact: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 22 }, profileHead: { flexDirection: "row", alignItems: "center", gap: 13, marginTop: 25 }, profileHeadCompact: { marginTop: 17, gap: 11 }, profileCopy: { flex: 1 }, avatar: { height: 64, width: 64, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "#A5DF00" }, avatarCompact: { height: 56, width: 56, borderRadius: 20 }, avatarText: { color: "#151B14", fontSize: 17, fontWeight: "900" }, name: { color: "#151B14", fontSize: 22, fontWeight: "900", letterSpacing: -0.6 }, nameCompact: { fontSize: 20 }, member: { color: "#697065", fontSize: 12, marginTop: 3 }, authButton: { marginTop: 20, paddingHorizontal: 15, minHeight: 47, borderRadius: 15, backgroundColor: "#151B14", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, authButtonCompact: { marginTop: 16, minHeight: 44 }, authText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, sectionTitle: { color: "#151B14", fontSize: 19, fontWeight: "900", letterSpacing: -0.6, marginTop: 28, marginBottom: 12 }, sectionTitleCompact: { marginTop: 21, marginBottom: 8 }, option: { minHeight: 74, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#E8ECE4" }, optionIcon: { width: 41, height: 41, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8ECE4", alignItems: "center", justifyContent: "center" }, optionInfo: { flex: 1 }, optionTitle: { color: "#151B14", fontSize: 14, fontWeight: "800" }, optionDetail: { color: "#697065", fontSize: 11, marginTop: 3 }, version: { color: "#9AA198", fontSize: 11, textAlign: "center", marginTop: 25 } });
