import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { consumePendingCheckoutOffer } from "@/lib/auth-resume";

type CallbackUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: string | Date;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseUser(rawUser: string | undefined): CallbackUser | null {
  if (!rawUser) return null;

  try {
    const decoded = typeof globalThis.atob === "function" ? globalThis.atob(rawUser) : rawUser;
    return JSON.parse(decoded) as CallbackUser;
  } catch {
    try {
      return JSON.parse(rawUser) as CallbackUser;
    } catch {
      return null;
    }
  }
}

function toStoredUser(user: CallbackUser): Auth.User {
  return {
    id: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    lastSignedIn: new Date(user.lastSignedIn),
  };
}

export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; state?: string; error?: string; sessionToken?: string; user?: string }>();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const complete = async () => {
      const code = getSingleParam(params.code);
      const state = getSingleParam(params.state);
      const sessionToken = getSingleParam(params.sessionToken);
      const callbackError = getSingleParam(params.error);

      if (callbackError) {
        setStatus("error");
        setErrorMessage("O acesso não foi concluído. Você pode tentar novamente quando quiser.");
        return;
      }

      try {
        let token = sessionToken;
        let user = parseUser(getSingleParam(params.user));

        if (!token) {
          if (!code || !state) {
            throw new Error("Não recebemos a confirmação de acesso.");
          }

          const exchange = await Api.exchangeOAuthCode(code, state);
          token = exchange.sessionToken;
          user = exchange.user as CallbackUser;
        }

        if (!token) throw new Error("Não foi possível estabelecer uma sessão segura.");
        await Auth.setSessionToken(token);

        if (!user) {
          user = await Api.getMe();
        }
        if (!user) throw new Error("Não foi possível carregar os dados da sua conta.");

        await Auth.setUserInfo(toStoredUser(user));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        setStatus("success");

        const pendingOfferId = await consumePendingCheckoutOffer();
        redirectTimer = setTimeout(() => {
          if (pendingOfferId) {
            router.replace({ pathname: "/offer/[id]", params: { id: pendingOfferId, resumeCheckout: "true" } });
            return;
          }
          router.replace("/(tabs)/profile");
        }, 650);
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Não foi possível concluir o acesso agora.");
      }
    };

    void complete();
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [params.code, params.error, params.sessionToken, params.state, params.user, router]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-7">
      <View className="w-full max-w-sm items-center rounded-[26px] border border-border bg-surface p-7">
        {status === "processing" ? <ActivityIndicator size="large" color="#5E7D00" /> : null}
        <Text className="mt-5 text-center text-xl font-black text-foreground">
          {status === "processing" ? "Organizando sua conta…" : status === "success" ? "Tudo pronto para salvar comida." : "Não foi possível entrar"}
        </Text>
        <Text className="mt-2 text-center text-sm leading-5 text-muted">
          {status === "processing"
            ? "Estamos protegendo sua sessão e preparando seu próximo passo."
            : status === "success"
              ? "Você será levado de volta ao CapiLoop agora."
              : errorMessage}
        </Text>
      </View>
    </ScreenContainer>
  );
}
