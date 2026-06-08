import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type ReviewRatingSelectorProps = {
  rating: number;
  onRatingChange: (rating: number) => void;
};

export function ReviewRatingSelector({ rating, onRatingChange }: ReviewRatingSelectorProps) {
  const ratingText = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Rất tốt"];

  return (
    <View className="mb-6 items-center">
      <Text className="mb-4 text-[18px] font-extrabold text-[#191C1F]">Bạn thấy sản phẩm này thế nào?</Text>
      <View className="flex-row gap-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => onRatingChange(star)}>
            <Feather
              name="star"
              size={36}
              color={star <= rating ? "#873DA6" : "#CCD1D9"}
            />
          </Pressable>
        ))}
      </View>
      {rating > 0 && (
        <Text className="mt-3 text-[16px] font-bold text-[#873DA6]">
          {ratingText[rating]}
        </Text>
      )}
    </View>
  );
}
