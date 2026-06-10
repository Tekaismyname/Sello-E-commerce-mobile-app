import { Image, Text, View } from "react-native";

export function ProductBanner() {
  return (
    <View className="bg-white px-4 py-5">
      <View className="h-[200px] w-full overflow-hidden rounded-[12px]">
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80" }}
          className="h-full w-full"
          resizeMode="cover"
        />
        <View className="absolute bottom-0 left-0 right-0 bg-black/40 p-5">
          <Text className="text-[24px] font-extrabold text-white">Push Past Every Limit</Text>
          <Text className="mt-1 text-[13px] text-white/80">A timeless streetwear icon built for bold style.</Text>
        </View>
      </View>
    </View>
  );
}
