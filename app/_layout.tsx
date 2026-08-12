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
            <Stack.Screen name="offer/[id]" />
            <Stack.Screen name="reservation/[id]" options={{ animation: "fade" }} />
            <Stack.Screen name="checkout/result" options={{ animation: "fade" }} />
          </Stack>
        </CatalogProvider>
      </CapiLoopProvider>
    </ThemeProvider>
  );
}
