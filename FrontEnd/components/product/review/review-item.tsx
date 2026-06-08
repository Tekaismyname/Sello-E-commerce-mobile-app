import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

export type ReviewData = {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  images: string[];
  color: string;
  size: string;
};

type ReviewItemProps = {
  review: ReviewData;
};

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <View className="mb-4 bg-white rounded-[16px] p-5 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3">
          <Image source={{ uri: review.avatar }} className="h-10 w-10 rounded-full" />
          <View>
            <Text className="text-[14px] font-bold text-[#191C1F]">{review.user}</Text>
            <View className="flex-row items-center gap-2 mt-0.5">
              <View className="flex-row gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather
                    key={star}
                    name="star"
                    size={10}
                    color={star <= review.rating ? "#873DA6" : "#E7E8EC"}
                  />
                ))}
              </View>
              <Text className="text-[10px] font-bold text-[#6b7682] uppercase tracking-wider">Đã Mua Hàng</Text>
            </View>
          </View>
        </View>
        <Text className="text-[12px] text-[#6b7682]">{review.date}</Text>
      </View>

      <Text className="mt-4 text-[14px] leading-[22px] text-[#3F4850]">{review.content}</Text>

      {review.images.length > 0 && (
        <View className="mt-4 flex-row gap-2">
          {review.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} className="h-[80px] w-[80px] rounded-[8px]" />
          ))}
        </View>
      )}

      <View className="mt-5 flex-row items-center gap-5">
        <Pressable className="flex-row items-center gap-1.5">
          <Feather name="thumbs-up" size={16} color="#6b7682" />
          <Text className="text-[13px] font-semibold text-[#6b7682]">Hữu ích (24)</Text>
        </Pressable>
        <Pressable className="flex-row items-center gap-1.5">
          <Feather name="message-square" size={16} color="#6b7682" />
          <Text className="text-[13px] font-semibold text-[#6b7682]">Phản hồi</Text>
        </Pressable>
      </View>
    </View>
  );
}
