import { Image, Pressable, Text, View } from "react-native";

export function HomePromoBanner() {
  return (
    <View className="mb-5 h-[144px] overflow-hidden rounded-[16px] bg-[#2d7ea6]">
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1100&q=80",
        }}
        className="absolute right-0 top-0 h-full w-[45%]"
        resizeMode="cover"
      />
      <View className="h-full px-4 py-4">
        <View className="self-start rounded-full bg-[#c319ff]/30 px-3 py-1">
          <Text className="text-[11px] font-bold uppercase tracking-[0.6px] text-white">KHUYẾN MÃI</Text>
        </View>
        <Text className="mt-2 max-w-[66%] text-[36px] font-extrabold leading-[40px] text-white">Mùa hè rực rỡ</Text>
        <Text className="text-[34px] font-extrabold leading-[38px] text-[#fff3dc]">Giảm đến 50%</Text>
        <Pressable className="mt-3 h-8 w-[92px] items-center justify-center rounded-full bg-white">
          <Text className="text-[12px] font-bold text-[#1a67b5]">Mua ngay</Text>
        </Pressable>
      </View>
    </View>
  );
}
