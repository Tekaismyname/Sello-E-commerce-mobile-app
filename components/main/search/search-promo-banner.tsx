import { Image, Text, View } from "react-native";

export function SearchPromoBanner() {
  return (
    <View className="mt-6 overflow-hidden rounded-[16px] bg-[#27313f]">
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=80",
        }}
        className="h-[150px] w-full opacity-85"
        resizeMode="cover"
      />
      <View className="absolute bottom-0 left-0 right-0 bg-black/35 px-3 py-3">
        <Text className="text-[24px] font-extrabold leading-[27px] text-white">
          Discover your own style
        </Text>
        <Text className="mt-1 text-[12px] font-semibold text-[#e5edf5]">
          Curated collections selected by fashion experts.
        </Text>
      </View>
    </View>
  );
}
