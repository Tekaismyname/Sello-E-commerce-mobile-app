import { FontAwesome } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/services/auth.service";
import { useState } from "react";

const featureImage =
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80";

export default function WelcomeScreen() {
  const { signIn } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleGoogleLogin = async () => {
    setErrorText("");
    setLoadingGoogle(true);
    try {
      const response = await authService.loginWithGoogle();
      await signIn(response);

      const normalizedRole = response.user.role?.trim().toLowerCase();
      const redirectPath =
        normalizedRole === "admin"
          ? ("/admin/dashboard" as Href)
          : ("/main/home" as Href);

      router.replace(redirectPath);
    } catch (err: any) {
      console.log("Google login failed:", err.message);
      setErrorText(err.message || "Đăng nhập Google thất bại.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f1f2f5]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-8 pt-6">
          <View className="items-center">
            {/* Logo */}
            <View className="h-[90px] w-[90px] items-center justify-center rounded-[24px] bg-[#157bb8] shadow-[0px_8px_16px_rgba(21,123,184,0.2)]">
              <View className="h-[40px] w-[40px] items-center justify-center rounded-[12px] border border-white/25">
                <Text className="text-[24px] font-extrabold text-white">*</Text>
              </View>
            </View>

            <Text className="mt-4 text-[38px] font-extrabold tracking-[-0.8px] text-[#001d31]">
              SELLO
            </Text>
            <Text className="mt-0.5 text-[13px] font-semibold tracking-[3px] text-[#3f4850]">
              COMMERCE EXPERIENCE
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="mt-8 gap-3">
            <Pressable
              className="h-[52px] items-center justify-center rounded-[12px] bg-[#157bb8] shadow-[0px_8px_16px_rgba(21,123,184,0.2)] active:opacity-90"
              onPress={() => router.push("/auth/login" as Href)}
            >
              <Text className="text-[16px] font-semibold text-white">Đăng nhập</Text>
            </Pressable>

            <Pressable
              className="h-[52px] items-center justify-center rounded-[12px] bg-[#d9dadf] active:opacity-90"
              onPress={() => router.push("/auth/register" as Href)}
            >
              <Text className="text-[16px] font-semibold text-[#157bb8]">Đăng ký</Text>
            </Pressable>

            <Pressable
              className="items-center justify-center py-2 mt-1"
              onPress={() => router.replace("/main/home" as Href)}
            >
              <Text className="text-center text-[14px] font-semibold text-[#3f4850] underline">
                Tiếp tục không đăng nhập
              </Text>
            </Pressable>
          </View>

          {/* Social Auth */}
          <View className="mt-6 items-center">
            <View className="w-full flex-row items-center justify-between">
              <View className="h-[1px] flex-1 bg-[#cfd3da]" />
              <Text className="px-4 text-[12px] font-bold tracking-[1px] text-[#8c96a2]">
                HOẶC THAM GIA BẰNG
              </Text>
              <View className="h-[1px] flex-1 bg-[#cfd3da]" />
            </View>

            {errorText ? (
              <Text className="mt-3 text-center text-[12px] font-medium text-[#BA1A1A]">
                {errorText}
              </Text>
            ) : null}

            <View className="mt-4 flex-row gap-4 justify-center items-center">
              <Pressable
                onPress={handleGoogleLogin}
                disabled={loadingGoogle}
                className="h-[50px] w-[50px] items-center justify-center rounded-full bg-white shadow-[0px_4px_8px_rgba(0,0,0,0.05)] active:opacity-90"
              >
                {loadingGoogle ? (
                  <ActivityIndicator size="small" color="#EA4335" />
                ) : (
                  <FontAwesome name="google" size={20} color="#EA4335" />
                )}
              </Pressable>
              <Pressable
                disabled={loadingGoogle}
                className="h-[50px] w-[50px] items-center justify-center rounded-full bg-[#191c1f] active:opacity-90"
              >
                <FontAwesome name="apple" size={20} color="#ffffff" />
              </Pressable>
            </View>
          </View>

          {/* Banner Trends */}
          <View className="mt-8 rounded-[20px] bg-[#e8edf2] p-3">
            <View className="flex-row gap-3">
              <View className="h-[110px] flex-1 overflow-hidden rounded-[14px] bg-[#d3dbe5]">
                <Image
                  source={{ uri: featureImage }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>

              <View className="h-[110px] flex-1 items-center justify-center rounded-[14px] bg-[#e5ddf1]">
                <Text className="text-[26px] font-extrabold text-[#6b2eb5]">Xu hướng</Text>
                <Text className="mt-0.5 text-[12px] font-semibold tracking-[0.4px] text-[#6b2eb5]">
                  MÙA THU 2026
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Copyright */}
          <View className="mt-6 pb-2 pt-4">
            <Text className="text-center text-[11px] font-semibold tracking-[0.5px] text-[#9fa4ad]">
              BẢN QUYỀN © 2024 SELLO COMMERCE. MỌI QUYỀN ĐƯỢC BẢO LƯU.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
