import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { CapiLoopBrand } from "@/components/capiloop-brand";
import { ScreenContainer } from "@/components/screen-container";
import { startOAuthLogin } from "@/constants/oauth";

type AccountMode = "signin" | "signup";

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AccountWelcomeScreen() {
  const params = useLocalSearchParams<{ mode?: string; offerId?: string }>();
  const requestedMode = asString(params.mode);
  const [mode, setMode] = useState<AccountMode>(requestedMode === "signup" ? "signup" : "signin");
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) });
  }, [entrance]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 10 }],
  }));

  const copy = useMemo(
    () =>
      mode === "signup"
        ? {
            eyebrow: "BEM-VINDO AO CICLO",
            title: "Crie sua conta e salve mais comida.",
            body: "Uma conta deixa suas reservas organizadas, facilita a retirada e registra o impacto que você gera.",
            action: "Criar conta",
            alternate: "Já tem uma conta?",
            alternateAction: "Entrar",
          }
        : {
            eyebrow: "SUA CONTA CAPI LOOP",
            title: "Bom ter você no ciclo.",
            body: "Entre para vincular suas reservas, pagar com segurança e acompanhar seu impacto contra o desperdício.",
            action: "Entrar com minha conta",
            alternate: "Ainda não participa?",
            alternateAction: "Criar conta",
          },
    [mode],
  );

  const returnToPreviousScreen = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/profile");
  };

  const launchAccountAccess = async () => {
    setError(null);
    setIsLaunching(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }

    try {
      const callbackUrl = await startOAuthLogin();
      if (!callbackUrl) return;

      const parsed = Linking.parse(callbackUrl);
      const queryParams = parsed.queryParams ?? {};
      const code = asString(queryParams.code as string | string[] | undefined);
      const state = asString(queryParams.state as string | string[] | undefined);
      const sessionToken = asString(queryParams.sessionToken as string | string[] | undefined);
      const user = asString(queryParams.user as string | string[] | undefined);
      const callbackError = asString(queryParams.error as string | string[] | undefined);

      if (callbackError) {
        setError("Não foi possível concluir o acesso. Tente novamente em alguns instantes.");
        return;
      }

      if (!code && !sessionToken) {
        setError("O acesso foi interrompido antes da confirmação. Você pode tentar novamente quando quiser.");
        return;
      }

      router.replace({
        pathname: "/oauth/callback",
        params: {
          ...(code ? { code } : {}),
          ...(state ? { state } : {}),
          ...(sessionToken ? { sessionToken } : {}),
          ...(user ? { user } : {}),
        },
      });
    } catch {
      setError("Não foi possível abrir a central segura de conta. Verifique sua conexão e tente novamente.");
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1" containerClassName="bg-[#F7F8F4]">
      <Animated.View style={[styles.page, entranceStyle]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={returnToPreviousScreen}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <MaterialIcons name="arrow-back" size={21} color="#151B14" />
          </Pressable>
          <CapiLoopBrand compact />
        </View>

        <View style={styles.content}>
          <View style={styles.capyCard}>
            <View style={styles.capyBadge}>
              <MaterialIcons name="eco" size={26} color="#151B14" />
            </View>
            <View style={styles.capyBody}>
              <Text style={styles.capyTitle}>Seu próximo resgate começa aqui.</Text>
              <Text style={styles.capyCopy}>Junte-se às pessoas que transformam excedentes em boas refeições.</Text>
            </View>
          </View>

          <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.body}>{copy.body}</Text>

          <View style={styles.benefits}>
            <Benefit icon="receipt-long" text="Reservas e comprovantes no mesmo lugar" />
            <Benefit icon="payments" text="PIX e cartão em checkout protegido" />
            <Benefit icon="spa" text="Impacto ambiental salvo no seu perfil" />
          </View>

          <Pressable
            disabled={isLaunching}
            onPress={() => void launchAccountAccess()}
            style={({ pressed }) => [styles.primaryButton, (pressed || isLaunching) && styles.primaryPressed]}
            accessibilityRole="button"
            accessibilityLabel={copy.action}
          >
            {isLaunching ? <ActivityIndicator color="#FFFFFF" size="small" /> : <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />}
            <Text style={styles.primaryButtonText}>{isLaunching ? "Abrindo acesso seguro…" : copy.action}</Text>
          </Pressable>

          <View style={styles.alternateRow}>
            <Text style={styles.alternateText}>{copy.alternate}</Text>
            <Pressable
              disabled={isLaunching}
              onPress={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.linkText}>{copy.alternateAction}</Text>
            </Pressable>
          </View>

          {mode === "signin" && (
            <Pressable
              disabled={isLaunching}
              onPress={() => void launchAccountAccess()}
              style={({ pressed }) => [styles.recoveryButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Recuperar acesso à conta"
            >
              <Text style={styles.recoveryText}>Precisa recuperar o acesso?</Text>
            </Pressable>
          )}

          {error ? <Text style={styles.errorText} accessibilityLiveRegion="polite">{error}</Text> : null}
        </View>

        <Pressable
          onPress={returnToPreviousScreen}
          style={({ pressed }) => [styles.guestButton, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.guestText}>{asString(params.offerId) ? "Voltar para a oferta" : "Continuar explorando sem conta"}</Text>
          <MaterialIcons name="chevron-right" size={18} color="#5E7D00" />
        </Pressable>

        <Text style={styles.privacyText}>O acesso é realizado em uma central protegida. O CapiLoop não solicita nem armazena sua senha no aplicativo.</Text>
      </Animated.View>
    </ScreenContainer>
  );
}

function Benefit({ icon, text }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIcon}><MaterialIcons name={icon} size={18} color="#5E7D00" /></View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  topBar: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E2E8DB", backgroundColor: "#FFFFFF" },
  content: { flex: 1, justifyContent: "center", paddingTop: 20 },
  capyCard: { flexDirection: "row", gap: 13, padding: 16, borderRadius: 22, backgroundColor: "#EAF6C5", borderWidth: 1, borderColor: "#D5EAA0", marginBottom: 31 },
  capyBadge: { width: 50, height: 50, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#A5DF00" },
  capyBody: { flex: 1 },
  capyTitle: { color: "#151B14", fontSize: 14, lineHeight: 19, fontWeight: "900" },
  capyCopy: { color: "#4D6042", fontSize: 11, lineHeight: 16, marginTop: 4, fontWeight: "600" },
  eyebrow: { color: "#5E7D00", fontSize: 10, lineHeight: 14, letterSpacing: 1.15, fontWeight: "900" },
  title: { color: "#151B14", fontSize: 33, lineHeight: 38, letterSpacing: -1.35, fontWeight: "900", marginTop: 9, maxWidth: 330 },
  body: { color: "#5F665B", fontSize: 14, lineHeight: 21, marginTop: 13, maxWidth: 345 },
  benefits: { gap: 10, marginTop: 24, marginBottom: 27 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8DB", alignItems: "center", justifyContent: "center" },
  benefitText: { flex: 1, color: "#394235", fontSize: 12, lineHeight: 17, fontWeight: "700" },
  primaryButton: { minHeight: 54, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: "#151B14", paddingHorizontal: 18 },
  primaryPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  alternateRow: { minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 13 },
  alternateText: { color: "#697065", fontSize: 12, fontWeight: "700" },
  linkButton: { paddingVertical: 6, paddingHorizontal: 2 },
  linkText: { color: "#527100", fontSize: 12, fontWeight: "900", textDecorationLine: "underline" },
  recoveryButton: { alignSelf: "center", paddingVertical: 7, paddingHorizontal: 6 },
  recoveryText: { color: "#697065", fontSize: 11, fontWeight: "700" },
  errorText: { marginTop: 7, color: "#B42318", fontSize: 11, lineHeight: 16, textAlign: "center", fontWeight: "700" },
  guestButton: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2 },
  guestText: { color: "#5E7D00", fontSize: 12, fontWeight: "900" },
  privacyText: { color: "#8A9187", fontSize: 10, lineHeight: 14, textAlign: "center", marginTop: 6, paddingHorizontal: 14 },
  pressed: { opacity: 0.62 },
});
