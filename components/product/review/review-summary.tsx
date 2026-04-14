import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type ReviewSummaryProps = {
  rating: number;
  reviewsCount: number;
};

export function ReviewSummary({ rating, reviewsCount }: ReviewSummaryProps) {
  const bars = [
    { star: 5, percent: 85 },
    { star: 4, percent: 10 },
    { star: 3, percent: 3 },
    { star: 2, percent: 1 },
    { star: 1, percent: 1 },
  ];

  return (
    <View className="bg-white px-4 pt-5 pb-2">
      <View className="items-center mb-6 border border-[#F2F3F7] rounded-[16px] py-6 shadow-sm">
        <Text className="text-[48px] font-extrabold text-[#006397] mb-1">{rating}</Text>
        <View className="flex-row gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Feather key={star} name="star" size={18} color="#873DA6" />
          ))}
        </View>
        <Text className="text-[13px] text-[#6b7682] mb-6">Dựa trên {reviewsCount.toLocaleString()} đánh giá</Text>

        <View className="w-full px-6 gap-3">
          {bars.map((bar) => (
            <View key={bar.star} className="flex-row items-center">
              <Text className="text-[12px] font-bold text-[#191C1F] w-4">{bar.star}</Text>
              <View className="flex-1 mx-3 h-2 rounded-full bg-[#E7E8EC] overflow-hidden">
                <View className="h-full bg-[#006397] rounded-full" style={{ width: `${bar.percent}%` }} />
              </View>
              <Text className="text-[12px] text-[#6b7682] w-8 text-right">{bar.percent}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
