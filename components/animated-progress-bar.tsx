import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

export function AnimatedProgressBar({ value }: { value: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(value, 1));

  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: clamped, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [clamped, progress]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return <View style={styles.track}><Animated.View style={[styles.fill, { width }]} /></View>;
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: "#ECF0E8", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4, backgroundColor: "#A5DF00" },
});
