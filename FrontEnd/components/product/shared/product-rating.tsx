import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type ProductRatingProps = {
  rating: number;
  reviewsCount?: number;
  soldCount?: number;
};

export function ProductRating({ rating, reviewsCount, soldCount }: ProductRatingProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Feather name="star" size={14} color="#006D37" />
      <Text className="text-[14px] font-bold text-[#006D37]">{rating}</Text>
      {reviewsCount !== undefined ? (
        <Text className="text-[12px] font-medium text-[#6b7682]">({reviewsCount} đánh giá)</Text>
      ) : null}
      {soldCount !== undefined ? (
        <>
          <View className="h-1 w-1 rounded-full bg-[#BFC7D2]" />
          <Text className="text-[12px] text-[#6b7682]">Đã bán {soldCount}</Text>
        </>
      ) : null}
    </View>
  );
}
