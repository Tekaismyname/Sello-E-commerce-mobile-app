import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/services/auth.service";
import { Href, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Alert, Pressable, Text, View } from "react-native";

export function AdminHeader({ title }: { title?: string }) {
  const { refreshToken, signOut } = useAuth();

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn muốn đăng xuất khỏi tài khoản admin?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
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
        <Pressable className="h-10 w-10 items-center justify-center relative">
          <Feather name="bell" size={22} color="#1a232d" />
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
