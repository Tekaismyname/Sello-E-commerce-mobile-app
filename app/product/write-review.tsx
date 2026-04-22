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
import { useAuth } from "@/contexts/auth-context";
import { reviewService } from "@/services/customer.service";

export default function WriteReviewScreen() {
  const params = useLocalSearchParams<{ productId?: string; id?: string }>();
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rawProductId =
    (typeof params.productId === "string" ? params.productId : undefined) ??
    (typeof params.id === "string" ? params.id : undefined);
  const parsedProductId = Number(rawProductId);
  const productId = Number.isFinite(parsedProductId) && parsedProductId > 0 ? parsedProductId : null;

  const submitReview = async () => {
    if (!productId) {
      Alert.alert("Loi", "San pham khong hop le. Vui long quay lai trang chi tiet.");
      return;
    }

    if (rating === 0) {
      Alert.alert("Thong bao", "Vui long chon so sao danh gia.");
      return;
    }

    if (!token) {
      Alert.alert("Loi", "Vui long dang nhap de viet danh gia.");
      return;
    }

    setSubmitting(true);

    try {
      await reviewService.createReview(token, {
        productId,
        rating,
        comment: reviewText || undefined,
      });

      Alert.alert("Thanh cong", "Danh gia da duoc gui!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Loi", err.message || "Khong the gui danh gia.");
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
              <Text className="text-[16px] font-extrabold text-[#191C1F] leading-[22px]">San pham</Text>
              <Text className="mt-1 text-[12px] text-[#6b7682]">Hay de lai danh gia cua ban</Text>
            </View>
          </View>

          <View className="rounded-[16px] bg-white p-5 shadow-sm">
            <ReviewRatingSelector rating={rating} onRatingChange={setRating} />
            <ReviewTextBox value={reviewText} onChangeText={setReviewText} />
            <ReviewImageUploader />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ReviewSubmitBar onSubmit={submitReview} disabled={!productId || rating === 0 || submitting} />
    </SafeAreaView>
  );
}
