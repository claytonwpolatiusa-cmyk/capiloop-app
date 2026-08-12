import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E8ECE4",
          borderTopWidth: 1,
          height: 57 + bottomPadding,
          paddingTop: 7,
          paddingBottom: bottomPadding,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Descobrir", tabBarIcon: ({ color }) => <IconSymbol size={23} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: "Explorar", tabBarIcon: ({ color }) => <IconSymbol size={23} name="map.fill" color={color} /> }} />
      <Tabs.Screen name="bag" options={{ title: "Sacola", tabBarIcon: ({ color }) => <IconSymbol size={23} name="bag.fill" color={color} /> }} />
      <Tabs.Screen name="impact" options={{ title: "Impacto", tabBarIcon: ({ color }) => <IconSymbol size={23} name="leaf.fill" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ({ color }) => <IconSymbol size={23} name="person.fill" color={color} /> }} />
    </Tabs>
  );
}
