import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelloHeader } from "@/components/main/sello-header";
import { profileService } from "@/services/customer.service";
import { authService } from "@/services/auth.service";
import { UserProfile } from "@/types/customer";
import { useAuth } from "@/contexts/auth-context";

export default function ProfileScreen() {
  const { token, refreshToken, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    profileService
      .getProfile(token)
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout API errors and clear local state anyway.
    } finally {
      await signOut();
    }

    router.replace("/onboarding/welcome" as Href);
  };

  const displayName = profile?.fullName || "Sello Member";
  const displayEmail = profile?.email || "member@sello.app";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top"]}>
      <SelloHeader />
      <ScrollView className="flex-1" contentContainerClassName="px-4 py-4">
        <View className="rounded-[16px] bg-white p-4">
          {loading ? (
            <ActivityIndicator size="small" color="#006397" />
          ) : (
            <>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-[#dfeaff]">
                <Text className="text-[26px] font-extrabold text-[#2d6dff]">{initials}</Text>
              </View>
              <Text className="mt-3 text-[20px] font-extrabold text-[#1f2934]">{displayName}</Text>
              <Text className="text-[12px] text-[#7d8896]">{displayEmail}</Text>
              {profile?.phone && (
                <Text className="text-[12px] text-[#7d8896]">{profile.phone}</Text>
              )}
            </>
          )}
        </View>

        <View className="mt-4 gap-2">
          <Pressable
            className="h-[48px] flex-row items-center justify-between rounded-[12px] bg-white px-3"
            onPress={() => router.push("/auth/account-completion" as Href)}
          >
            <Text className="text-[14px] font-semibold text-[#364150]">Thong tin tai khoan</Text>
            <Feather name="chevron-right" size={16} color="#7e8997" />
          </Pressable>

          <Pressable
            className="h-[48px] flex-row items-center justify-between rounded-[12px] bg-white px-3"
            onPress={() => router.push("/main/addresses" as Href)}
          >
            <Text className="text-[14px] font-semibold text-[#364150]">Dia chi giao hang</Text>
            <Feather name="chevron-right" size={16} color="#7e8997" />
          </Pressable>

          <Pressable
            className="h-[48px] flex-row items-center justify-between rounded-[12px] bg-white px-3"
            onPress={() => router.push("/main/notifications" as Href)}
          >
            <Text className="text-[14px] font-semibold text-[#364150]">Thong bao</Text>
            <Feather name="chevron-right" size={16} color="#7e8997" />
          </Pressable>

          <Pressable
            className="h-[48px] flex-row items-center justify-between rounded-[12px] bg-white px-3"
            onPress={() => router.push("/main/wishlist" as Href)}
          >
            <Text className="text-[14px] font-semibold text-[#364150]">Wishlist</Text>
            <Feather name="chevron-right" size={16} color="#7e8997" />
          </Pressable>

          <Pressable
            className="h-[48px] flex-row items-center justify-between rounded-[12px] bg-white px-3"
            onPress={() => router.push("/main/change-password" as Href)}
          >
            <Text className="text-[14px] font-semibold text-[#364150]">Doi mat khau</Text>
            <Feather name="chevron-right" size={16} color="#7e8997" />
          </Pressable>
        </View>

        <Pressable
          className="mt-6 h-[46px] items-center justify-center rounded-[12px] border border-[#d7deea] bg-white"
          onPress={handleLogout}
        >
          <Text className="text-[14px] font-bold text-[#BA1A1A]">Dang xuat</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
