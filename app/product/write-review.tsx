import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ReviewRatingSelector,
  ReviewSubmitBar,
  ReviewTextBox,
  WriteReviewHeader,
} from "@/components/product";
import { ReviewImageUploader } from "@/components/product/review/review-image-uploader";
import { reviewService } from "@/services/customer.service";

export default function WriteReviewScreen() {
  const { productId, token } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async () => {
    if (rating === 0) return;

    const authToken = typeof token === "string" ? token : "";

    if (!authToken) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để viết đánh giá.");
      return;
    }

    setSubmitting(true);

    try {
      await reviewService.createReview(authToken, {
        productId: Number(productId) || 0,
        rating,
        comment: reviewText || undefined,
      });

      Alert.alert("Thành công", "Đánh giá đã được gửi!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <WriteReviewHeader onSubmit={submitReview} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="p-4">
          <View className="mb-6 flex-row items-center gap-4 rounded-[16px] bg-white p-4 shadow-sm">
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80" }} 
              className="h-16 w-16 rounded-[8px]" 
            />
            <View className="flex-1">
              <Text className="text-[16px] font-extrabold text-[#191C1F] leading-[22px]">Giày Chạy Bộ Performance Red</Text>
              <Text className="mt-1 text-[12px] text-[#6b7682]">Giao hàng thành công ngày 12/10/2023</Text>
            </View>
          </View>

          <View className="rounded-[16px] bg-white p-5 shadow-sm">
            <ReviewRatingSelector rating={rating} onRatingChange={setRating} />
            <ReviewTextBox value={reviewText} onChangeText={setReviewText} />
            <ReviewImageUploader />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ReviewSubmitBar onSubmit={submitReview} disabled={rating === 0 || submitting} />
    </SafeAreaView>
  );
}

