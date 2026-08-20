import { Image } from "expo-image";
import type { ImageStyle, StyleProp } from "react-native";

const mascotSources = {
  icon: "/manus-storage/capiloop-icon-mascot-3d_6a9e2b0a.png",
  nearby: "/manus-storage/capiloop-mascot-nearby-3d_9ee45650.png",
  emptyBag: "/manus-storage/capiloop-mascot-empty-bag-3d_ab4b63c5.png",
  impact: "/manus-storage/capiloop-mascot-impact-3d_5160699b.png",
} as const;

export type CapiLoopMascotVariant = keyof typeof mascotSources;

type Props = {
  variant?: CapiLoopMascotVariant;
  size?: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

/**
 * O mascote é aplicado somente em momentos de acolhimento, descoberta e
 * celebração. Isso preserva o caráter editorial e evita que a interface fique decorativa demais.
 */
export function CapiLoopMascot({
  variant = "icon",
  size = 72,
  style,
  accessibilityLabel = "Capivara CapiLoop",
}: Props) {
  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      cachePolicy="memory-disk"
      contentFit="contain"
      source={mascotSources[variant]}
      style={[{ width: size, height: size }, style]}
      transition={250}
    />
  );
}
