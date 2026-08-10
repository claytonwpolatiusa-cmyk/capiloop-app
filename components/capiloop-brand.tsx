import { Text, View } from "react-native";

type Props = { compact?: boolean };

export function CapiLoopBrand({ compact = false }: Props) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-9 w-9 items-center justify-center rounded-2xl bg-foreground">
        <View className="h-4 w-5 rounded-[8px] bg-primary" />
        <View className="absolute top-2.5 h-1.5 w-1.5 rounded-full bg-background" />
      </View>
      {!compact && (
        <Text className="text-[21px] font-extrabold tracking-[-0.8px] text-foreground">
          Capi<Text className="text-primary">Loop</Text>
        </Text>
      )}
    </View>
  );
}
