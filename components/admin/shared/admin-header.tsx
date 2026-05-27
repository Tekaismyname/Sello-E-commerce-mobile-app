import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/services/auth.service";
import { Href, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Alert, Pressable, Text, View } from "react-native";
import { useNotificationCount } from "@/utils/notification-store";

export function AdminHeader({ title }: { title?: string }) {
  const { refreshToken, signOut } = useAuth();
  const unreadCount = useNotificationCount("admin");

  const handleLogout = async () => {
    Alert.alert("Log out", "Do you want to log out of admin account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            if (refreshToken) {
              await authService.logout(refreshToken);
            }
          } catch {
            // Ignore logout API errors and clear local state anyway.
          } finally {
            await signOut();
            router.replace("/auth/login" as Href);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-row items-center justify-between bg-white px-4 py-3 shadow-sm z-10">
      <View className="flex-row items-center gap-4">
        <Pressable className="h-10 w-10 items-center justify-center">
          <Feather name="menu" size={24} color="#1a232d" />
        </Pressable>
        {title ? (
          <Text className="text-[20px] font-extrabold text-[#1a232d]">{title}</Text>
        ) : (
          <Text className="text-[24px] font-extrabold text-[#006397] tracking-tight">Sello</Text>
        )}
      </View>
      <View className="flex-row items-center gap-3">
        {title ? (
          <Pressable className="h-10 w-10 items-center justify-center">
            <Feather name="search" size={22} color="#1a232d" />
          </Pressable>
        ) : null}
        <Pressable
          className="h-10 w-10 items-center justify-center relative active:bg-[#f0f2f5] rounded-full"
          onPress={() => router.push("/admin/notifications" as Href)}
        >
          <Feather name="bell" size={22} color="#1a232d" />
          {unreadCount > 0 && (
            <View className="absolute right-1 top-1 h-4 min-w-[16px] items-center justify-center rounded-full bg-[#BA1A1A] px-1">
              <Text className="text-[8px] font-bold text-white leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
        {!title ? (
          <Pressable className="h-10 w-10 items-center justify-center">
            <Feather name="shopping-bag" size={22} color="#1a232d" />
          </Pressable>
        ) : null}
        <Pressable className="h-10 w-10 items-center justify-center" onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#BA1A1A" />
        </Pressable>
      </View>
    </View>
  );
}
