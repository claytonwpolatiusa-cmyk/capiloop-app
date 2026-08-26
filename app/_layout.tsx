import "../global.css";

import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

import { CapiLoopProvider } from "@/lib/capiloop-store";
import { CatalogProvider } from "@/lib/catalog";
import { ThemeProvider } from "@/lib/theme-provider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CapiLoopProvider>
        <CatalogProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="offer/[id]" options={{ animation: "fade_from_bottom", animationDuration: 260 }} />
            <Stack.Screen name="offer/confirm" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
            <Stack.Screen name="reservation/[id]" options={{ animation: "fade_from_bottom", animationDuration: 240 }} />
            <Stack.Screen name="checkout/result" options={{ animation: "fade_from_bottom", animationDuration: 260 }} />
            <Stack.Screen name="favorites" options={{ animation: "fade_from_bottom", animationDuration: 240 }} />
            <Stack.Screen name="order-history" options={{ animation: "fade_from_bottom", animationDuration: 260 }} />
            <Stack.Screen name="help/index" options={{ animation: "fade_from_bottom", animationDuration: 240 }} />
            <Stack.Screen name="support-tickets" options={{ animation: "fade_from_bottom", animationDuration: 240 }} />
            <Stack.Screen name="support-ticket/[id]" options={{ animation: "fade_from_bottom", animationDuration: 240 }} />
            <Stack.Screen name="admin/support" options={{ animation: "fade_from_bottom", animationDuration: 240 }} />
          </Stack>
        </CatalogProvider>
      </CapiLoopProvider>
    </ThemeProvider>
  );
}
