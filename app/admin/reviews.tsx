import { AdminHeader } from "@/components/admin/shared/admin-header";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminReview, AdminReviewModerationStatus } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const REVIEW_FILTERS = ["all", "visible", "hidden", "deleted"] as const;
const REVIEW_FILTER_LABELS: Record<(typeof REVIEW_FILTERS)[number], string> = {
  all: "Tất cả",
  visible: "Hiển thị",
  hidden: "Ẩn",
  deleted: "Đã xóa",
};

type ReviewFilter = (typeof REVIEW_FILTERS)[number];

export default function AdminReviewsScreen() {
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});

  const canReadReviews = hasPermission("reviews:read");
  const canModerateReviews = hasPermission("reviews:moderate");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui lòng đăng nhập tài khoản admin.");
      setLoading(false);
      return;
    }

    if (!canReadReviews) {
      setError("Bạn không có quyền xem danh sách đánh giá.");
      setLoading(false);
      return;
    }

    try {
      const response = await adminService.listReviews(token);
      const rows = response.data ?? [];
      setReviews(rows);
      setNoteDrafts(
        rows.reduce<Record<number, string>>((acc, row) => {
          acc[row.id] = row.moderationNote ?? "";
          return acc;
        }, {}),
      );
    } catch (err: any) {
      setError(err.message ?? "Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  }, [canReadReviews, token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesText =
        !keyword ||
        review.productName.toLowerCase().includes(keyword) ||
        review.userName.toLowerCase().includes(keyword) ||
        review.userEmail.toLowerCase().includes(keyword) ||
        String(review.id).includes(keyword);
      const matchesFilter = filter === "all" || review.moderationStatus === filter;

      return matchesText && matchesFilter;
    });
  }, [filter, reviews, search]);

  const handleModerate = async (
    review: AdminReview,
    moderationStatus: AdminReviewModerationStatus,
  ) => {
    if (!token || !canModerateReviews) {
      return;
    }

    try {
      setSavingId(review.id);
      await adminService.moderateReview(
        token,
        review.id,
        moderationStatus,
        noteDrafts[review.id]?.trim() || undefined,
      );
      await fetchReviews();
    } catch (err: any) {
      Alert.alert("Lỗi", err.message ?? "Không thể cập nhật trạng thái kiểm duyệt.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader title="Kiểm duyệt đánh giá" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-24"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[22px] font-extrabold text-[#191C1F]">Kiểm duyệt đánh giá</Text>
        <Text className="mt-1 text-[14px] leading-[22px] text-[#5b6470]">
          Quản lý đánh giá, ẩn hoặc hiển thị nội dung không phù hợp.
        </Text>

        <View className="mt-4 rounded-[16px] bg-white p-4 shadow-sm">
          <View className="h-11 flex-row items-center rounded-[11px] bg-[#F2F5FA] px-3">
            <Feather name="search" size={17} color="#6B7280" />
            <TextInput
              className="ml-2 flex-1 text-[14px] text-[#1F2934]"
              placeholder="Tìm theo sản phẩm, người dùng, email..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            {REVIEW_FILTERS.map((item) => {
              const selected = item === filter;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  className={`mr-2 rounded-full px-4 py-2 ${
                    selected ? "bg-[#006397]" : "bg-[#E8EDF2]"
                  }`}
                >
                  <Text
                    className={`text-[12px] font-bold ${
                      selected ? "text-white" : "text-[#44515F]"
                    }`}
                  >
                    {REVIEW_FILTER_LABELS[item]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {loading && (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#006397" />
          </View>
        )}

        {!loading && error && (
          <View className="mt-4 rounded-[12px] bg-white p-4">
            <Text className="text-[14px] font-medium text-[#b3261e]">{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <View className="mt-4 gap-3">
            {filteredReviews.map((review) => (
              <View key={review.id} className="rounded-[14px] bg-white p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-[14px] font-bold text-[#191C1F]">
                      #{review.id} - {review.productName}
                    </Text>
                    <Text className="mt-1 text-[12px] text-[#5b6470]">
                      {review.userName} ({review.userEmail}) - {review.rating}/5 sao
                    </Text>
                  </View>
                  <View className="rounded-full bg-[#EEF5FA] px-3 py-1">
                    <Text className="text-[11px] font-bold text-[#0369A1]">
                      {review.moderationStatus}
                    </Text>
                  </View>
                </View>

                {!!review.title && (
                  <Text className="mt-3 text-[13px] font-semibold text-[#1F2934]">{review.title}</Text>
                )}
                {!!review.comment && (
                  <Text className="mt-1 text-[13px] leading-[20px] text-[#4B5563]">
                    {review.comment}
                  </Text>
                )}

                {canModerateReviews ? (
                  <View className="mt-3">
                    <TextInput
                      className="min-h-[78px] rounded-[10px] bg-[#F3F5FA] px-3 py-2 text-[13px] text-[#1F2934]"
                      multiline
                      placeholder="Ghi chú kiểm duyệt (tùy chọn)"
                      placeholderTextColor="#9CA3AF"
                      value={noteDrafts[review.id] ?? ""}
                      onChangeText={(value) =>
                        setNoteDrafts((current) => ({ ...current, [review.id]: value }))
                      }
                    />

                    <View className="mt-3 flex-row flex-wrap gap-2">
                      {(["visible", "hidden", "deleted"] as const).map((status) => (
                        <Pressable
                          key={status}
                          disabled={savingId === review.id || review.moderationStatus === status}
                          onPress={() => handleModerate(review, status)}
                          className={`rounded-full px-3 py-2 ${
                            review.moderationStatus === status ? "bg-[#006397]" : "bg-[#E8EDF2]"
                          }`}
                        >
                          <Text
                            className={`text-[12px] font-bold ${
                              review.moderationStatus === status
                                ? "text-white"
                                : "text-[#44515F]"
                            }`}
                          >
                            {REVIEW_FILTER_LABELS[status]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            ))}

            {!filteredReviews.length && (
              <View className="items-center rounded-[14px] bg-white p-6">
                <Text className="text-[14px] text-[#5b6470]">Không có đánh giá phù hợp.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
