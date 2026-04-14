import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, Text, View } from "react-native";

type WriteReviewFabProps = {
  productId: string;
};

export function WriteReviewFab({ productId }: WriteReviewFabProps) {
  return (
    <View className="absolute bottom-8 right-4">
      <Pressable
        onPress={() => router.push(`/product/write-review?id=${productId}` as Href)}
        className="flex-row items-center gap-2 rounded-full bg-[#1872cc] px-5 py-3 shadow-[0px_4px_12px_rgba(24,114,204,0.3)]"
      >
        <Feather name="edit-2" size={18} color="white" />
        <Text className="text-[15px] font-bold text-white">Viết đánh giá</Text>
      </Pressable>
    </View>
  );
}
