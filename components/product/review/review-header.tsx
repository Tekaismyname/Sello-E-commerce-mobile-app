import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function ReviewHeader() {
  return (
    <View className="z-10 border-b border-[#F2F3F7] bg-white px-4 pb-5 pt-3 shadow-sm">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#1a232d" />
        </Pressable>
        <View className="flex-row gap-4">
          <Feather name="search" size={24} color="#1a232d" />
          <Feather name="share-2" size={24} color="#1a232d" />
          <View>
            <Feather name="shopping-cart" size={24} color="#1a232d" />
            <View className="absolute -right-1.5 -top-1.5 h-4 w-4 items-center justify-center rounded-full bg-[#006397]">
              <Text className="text-[9px] font-bold text-white">2</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mb-2 flex-row items-center gap-1">
        <Text className="text-[13px] text-[#6b7682]">Product</Text>
        <Feather name="chevron-right" size={14} color="#6b7682" />
        <Text className="text-[13px] font-semibold text-[#191C1F]">Customer reviews</Text>
      </View>

      <Text className="mb-1 text-[28px] font-extrabold text-[#191C1F]">Reviews & feedback</Text>
      <Text className="text-[14px] leading-[22px] text-[#3F4850]">Discover real experiences shared by our customer community.</Text>
    </View>
  );
}
