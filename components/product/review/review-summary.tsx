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
    <View className="bg-white px-4 pb-2 pt-5">
      <View className="mb-6 items-center rounded-[16px] border border-[#F2F3F7] py-6 shadow-sm">
        <Text className="mb-1 text-[48px] font-extrabold text-[#006397]">{rating}</Text>
        <View className="mb-2 flex-row gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Feather key={star} name="star" size={18} color="#873DA6" />
          ))}
        </View>
        <Text className="mb-6 text-[13px] text-[#6b7682]">Based on {reviewsCount.toLocaleString()} reviews</Text>

        <View className="w-full gap-3 px-6">
          {bars.map((bar) => (
            <View key={bar.star} className="flex-row items-center">
              <Text className="w-4 text-[12px] font-bold text-[#191C1F]">{bar.star}</Text>
              <View className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-[#E7E8EC]">
                <View className="h-full rounded-full bg-[#006397]" style={{ width: `${bar.percent}%` }} />
              </View>
              <Text className="w-8 text-right text-[12px] text-[#6b7682]">{bar.percent}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
