import * as Haptics from "expo-haptics";
import { Pressable, type PressableProps, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

type TactilePressableProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
  tactile?: boolean;
};

/** Botão com resposta visual e háptica leve para ações principais. */
export function TactilePressable({ style, tactile = true, onPressIn, ...props }: TactilePressableProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(event) => {
        if (tactile) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        onPressIn?.(event);
      }}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    />
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9, transform: [{ scale: 0.975 }] },
});
