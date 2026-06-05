import { Href, router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";

export function HomePromoBanner() {
  const handlePress = () => {
    router.push("/main/product-list" as Href);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="mb-5 h-[144px] overflow-hidden rounded-[16px] bg-[#2d7ea6] active:opacity-95"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1100&q=80",
        }}
        className="absolute right-0 top-0 h-full w-[45%]"
        contentFit="cover"
      />
      <View className="h-full px-4 py-3 justify-center">
        <View className="self-start rounded-full bg-white/20 px-3 py-1 mb-1">
          <Text className="text-[10px] font-extrabold uppercase tracking-[1px] text-white">KHUYẾN MÃI MÙA HÈ</Text>
        </View>
        <Text className="max-w-[62%] text-[24px] font-extrabold leading-[28px] text-white">Mùa hè rực rỡ</Text>
        <Text className="text-[22px] font-extrabold leading-[26px] text-[#fff3dc]">Giảm đến 50%</Text>
        <View className="mt-3 h-8 w-[92px] items-center justify-center rounded-full bg-white shadow-md">
          <Text className="text-[12px] font-extrabold text-[#2d7ea6]">Mua ngay</Text>
        </View>
      </View>
    </Pressable>
  );
}
