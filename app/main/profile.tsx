import { Href, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelloHeader } from "@/components/main/sello-header";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top"]}>
      <SelloHeader />
      <ScrollView className="flex-1" contentContainerClassName="px-4 py-4">
        <View className="rounded-[16px] bg-white p-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-[#dfeaff]">
            <Text className="text-[26px] font-extrabold text-[#2d6dff]">S</Text>
          </View>
          <Text className="mt-3 text-[20px] font-extrabold text-[#1f2934]">Sello Member</Text>
          <Text className="text-[12px] text-[#7d8896]">member@sello.app</Text>
        </View>

        <View className="mt-4 gap-2">
          {[
            "Thông tin tài khoản",
            "Địa chỉ giao hàng",
            "Phương thức thanh toán",
            "Thông báo",
          ].map((item) => (
            <Pressable
              key={item}
              className="h-[48px] flex-row items-center justify-between rounded-[12px] bg-white px-3"
            >
              <Text className="text-[14px] font-semibold text-[#364150]">{item}</Text>
              <Feather name="chevron-right" size={16} color="#7e8997" />
            </Pressable>
          ))}
        </View>

        <Pressable
          className="mt-6 h-[46px] items-center justify-center rounded-[12px] border border-[#d7deea] bg-white"
          onPress={() => router.replace("/onboarding/welcome" as Href)}
        >
          <Text className="text-[14px] font-bold text-[#2b3642]">Quay lại màn chào</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
