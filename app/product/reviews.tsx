import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ReviewData,
  ReviewFilterBar,
  ReviewHeader,
  ReviewList,
  ReviewSummary,
  WriteReviewFab,
} from "@/components/product";

export default function ProductReviewsScreen() {
  const params = useLocalSearchParams<{ id?: string; productId?: string }>();
  const [selectedFilter, setSelectedFilter] = useState("Tat ca");
  const productId = typeof params.id === "string" ? params.id : params.productId;

  const filters = ["Tat ca", "5 Sao", "4 Sao", "3 Sao", "2 Sao", "1 Sao", "Co hinh anh"];

  const reviews: ReviewData[] = [
    {
      id: "1",
      user: "Nguyen Van A",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
      rating: 5,
      date: "12/05/2026",
      content: "Ao dep, chat lieu mat me. Form chuan nhu mo ta. Giao hang nhanh chong.",
      images: [
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=200&q=80",
      ],
      color: "Black",
      size: "L",
    },
    {
      id: "2",
      user: "Tran Thi B",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      rating: 4,
      date: "10/05/2026",
      content: "Chat luong on trong tam gia. Mau sac giong hinh, tuy nhien phan co ao hoi cung mot chut.",
      images: [],
      color: "Navy",
      size: "M",
    },
    {
      id: "3",
      user: "Le Van C",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
      rating: 5,
      date: "05/05/2026",
      content: "Rat ung y, se ung ho shop dai dai. Mua 2 cai mac thay doi di lam rat tien.",
      images: [],
      color: "White",
      size: "XL",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#f3f5f8]" edges={["top", "bottom"]}>
      <ReviewHeader />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-2">
          <ReviewSummary rating={4.8} reviewsCount={124} />
          <ReviewFilterBar
            filters={filters}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />
        </View>

        <ReviewList reviews={reviews} />

        <View className="h-[80px]" />
      </ScrollView>

      <WriteReviewFab productId={productId} />
    </SafeAreaView>
  );
}
