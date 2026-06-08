import { useAuth } from "@/contexts/auth-context";
import { useNotificationsView } from "@/hooks/customer/use-notifications-view";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getNotificationIcon = (title: string, content: string) => {
  const text = `${title} ${content}`.toLowerCase();
  if (text.includes("đơn hàng") || text.includes("vận chuyển") || text.includes("giao hàng") || text.includes("order")) {
    return { name: "package" as const, color: "#D97706", bg: "#FEF3C7" }; // Orange/Yellow
  }
  if (text.includes("khuyến mãi") || text.includes("voucher") || text.includes("giảm giá") || text.includes("quà")) {
    return { name: "gift" as const, color: "#059669", bg: "#D1FAE5" }; // Green
  }
  return { name: "bell" as const, color: "#0369A1", bg: "#E8F1FB" }; // Blue
};

export default function NotificationsScreen() {
  const { token } = useAuth();
  const { notifications, loading, saving, error, markRead, markAllRead } = useNotificationsView(token);
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      {/* Header Bar */}
      <View className="h-[56px] flex-row items-center justify-between px-4 bg-white border-b border-[#E5E7EB]">
        <View className="flex-row items-center">
          <Pressable className="h-10 w-10 items-center justify-center active:opacity-60" onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#0369A1" />
          </Pressable>
          <Text className="ml-2 text-[18px] font-extrabold text-[#0F4C6B]">Thông báo</Text>
        </View>

        {unreadCount > 0 && (
          <Pressable
            className="rounded-full bg-[#E8F1FB] px-3.5 py-1.5 active:opacity-75 disabled:opacity-50"
            disabled={saving}
            onPress={async () => {
              try {
                await markAllRead();
              } catch (err: any) {
                Alert.alert("Lỗi", err?.message ?? "Không thể đánh dấu đã đọc.");
              }
            }}
          >
            <Text className="text-[12px] font-bold text-[#0369A1]">Đã đọc tất cả</Text>
          </Pressable>
        )}
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="mt-12 items-center">
            <ActivityIndicator size="large" color="#2F95D2" />
          </View>
        ) : error ? (
          <View className="rounded-[16px] bg-white p-4 border border-[#FCA5A5] shadow-sm">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">{error}</Text>
          </View>
        ) : (
          <View className="gap-3">
            {notifications.map((item) => {
              const iconInfo = getNotificationIcon(item.title, item.content || "");
              return (
                <Pressable
                  key={item.id}
                  disabled={item.isRead || saving}
                  onPress={async () => {
                    try {
                      await markRead(item.id);
                    } catch (err: any) {
                      Alert.alert("Lỗi", err?.message ?? "Không thể cập nhật thông báo.");
                    }
                  }}
                  className={`rounded-[16px] p-4 flex-row gap-3 border shadow-[0px_4px_12px_rgba(0,0,0,0.015)] ${
                    !item.isRead
                      ? "bg-[#F0F7FF] border-[#BFDBFE] border-l-[4px] border-l-[#0369A1]"
                      : "bg-white border-[#E5E7EB]"
                  }`}
                  style={({ pressed }) => ({
                    transform: [{ scale: !item.isRead && pressed ? 0.98 : 1 }],
                  })}
                >
                  {/* Icon tròn sinh động */}
                  <View
                    style={{ backgroundColor: iconInfo.bg }}
                    className="h-10 w-10 items-center justify-center rounded-full mt-0.5"
                  >
                    <Feather name={iconInfo.name} size={18} color={iconInfo.color} />
                  </View>

                  {/* Nội dung thông báo */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between">
                      <Text
                        className={`text-[14px] leading-[18px] text-[#111827] flex-1 pr-1.5 ${
                          !item.isRead ? "font-extrabold text-[#0369A1]" : "font-semibold"
                        }`}
                      >
                        {item.title}
                      </Text>
                      {!item.isRead && <View className="h-2.5 w-2.5 rounded-full bg-[#EF4444] mt-1 shadow-sm" />}
                    </View>
                    <Text className="mt-1 text-[13px] leading-[18px] text-[#4B5563] font-medium">
                      {item.content}
                    </Text>
                    <Text className="mt-2 text-[10.5px] text-[#9CA3AF] font-bold uppercase tracking-wide">
                      {new Date(item.createdAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            {!notifications.length && (
              <View className="items-center justify-center rounded-[20px] bg-white p-10 shadow-sm border border-[#E5E7EB] mt-10">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F3F5FA] mb-4">
                  <Feather name="bell-off" size={28} color="#94A3B8" />
                </View>
                <Text className="text-[16px] font-bold text-[#1E293B]">Hộp thư trống</Text>
                <Text className="mt-1.5 text-center text-[13px] leading-[18px] text-[#64748B] max-w-[80%]">
                  Bạn chưa có thông báo mới nào tại đây. Hãy tiếp tục khám phá Sello nhé!
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
