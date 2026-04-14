import { Text, View, Pressable } from "react-native";
import { ReviewData, ReviewItem } from "./review-item";

type ReviewListProps = {
  reviews: ReviewData[];
};

export function ReviewList({ reviews }: ReviewListProps) {
  return (
    <View className="px-4 mt-2">
      {reviews.map((review, index) => (
        <View key={review.id}>
          <ReviewItem 
            review={review} 
          />
          {index === 1 && (
            <View className="mb-4 overflow-hidden rounded-[16px] bg-[#3498DB] p-6 shadow-sm">
              <View className="absolute bottom-[-20px] right-[-20px] opacity-20">
                <Text className="text-[120px] font-extrabold text-white">99</Text>
              </View>
              <Text className="text-[20px] font-extrabold leading-[30px] text-white">
                "Sự hài lòng của bạn là nguồn cảm hứng lớn nhất của chúng tôi."
              </Text>
              <Text className="mt-3 text-[14px] leading-[22px] text-white/90">
                Chúng tôi luôn lắng nghe từng góp ý để cải thiện chất lượng dịch vụ mỗi ngày.
              </Text>
            </View>
          )}
        </View>
      ))}

      <Pressable className="mb-8 mt-2 h-12 w-full flex-row items-center justify-center rounded-[12px] bg-[#E7E8EC]">
        <Text className="text-[15px] font-bold text-[#006397]">Xem thêm đánh giá</Text>
      </Pressable>
    </View>
  );
}
