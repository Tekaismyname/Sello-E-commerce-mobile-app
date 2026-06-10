import { Text, View } from "react-native";

type ProductListFooterLoadingProps = {
  visible?: boolean;
};

export function ProductListFooterLoading({ visible = true }: ProductListFooterLoadingProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="mt-4 flex-row items-center justify-center gap-2">
      <View className="h-1.5 w-1.5 rounded-full bg-[#2f7ed6]" />
      <View className="h-1.5 w-1.5 rounded-full bg-[#99bddf]" />
      <View className="h-1.5 w-1.5 rounded-full bg-[#99bddf]" />
      <Text className="ml-2 text-[12px] font-semibold text-[#778290]">Loading more products...</Text>
    </View>
  );
}
