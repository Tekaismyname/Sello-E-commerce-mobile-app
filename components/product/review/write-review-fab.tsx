import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

type WriteReviewFabProps = {
  productId?: string | number | null;
  productName?: string;
  productImage?: string;
};

export function WriteReviewFab({ productId, productName, productImage }: WriteReviewFabProps) {
  const parsedProductId = Number(productId);
  const canWriteReview = Number.isFinite(parsedProductId) && parsedProductId > 0;

  return (
    <View className="absolute bottom-8 right-4">
      <Pressable
        disabled={!canWriteReview}
        onPress={() =>
          router.push({
            pathname: "/product/write-review",
            params: {
              productId: parsedProductId,
              productName,
              productImage,
            },
          } as any)
        }
        className="flex-row items-center gap-2 rounded-full bg-[#1872cc] px-5 py-3 shadow-[0px_4px_12px_rgba(24,114,204,0.3)] disabled:opacity-50"
      >
        <Feather name="edit-2" size={18} color="white" />
        <Text className="text-[15px] font-bold text-white">Write review</Text>
      </Pressable>
    </View>
  );
}
