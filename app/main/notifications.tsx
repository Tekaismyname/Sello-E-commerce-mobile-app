import { useAuth } from "@/contexts/auth-context";
import { notificationService } from "@/services/customer.service";
import { Notification } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getNotificationBody = (item: Notification) => item.content ?? item.message ?? "";

export default function NotificationsScreen() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await notificationService.getNotifications(token);
      setNotifications(response.data);
    } catch (error: any) {
      Alert.alert("Không thể tải thông báo", error?.message ?? "Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);

      return () => clearInterval(interval);
    }, [fetchNotifications]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkRead = async (item: Notification) => {
    if (!token || item.isRead) return;

    try {
      await notificationService.markNotificationRead(token, item.id);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id ? { ...notification, isRead: true } : notification,
        ),
      );
    } catch (error: any) {
      Alert.alert("Không thể cập nhật", error?.message ?? "Vui lòng thử lại.");
    }
  };

  const handleMarkAllRead = async () => {
    if (!token || unreadCount === 0) return;

    try {
      await notificationService.markAllNotificationsRead(token);
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (error: any) {
      Alert.alert("Không thể cập nhật", error?.message ?? "Vui lòng thử lại.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between bg-white px-4 py-3">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <Feather name="arrow-left" size={20} color="#1F2934" />
        </Pressable>
        <View className="items-center">
          <Text className="text-[18px] font-extrabold text-[#1F2934]">Thông báo</Text>
          <Text className="text-[12px] text-[#607080]">{unreadCount} chưa đọc</Text>
        </View>
        <Pressable onPress={handleMarkAllRead} className="h-10 w-10 items-center justify-center">
          <Feather name="check-circle" size={20} color={unreadCount ? "#0F84C8" : "#A3AAB3"} />
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F84C8" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4 pb-10"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <View className="rounded-[18px] bg-[#EAF5FF] p-4">
            <Text className="text-[15px] font-extrabold text-[#0F6CBD]">Thông báo từ Sello</Text>
            <Text className="mt-1 text-[12px] leading-5 text-[#4D6070]">
              Khi admin gửi thông báo, nội dung sẽ xuất hiện tại đây ngay sau khi bạn mở hoặc kéo để làm mới.
            </Text>
          </View>

          <View className="mt-4 gap-3">
            {notifications.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleMarkRead(item)}
                className={`rounded-[16px] border p-4 ${
                  item.isRead ? "border-[#E8EDF2] bg-white" : "border-[#B9E3FF] bg-[#F2FAFF]"
                }`}
              >
                <View className="flex-row items-start gap-3">
                  <View className={`h-10 w-10 items-center justify-center rounded-full ${item.isRead ? "bg-[#EEF3F7]" : "bg-[#0F84C8]"}`}>
                    <Feather name={item.notificationType === "promotion" ? "gift" : "bell"} size={18} color={item.isRead ? "#607080" : "#FFFFFF"} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between gap-3">
                      <Text className="flex-1 text-[15px] font-extrabold text-[#1F2934]">{item.title}</Text>
                      {!item.isRead ? <View className="mt-1 h-2.5 w-2.5 rounded-full bg-[#0F84C8]" /> : null}
                    </View>
                    <Text className="mt-1 text-[13px] leading-5 text-[#607080]">{getNotificationBody(item)}</Text>
                    <Text className="mt-3 text-[11px] text-[#97A0AB]">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}

            {notifications.length === 0 ? (
              <View className="items-center rounded-[18px] bg-white p-8">
                <Feather name="bell-off" size={28} color="#97A0AB" />
                <Text className="mt-3 text-[14px] font-bold text-[#30343A]">Chưa có thông báo</Text>
                <Text className="mt-1 text-center text-[12px] leading-5 text-[#7B8494]">
                  Các thông báo từ admin và hệ thống sẽ hiển thị tại đây.
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
