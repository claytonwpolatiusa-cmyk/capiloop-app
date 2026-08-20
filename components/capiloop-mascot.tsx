import { Image } from "expo-image";
import type { ImageStyle, StyleProp } from "react-native";

const MASTER_MASCOT_SOURCE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663885056165/bVQXbmiWiNBTtGWi.png";

const mascotSources = {
  icon: MASTER_MASCOT_SOURCE,
  nearby: MASTER_MASCOT_SOURCE,
  emptyBag: MASTER_MASCOT_SOURCE,
  impact: MASTER_MASCOT_SOURCE,
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
