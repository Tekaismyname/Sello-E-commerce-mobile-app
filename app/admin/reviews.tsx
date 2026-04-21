import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminReview } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const filters = ["all", "visible", "hidden", "deleted"] as const;

export default function AdminReviewsScreen() {
  const { token, user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canModerate = permissions.includes("reviews:moderate");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await adminService.listReviews(token);
      setReviews(response.data);
    } catch (nextError: any) {
      Alert.alert("Loi", nextError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((item) => item.moderationStatus === filter)),
    [filter, reviews],
  );

  const handleModerate = async (review: AdminReview, status: "visible" | "hidden" | "deleted") => {
    if (!token || !canModerate) return;

    const label = status === "visible" ? "hien" : status === "hidden" ? "an" : "xoa mem";
    Alert.alert("Duyet danh gia", `Ban muon ${label} danh gia nay?`, [
      { text: "Huy", style: "cancel" },
      {
        text: "Xac nhan",
        style: status === "deleted" ? "destructive" : "default",
        onPress: async () => {
          try {
            await adminService.moderateReview(token, review.id, status);
            await fetchReviews();
          } catch (nextError: any) {
            Alert.alert("Loi", nextError.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <AdminHeader title="Kiem duyet danh gia" />
      <ScrollView contentContainerClassName="p-4 pb-24">
        <Text className="text-[18px] font-bold text-[#30343A]">Bo loc</Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {filters.map((item) => {
            const selected = item === filter;
            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                className={`rounded-full px-4 py-3 ${selected ? "bg-[#DCE4ED]" : "bg-[#EEF2F6]"}`}
              >
                <Text className="text-[12px] font-bold text-[#607080]">{item}</Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#0F6CBD" />
          </View>
        ) : (
          <View className="mt-5 gap-4">
            {filteredReviews.map((review) => (
              <View key={review.id} className="rounded-[16px] bg-white p-4 shadow-sm">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-[15px] font-extrabold text-[#30343A]">{review.productName}</Text>
                    <Text className="mt-1 text-[12px] text-[#607080]">
                      by {review.userName} - {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                  <View className="flex-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Feather key={star} name="star" size={14} color={star <= review.rating ? "#F4B400" : "#D8E2EC"} />
                    ))}
                  </View>
                </View>
                <Text className="mt-3 text-[13px] font-bold text-[#30343A]">{review.title ?? "Danh gia"}</Text>
                <Text className="mt-2 text-[13px] leading-[20px] text-[#465362]">{review.comment ?? "Khong co noi dung."}</Text>
                <Text className="mt-3 self-start rounded-full bg-[#F3F5F8] px-3 py-1 text-[11px] font-bold text-[#607080]">
                  {review.moderationStatus}
                </Text>

                {canModerate ? (
                  <View className="mt-4 flex-row justify-end gap-3">
                    <Pressable onPress={() => handleModerate(review, "visible")} className="rounded-[8px] bg-[#EAF4FF] px-4 py-2">
                      <Text className="text-[12px] font-bold text-[#0F6CBD]">Hien</Text>
                    </Pressable>
                    <Pressable onPress={() => handleModerate(review, "hidden")} className="rounded-[8px] bg-[#EEF2F6] px-4 py-2">
                      <Text className="text-[12px] font-bold text-[#465362]">An</Text>
                    </Pressable>
                    <Pressable onPress={() => handleModerate(review, "deleted")} className="rounded-[8px] bg-[#FFECEC] px-4 py-2">
                      <Text className="text-[12px] font-bold text-[#BA1A1A]">Xoa</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
