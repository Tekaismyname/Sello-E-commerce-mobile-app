import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { buildProductShareUrl } from "@/constants/api";
import { useSettings } from "@/contexts/settings-context";

export function ProductDetailHeader({ productId }: { productId?: number }) {
  const { showToast } = useSettings();

  const handleCopyLink = async () => {
    if (!productId) return;
    await Clipboard.setStringAsync(buildProductShareUrl(productId));
    showToast("Copied", "Product link copied to clipboard.", "success");
  };

  return (
    <View className="absolute top-0 z-10 w-full flex-row items-center justify-between px-4 py-3" style={{ marginTop: 40 }}>
      <Pressable
        className="h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm"
        onPress={() => router.canGoBack() ? router.back() : router.replace("/main/home" as Href)}
      >
        <Feather name="arrow-left" size={20} color="#1a232d" />
      </Pressable>
      <View className="flex-row gap-3">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm"
          onPress={handleCopyLink}
        >
          <Feather name="share-2" size={20} color="#1a232d" />
        </Pressable>
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm"
          onPress={() => router.push("/main/cart" as Href)}
        >
          <Feather name="shopping-cart" size={20} color="#1a232d" />
        </Pressable>
      </View>
    </View>
  );
}
