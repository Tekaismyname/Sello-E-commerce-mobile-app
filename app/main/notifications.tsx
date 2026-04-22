import { useAuth } from "@/contexts/auth-context";
import { useNotificationsView } from "@/hooks/customer/use-notifications-view";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const { token } = useAuth();
  const { notifications, loading, saving, error, markRead, markAllRead } = useNotificationsView(token);
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center justify-between px-4">
        <View className="flex-row items-center">
          <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#0369A1" />
          </Pressable>
          <Text className="ml-2 text-[18px] font-extrabold text-[#0F4C6B]">Thong bao</Text>
        </View>

        <Pressable
          className="rounded-full bg-[#E8F1FB] px-3 py-2 disabled:opacity-50"
          disabled={saving || unreadCount === 0}
          onPress={async () => {
            try {
              await markAllRead();
            } catch (err: any) {
              Alert.alert("Loi", err?.message ?? "Khong the danh dau da doc.");
            }
          }}
        >
          <Text className="text-[12px] font-bold text-[#0369A1]">Danh dau tat ca</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="large" color="#2F95D2" />
          </View>
        ) : error ? (
          <View className="rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">{error}</Text>
          </View>
        ) : (
          <View className="gap-3">
            {notifications.map((item) => (
              <View key={item.id} className="rounded-[14px] bg-white p-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-[15px] font-bold text-[#111827]">{item.title}</Text>
                    <Text className="mt-1 text-[13px] leading-[20px] text-[#4B5563]">
                      {item.content}
                    </Text>
                    <Text className="mt-2 text-[11px] text-[#9CA3AF]">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  </View>
                  {!item.isRead ? (
                    <Pressable
                      className="rounded-full bg-[#E8F1FB] px-3 py-2"
                      onPress={async () => {
                        try {
                          await markRead(item.id);
                        } catch (err: any) {
                          Alert.alert("Loi", err?.message ?? "Khong the cap nhat thong bao.");
                        }
                      }}
                    >
                      <Text className="text-[11px] font-bold text-[#0369A1]">Da doc</Text>
                    </Pressable>
                  ) : (
                    <View className="rounded-full bg-[#EAF7EF] px-3 py-2">
                      <Text className="text-[11px] font-bold text-[#1D7A38]">Read</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {!notifications.length && (
              <View className="rounded-[14px] bg-white p-6 items-center">
                <Text className="text-[14px] text-[#6B7280]">Chua co thong bao nao.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
