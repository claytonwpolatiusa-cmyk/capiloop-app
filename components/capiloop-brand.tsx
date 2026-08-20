import { Text, View } from "react-native";

import { CapiLoopMascot } from "@/components/capiloop-mascot";

type Props = { compact?: boolean };

export function CapiLoopBrand({ compact = false }: Props) {
  return (
    <View className="flex-row items-center gap-2">
      <CapiLoopMascot variant="icon" size={38} accessibilityLabel="Logo CapiLoop: capivara em uma sacola" />
      {!compact && (
        <Text className="text-[21px] font-extrabold tracking-[-0.8px] text-foreground">
          Capi<Text className="text-primary">Loop</Text>
        </Text>
      )}
    </View>
  );
}
