import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, View } from "react-native";

export function ProductDetailHeader() {
  return (
    <View className="absolute top-0 z-10 w-full flex-row items-center justify-between px-4 py-3" style={{ marginTop: 40 }}>
      <Pressable
        className="h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm"
        onPress={() => router.canGoBack() ? router.back() : router.replace("/main/home" as Href)}
      >
        <Feather name="arrow-left" size={20} color="#1a232d" />
      </Pressable>
      <View className="flex-row gap-3">
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm">
          <Feather name="share-2" size={20} color="#1a232d" />
        </Pressable>
        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm">
          <Feather name="shopping-cart" size={20} color="#1a232d" />
        </Pressable>
      </View>
    </View>
  );
}
