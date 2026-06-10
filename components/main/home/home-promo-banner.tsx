import { Image } from "expo-image";
import { Href, router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function HomePromoBanner() {
  const handlePress = () => {
    router.push("/main/product-list" as Href);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="mb-5 overflow-hidden rounded-[20px] bg-[#2d7ea6] active:opacity-95"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View className="flex-row items-center gap-3 px-5 py-5">
        <View className="flex-1">
          <View className="mb-2 self-start rounded-full bg-white/20 px-3 py-1">
            <Text className="text-[10px] font-extrabold uppercase tracking-[1px] text-white">
              SUMMER SALE
            </Text>
          </View>
          <Text className="text-[27px] font-extrabold leading-[31px] text-white">
            Bright summer style
          </Text>
          <Text className="mt-2 text-[14px] font-semibold leading-[19px] text-[#E9F7FF]">
            Up to 50% off on fashion, sneakers, and daily accessories.
          </Text>
          <View className="mt-4 h-9 w-[104px] items-center justify-center rounded-full bg-white shadow-md">
            <Text className="text-[12px] font-extrabold text-[#2d7ea6]">Shop now</Text>
          </View>
        </View>

        <View className="h-[132px] w-[118px] overflow-hidden rounded-[18px] bg-white/10 p-2">
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1100&q=80",
            }}
            className="h-full w-full rounded-[14px]"
            contentFit="cover"
          />
        </View>
      </View>
    </Pressable>
  );
}
