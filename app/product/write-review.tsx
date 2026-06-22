import { ReviewImageUploader } from "@/components/product/review/review-image-uploader";
import {
  ReviewRatingSelector,
  ReviewSubmitBar,
  ReviewTextBox,
  WriteReviewHeader,
} from "@/components/product";
import { useAuth } from "@/contexts/auth-context";
import { reviewService } from "@/services/customer.service";
import { triggerLocalNotification } from "@/utils/local-notification";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WriteReviewScreen() {
  const params = useLocalSearchParams<{
    productId?: string;
    id?: string;
    productName?: string;
    productImage?: string;
  }>();
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rawProductId =
    (typeof params.productId === "string" ? params.productId : undefined) ??
    (typeof params.id === "string" ? params.id : undefined);
  const parsedProductId = Number(rawProductId);
  const productId = Number.isFinite(parsedProductId) && parsedProductId > 0 ? parsedProductId : null;

  const productName = params.productName ?? "Product";
  const productImage =
    params.productImage ??
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80";

  const closeReview = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/main/orders" as Href);
  };

  const submitReview = async () => {
    if (!productId) {
      Alert.alert("Error", "Invalid product. Please go back to the product details page.");
      return;
    }

    if (rating === 0) {
      Alert.alert("Notice", "Please choose a star rating.");
      return;
    }

    if (!token) {
      Alert.alert("Error", "Please sign in to write a review.");
      return;
    }

    setSubmitting(true);

    try {
      await reviewService.createReview(token, {
        productId,
        rating,
        comment: reviewText || undefined,
      });

      triggerLocalNotification("Review submitted!", "Thank you for sharing your feedback on this product.");

      Alert.alert("Success", "Your review has been submitted!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Unable to submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <WriteReviewHeader onClose={closeReview} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="p-4">
          <View className="mb-6 flex-row items-center gap-4 rounded-[16px] bg-white p-4 shadow-sm">
            <Image source={{ uri: productImage }} className="h-16 w-16 rounded-[8px]" />
            <View className="flex-1">
              <Text className="text-[16px] font-extrabold leading-[22px] text-[#191C1F]" numberOfLines={2}>
                {productName}
              </Text>
              <Text className="mt-1 text-[12px] text-[#6b7682]">Share your thoughts about this product</Text>
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
