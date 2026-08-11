import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";

const accountBenefits = [
  { icon: "receipt-long", title: "Reservas reunidas", detail: "Encontre seus comprovantes de retirada quando precisar." },
  { icon: "shield", title: "Pagamento protegido", detail: "Finalize por PIX ou cartão na área segura do Mercado Pago." },
  { icon: "spa", title: "Impacto registrado", detail: "Acompanhe as escolhas que ajudam a evitar desperdício." },
] as const;

export default function ProfileScreen() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Visitante";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const openAccess = (mode: "signin" | "signup") => {
    router.push({ pathname: "/auth/welcome", params: { mode } });
  };

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-[#F7F8F4]">
      <View style={styles.page}>
        <CapiLoopBrand compact />

        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={styles.profileCopy}>
            <View style={styles.identityRow}>
              <Text style={styles.name}>{loading ? "Preparando seu perfil…" : displayName}</Text>
              {isAuthenticated ? <View style={styles.activePill}><Text style={styles.activePillText}>ATIVA</Text></View> : null}
            </View>
            <Text style={styles.member}>{isAuthenticated ? user?.email ?? "Conta CapiLoop conectada" : "Entre para reservar e pagar com segurança."}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingPanel}><ActivityIndicator color="#5E7D00" /><Text style={styles.loadingText}>Verificando sua sessão…</Text></View>
        ) : isAuthenticated ? (
          <View style={styles.authenticatedPanel}>
            <View style={styles.authenticatedCopy}><Text style={styles.panelTitle}>Sua conta está pronta para resgatar.</Text><Text style={styles.panelBody}>As reservas confirmadas e o comprovante de retirada aparecerão aqui.</Text></View>
            <Pressable onPress={() => void logout()} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]} accessibilityRole="button"><MaterialIcons name="logout" size={17} color="#B42318" /><Text style={styles.signOutText}>Sair da conta</Text></Pressable>
          </View>
        ) : (
          <View style={styles.guestPanel}>
            <Text style={styles.panelTitle}>Reserve sem perder o ritmo.</Text>
            <Text style={styles.panelBody}>Uma conta vincula sua sacola, simplifica o pagamento e deixa a retirada mais tranquila.</Text>
            <Pressable onPress={() => openAccess("signin")} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]} accessibilityRole="button"><MaterialIcons name="login" size={18} color="#FFFFFF" /><Text style={styles.primaryText}>Entrar na minha conta</Text></Pressable>
            <Pressable onPress={() => openAccess("signup")} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} accessibilityRole="button"><Text style={styles.secondaryText}>Criar uma conta</Text><MaterialIcons name="arrow-forward" size={17} color="#527100" /></Pressable>
          </View>
        )}

        <Text style={styles.sectionTitle}>Por que usar uma conta?</Text>
        <View style={styles.benefitList}>
          {accountBenefits.map((benefit) => (
            <View key={benefit.title} style={styles.benefitRow}>
              <View style={styles.benefitIcon}><MaterialIcons name={benefit.icon} size={19} color="#5E7D00" /></View>
              <View style={styles.benefitCopy}><Text style={styles.benefitTitle}>{benefit.title}</Text><Text style={styles.benefitDetail}>{benefit.detail}</Text></View>
            </View>
          ))}
        </View>

        <Text style={styles.version}>CapiLoop · pagamento seguro via Mercado Pago</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 22 },
  profileCard: { marginTop: 25, padding: 18, borderRadius: 23, flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8DB" },
  avatar: { height: 62, width: 62, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#A5DF00" },
  avatarText: { color: "#151B14", fontSize: 17, fontWeight: "900" },
  profileCopy: { flex: 1 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "wrap" },
  name: { color: "#151B14", fontSize: 21, lineHeight: 26, fontWeight: "900", letterSpacing: -0.7 },
  activePill: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: "#ECF6CD" },
  activePillText: { color: "#527100", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  member: { color: "#697065", fontSize: 11, lineHeight: 16, marginTop: 3, flexShrink: 1 },
  loadingPanel: { minHeight: 126, marginTop: 14, borderRadius: 21, alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#F4F8E8" },
  loadingText: { color: "#5E7D00", fontSize: 12, fontWeight: "800" },
  authenticatedPanel: { marginTop: 14, padding: 17, borderRadius: 21, backgroundColor: "#F4F8E8" },
  guestPanel: { marginTop: 14, padding: 17, borderRadius: 21, backgroundColor: "#F4F8E8" },
  authenticatedCopy: { marginBottom: 16 },
  panelTitle: { color: "#151B14", fontSize: 15, lineHeight: 20, fontWeight: "900" },
  panelBody: { color: "#52604B", fontSize: 12, lineHeight: 17, marginTop: 5, fontWeight: "600" },
  primaryButton: { minHeight: 47, borderRadius: 15, backgroundColor: "#151B14", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 17 },
  primaryPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  secondaryButton: { minHeight: 40, marginTop: 5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3 },
  secondaryText: { color: "#527100", fontSize: 12, fontWeight: "900" },
  signOutButton: { minHeight: 42, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#F0CDC9", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  signOutText: { color: "#B42318", fontSize: 12, fontWeight: "900" },
  sectionTitle: { color: "#151B14", fontSize: 18, fontWeight: "900", letterSpacing: -0.6, marginTop: 27, marginBottom: 12 },
  benefitList: { borderRadius: 21, overflow: "hidden", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8DB" },
  benefitRow: { minHeight: 71, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 11, borderBottomWidth: 1, borderBottomColor: "#EEF1EA" },
  benefitIcon: { height: 39, width: 39, borderRadius: 13, backgroundColor: "#ECF6CD", alignItems: "center", justifyContent: "center" },
  benefitCopy: { flex: 1 },
  benefitTitle: { color: "#151B14", fontSize: 12, fontWeight: "900" },
  benefitDetail: { color: "#697065", fontSize: 10, lineHeight: 14, marginTop: 3, fontWeight: "600" },
  version: { color: "#9AA198", fontSize: 10, textAlign: "center", marginTop: 20, fontWeight: "700" },
  pressed: { opacity: 0.64 },
});
