import { useAuth } from "@/contexts/auth-context";
import { useWishlistView } from "@/hooks/customer/use-wishlist-view";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatMoney = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} d`;

export default function WishlistScreen() {
  const { token } = useAuth();
  const { wishlist, loading, saving, error, removeItem } = useWishlistView(token);

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center px-4">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#0369A1" />
        </Pressable>
        <Text className="ml-2 text-[18px] font-extrabold text-[#0F4C6B]">Wishlist</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="large" color="#2F95D2" />
          </View>
        ) : error ? (
          <View className="rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">{error}</Text>
          </View>
        ) : (
          <View className="gap-3">
            {wishlist.map((item) => (
              <View key={item.id} className="rounded-[14px] bg-white p-4">
                <View className="flex-row gap-3">
                  <Image
                    source={{
                      uri:
                        item.productImage ||
                        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80",
                    }}
                    className="h-20 w-20 rounded-[10px] bg-[#E5E7EB]"
                  />
                  <View className="flex-1 justify-between">
                    <View>
                      <Text className="text-[14px] font-bold text-[#111827]">{item.productName}</Text>
                      <Text className="mt-1 text-[13px] font-semibold text-[#0369A1]">
                        {formatMoney(item.productPrice)}
                      </Text>
                    </View>
                    <View className="mt-3 flex-row justify-between">
                      <Pressable
                        className="rounded-[10px] bg-[#E8F1FB] px-3 py-2"
                        onPress={() => router.push(`/product/detail?id=${item.productId}` as Href)}
                      >
                        <Text className="text-[12px] font-bold text-[#0369A1]">Xem san pham</Text>
                      </Pressable>
                      <Pressable
                        className="rounded-[10px] bg-[#FEE2E2] px-3 py-2 disabled:opacity-60"
                        disabled={saving}
                        onPress={async () => {
                          try {
                            await removeItem(item.id);
                          } catch (err: any) {
                            Alert.alert("Loi", err?.message ?? "Khong the xoa khoi wishlist.");
                          }
                        }}
                      >
                        <Text className="text-[12px] font-bold text-[#B91C1C]">Xoa</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {!wishlist.length && (
              <View className="rounded-[14px] bg-white p-6 items-center">
                <Text className="text-[14px] text-[#6B7280]">Wishlist cua ban dang trong.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
