import { mainService, ProductReviewItem } from "@/services/main.service";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type ProductReviewOverviewProps = {
  productId: string;
  productName?: string;
  productImage?: string;
};

export function ProductReviewOverview({ productId, productName, productImage }: ProductReviewOverviewProps) {
  const [previewReviews, setPreviewReviews] = useState<ProductReviewItem[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const parsedProductId = Number(productId);
    if (!parsedProductId) {
      setLoaded(true);
      return;
    }

    let cancelled = false;
    mainService
      .getProductReviews(parsedProductId, { page: 1, limit: 3 })
      .then((data) => {
        if (cancelled) return;
        setPreviewReviews(data.items);
        setTotalReviews(data.summary.totalReviews);
        setTotalPhotos(data.summary.totalPhotos);
      })
      .catch(() => {
        // Keep the empty state; the full reviews screen surfaces load errors.
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!loaded) {
    return null;
  }

  return (
    <View className="bg-white py-5">
      <View className="mb-4 flex-row items-center justify-between px-4">
        <Text className="text-[16px] font-extrabold uppercase tracking-wider text-[#191C1F]">Real reviews</Text>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/product/reviews",
              params: {
                id: productId,
                productName,
                productImage,
              },
            } as any)
          }
        >
          <Text className="text-[14px] font-bold text-[#006397]">See all</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-4">
        {previewReviews.length === 0 ? (
          <View className="w-[280px] rounded-[12px] border border-[#E7E8EC] bg-white p-4">
            <Text className="text-[13px] leading-[20px] text-[#6b7682]">
              No reviews yet. Be the first to share your experience with this product.
            </Text>
          </View>
        ) : (
          previewReviews.map((review) => (
            <View key={review.id} className="w-[280px] rounded-[12px] border border-[#E7E8EC] bg-white p-4">
              <View className="mb-3 flex-row gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather
                    key={star}
                    name="star"
                    size={14}
                    color={star <= review.rating ? "#EAB308" : "#E7E8EC"}
                  />
                ))}
              </View>
              <Text className="text-[13px] leading-[20px] text-[#3F4850]" numberOfLines={3}>
                {review.comment?.trim() || review.title?.trim() || "Rated without a comment."}
              </Text>
            </View>
          ))
        )}

        {totalPhotos > 0 && (
          <View className="w-[160px] items-center justify-center rounded-[12px] bg-[#F8D8FF] p-4">
            <Text className="text-[28px] font-extrabold text-[#320047]">+{totalPhotos}</Text>
            <Text className="mt-1 text-[13px] text-[#320047]/80">Customer photos</Text>
          </View>
        )}

        {totalReviews > previewReviews.length && (
          <View className="w-[160px] items-center justify-center rounded-[12px] bg-[#E8F1FB] p-4">
            <Text className="text-[28px] font-extrabold text-[#0F4C6B]">+{totalReviews - previewReviews.length}</Text>
            <Text className="mt-1 text-[13px] text-[#0F4C6B]/80">More reviews</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
