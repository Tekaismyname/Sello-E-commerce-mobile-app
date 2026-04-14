import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

type ProductReviewOverviewProps = {
  productId: string;
};

export function ProductReviewOverview({ productId }: ProductReviewOverviewProps) {
  return (
    <View className="bg-white py-5">
      <View className="mb-4 flex-row items-center justify-between px-4">
        <Text className="text-[16px] font-extrabold uppercase tracking-wider text-[#191C1F]">Đánh giá thực tế</Text>
        <Pressable onPress={() => router.push(`/product/reviews?id=${productId}` as Href)}>
          <Text className="text-[14px] font-bold text-[#006397]">Xem tất cả</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-3">
        {/* Review Card 1 */}
        <View className="w-[280px] rounded-[12px] border border-[#E7E8EC] bg-white p-4">
          <View className="mb-3 flex-row gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Feather key={star} name="star" size={14} color="#EAB308" />
            ))}
          </View>
          <Text className="text-[13px] leading-[20px] text-[#3F4850]" numberOfLines={3}>
            "Giày rất đẹp, đúng như hình quảng cáo. Đóng gói kỹ càng. Giao hàng cực nhanh luôn, mới đặt hôm qua nay đã có."
          </Text>
        </View>

        {/* Review Card 2 */}
        <View className="w-[160px] items-center justify-center rounded-[12px] bg-[#F8D8FF] p-4">
          <Text className="text-[28px] font-extrabold text-[#320047]">+150</Text>
          <Text className="mt-1 text-[13px] text-[#320047]/80">Ảnh từ khách</Text>
        </View>
      </ScrollView>
    </View>
  );
}
