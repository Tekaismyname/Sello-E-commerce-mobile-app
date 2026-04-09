import { FontAwesome } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const featureImage =
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80";

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#f1f2f5]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-8 pt-3">
          <View className="items-center">
            <View className="h-[106px] w-[106px] items-center justify-center rounded-[30px] bg-[#157bb8] shadow-[0px_12px_24px_rgba(21,123,184,0.24)]">
              <View className="h-[48px] w-[48px] items-center justify-center rounded-[14px] border border-white/25">
                <Text className="text-[30px] font-extrabold text-white">*</Text>
              </View>
            </View>

            <Text className="mt-6 text-[56px] font-extrabold tracking-[-1.2px] text-[#001d31]">
              SELLO
            </Text>
            <Text className="mt-1 text-[16px] font-medium tracking-[4px] text-[#3f4850]">
              COMMERCE EXPERIENCE
            </Text>
          </View>

          <View className="mt-10 gap-4">
            <Pressable
              className="h-[56px] items-center justify-center rounded-[12px] bg-[#157bb8] shadow-[0px_10px_18px_rgba(21,123,184,0.28)] active:opacity-90"
              onPress={() => router.push("/auth/login" as Href)}
            >
              <Text className="text-[30px] font-semibold text-white">Đăng nhập</Text>
            </Pressable>

            <Pressable
              className="h-[56px] items-center justify-center rounded-[12px] bg-[#d9dadf] active:opacity-90"
              onPress={() => router.push("/auth/register" as Href)}
            >
              <Text className="text-[30px] font-semibold text-[#157bb8]">Đăng ký</Text>
            </Pressable>

            <Pressable
              className="items-center justify-center py-4"
              onPress={() => router.replace("/main/home" as Href)}
            >
              <Text className="text-center text-[34px] font-medium leading-[44px] text-[#3f4850]">
                Tiếp tục không đăng nhập
              </Text>
            </Pressable>
          </View>

          <View className="mt-8 items-center">
            <View className="w-full flex-row items-center justify-between">
              <View className="h-[1px] flex-1 bg-[#cfd3da]" />
              <Text className="px-4 text-[16px] font-semibold tracking-[1px] text-[#3f4850]">
                HOẶC THAM GIA BẰNG
              </Text>
              <View className="h-[1px] flex-1 bg-[#cfd3da]" />
            </View>

            <View className="mt-6 flex-row gap-6">
              <Pressable className="h-[56px] w-[56px] items-center justify-center rounded-full bg-white">
                <FontAwesome name="google" size={22} color="#EA4335" />
              </Pressable>
              <Pressable className="h-[56px] w-[56px] items-center justify-center rounded-full bg-[#191c1f]">
                <FontAwesome name="apple" size={24} color="#ffffff" />
              </Pressable>
            </View>
          </View>

          <View className="mt-10 rounded-[24px] bg-[#e8edf2] p-3">
            <View className="flex-row gap-3">
              <View className="h-[153px] flex-1 overflow-hidden rounded-[18px] bg-[#d3dbe5]">
                <Image
                  source={{ uri: featureImage }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>

              <View className="h-[153px] flex-1 items-center justify-center rounded-[18px] bg-[#e5ddf1]">
                <Text className="text-[42px] font-extrabold text-[#6b2eb5]">Xu hướng</Text>
                <Text className="mt-1 text-[20px] font-medium tracking-[0.4px] text-[#6b2eb5]">
                  MÙA THU 2024
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-8 pb-4 pt-6">
            <Text className="text-center text-[14px] font-medium tracking-[1px] text-[#9fa4ad]">
              BẢN QUYỀN © 2024 SELLO COMMERCE. MỌI QUYỀN ĐƯỢC BẢO LƯU.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
