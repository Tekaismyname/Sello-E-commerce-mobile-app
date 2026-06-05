import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/auth-context";
import { orderService } from "@/services/customer.service";

export default function ProductReviewsScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    productId?: string;
    productName?: string;
    productImage?: string;
  }>();
  const [selectedFilter, setSelectedFilter] = useState("Tat ca");
  const productId = typeof params.id === "string" ? params.id : params.productId;
  const productName = params.productName;
  const productImage = params.productImage;

  const { token } = useAuth();
  const [isEligible, setIsEligible] = useState(false);

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

  const filters = ["Tat ca", "5 Sao", "4 Sao", "3 Sao", "2 Sao", "1 Sao", "Co hinh anh"];

  const reviews: ReviewData[] = [
    {
      id: "1",
      user: "Nguyen Van A",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
      rating: 5,
      date: "12/05/2026",
      content: "Áo đẹp, chất liệu mát mẻ. Form chuẩn như mô tả. Giao hàng nhanh chóng.",
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
      content: "Chất lượng ổn trong tầm giá. Màu sắc giống hình, tuy nhiên phần cổ áo hơi cứng một chút.",
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
      content: "Rất ưng ý, sẽ ủng hộ shop dài dài. Mua 2 cái mặc thay đổi đi làm rất tiện.",
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
