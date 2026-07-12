import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";
import { mainService, ProductReviewItem, ProductReviewsData } from "@/services/main.service";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ReviewData,
  ReviewFilterBar,
  ReviewHeader,
  ReviewList,
  ReviewSummary,
  WriteReviewFab,
} from "@/components/product";

const buildAvatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?background=E8F1FB&color=006397&size=100&name=${encodeURIComponent(name || "User")}`;

const mapToReviewData = (item: ProductReviewItem): ReviewData => ({
  id: String(item.id),
  user: item.userName,
  avatar: buildAvatarUrl(item.userName),
  rating: item.rating,
  date: new Date(item.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }),
  content: item.comment?.trim() || item.title?.trim() || "",
  images: item.mediaUrls,
});

export default function ProductReviewsScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    productId?: string;
    productName?: string;
    productImage?: string;
  }>();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const productId = typeof params.id === "string" ? params.id : params.productId;
  const productName = params.productName;
  const productImage = params.productImage;

  const { token } = useAuth();
  const [isEligible, setIsEligible] = useState(false);

  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [summary, setSummary] = useState<ProductReviewsData["summary"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !productId) {
      setIsEligible(false);
      return;
    }
    const parsedProductId = Number(productId);
    orderService
      .getMyOrders(token)
      .then((res) => {
        const orders = res.data ?? [];
        const hasDeliveredOrder = orders.some(
          (order) =>
            order.status === "delivered" &&
            order.items.some((item) => item.productId === parsedProductId),
        );
        setIsEligible(hasDeliveredOrder);
      })
      .catch(() => {
        setIsEligible(false);
      });
  }, [token, productId]);

  useEffect(() => {
    const parsedProductId = Number(productId);
    if (!parsedProductId) {
      setLoading(false);
      setError("Product not found.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    mainService
      .getProductReviews(parsedProductId, { page: 1, limit: 50 })
      .then((data) => {
        if (cancelled) return;
        setReviews(data.items.map(mapToReviewData));
        setSummary(data.summary);
        setError(null);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message ?? "Unable to load reviews.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const filters = ["All", "5 stars", "4 stars", "3 stars", "2 stars", "1 star", "With images"];

  const filteredReviews = useMemo(() => {
    if (selectedFilter === "All") return reviews;
    if (selectedFilter === "With images") {
      return reviews.filter((review) => (review.images?.length ?? 0) > 0);
    }
    const star = parseInt(selectedFilter, 10);
    if (!Number.isNaN(star)) {
      return reviews.filter((review) => review.rating === star);
    }
    return reviews;
  }, [reviews, selectedFilter]);

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f8]" edges={["top", "bottom"]}>
      <ReviewHeader />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#006397" />
          </View>
        ) : error ? (
          <View className="m-4 rounded-[16px] border border-[#FCA5A5] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">{error}</Text>
          </View>
        ) : (
          <>
            <View className="mb-2">
              <ReviewSummary
                rating={summary?.averageRating ?? 0}
                reviewsCount={summary?.totalReviews ?? 0}
                breakdown={summary?.ratingBreakdown}
              />
              <ReviewFilterBar
                filters={filters}
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
              />
            </View>

            {filteredReviews.length > 0 ? (
              <ReviewList reviews={filteredReviews} />
            ) : (
              <View className="mx-4 mt-6 items-center rounded-[16px] bg-white p-8">
                <Feather name="message-circle" size={28} color="#94A3B8" />
                <Text className="mt-3 text-[15px] font-bold text-[#191C1F]">
                  {reviews.length === 0 ? "No reviews yet" : "No reviews match this filter"}
                </Text>
                <Text className="mt-1 text-center text-[13px] text-[#6b7682]">
                  {reviews.length === 0
                    ? "Be the first to review this product."
                    : "Try a different star rating or filter."}
                </Text>
              </View>
            )}
          </>
        )}

        <View className="h-[80px]" />
      </ScrollView>

      {isEligible ? (
        <WriteReviewFab
          productId={productId}
          productName={productName}
          productImage={productImage}
        />
      ) : null}
    </SafeAreaView>
  );
}
