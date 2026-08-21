import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";

/** Estado de carregamento que preserva a hierarquia visual do detalhe de oferta. */
export function OfferDetailSkeleton() {
  const shimmer = useRef(new Animated.Value(0.38)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 0.78, duration: 720, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.38, duration: 720, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1" accessibilityLabel="Carregando detalhes do estabelecimento">
      <Animated.View style={[styles.content, { opacity: shimmer }]}>
        <View style={styles.hero} />
        <View style={styles.body}>
          <View style={styles.title} />
          <View style={styles.subtitle} />
          <View style={styles.card} />
          <View style={styles.tabBar} />
          <View style={styles.row} />
          <View style={styles.rowShort} />
        </View>
      </Animated.View>
      <View style={styles.actionBar}><View style={styles.price} /><View style={styles.button} /></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  hero: { height: 305, backgroundColor: "#E3E9DE" },
  body: { paddingHorizontal: 20, paddingTop: 23 },
  title: { height: 31, width: "62%", borderRadius: 10, backgroundColor: "#E8ECE4" },
  subtitle: { height: 15, width: "42%", borderRadius: 8, backgroundColor: "#EEF1EC", marginTop: 10 },
  card: { height: 94, borderRadius: 20, backgroundColor: "#F4F8E8", marginTop: 22 },
  tabBar: { height: 46, borderRadius: 15, backgroundColor: "#EEF1EC", marginTop: 22 },
  row: { height: 57, borderRadius: 17, backgroundColor: "#F7F8F6", marginTop: 16 },
  rowShort: { height: 57, width: "78%", borderRadius: 17, backgroundColor: "#F7F8F6", marginTop: 12 },
  actionBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#E8ECE4", backgroundColor: "#FFFFFF" },
  price: { height: 27, width: 76, borderRadius: 9, backgroundColor: "#EEF1EC" },
  button: { height: 52, width: 130, borderRadius: 16, backgroundColor: "#253000" },
});
