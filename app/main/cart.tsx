import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SelloHeader } from "@/components/main/sello-header";
import { cartService } from "@/services/customer.service";
import { Cart, CartItem } from "@/types/customer";
import { useAuth } from "@/contexts/auth-context";
import { Href, router } from "expo-router";

export default function CartScreen() {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui long dang nhap de xem gio hang.");
      setLoading(false);
      return;
    }

    try {
      const res = await cartService.getCart(token);
      setCart(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    if (!token) {
      Alert.alert("Loi", "Phien dang nhap da het han.");
      return;
    }

    try {
      await cartService.updateCartItem(token, item.id, { quantity: newQty });
      fetchCart();
    } catch (err: any) {
      Alert.alert("Loi", err.message);
    }
  };

  const handleToggleSelect = async (item: CartItem) => {
    if (!token) {
      Alert.alert("Loi", "Phien dang nhap da het han.");
      return;
    }

    try {
      await cartService.selectCartItem(token, item.id, { selected: !item.selected });
      fetchCart();
    } catch (err: any) {
      Alert.alert("Loi", err.message);
    }
  };

  const handleDelete = async (item: CartItem) => {
    Alert.alert("Xoa san pham", `Ban co chac muon xoa \"${item.productName}\"?`, [
      { text: "Huy", style: "cancel" },
      {
        text: "Xoa",
        style: "destructive",
        onPress: async () => {
          if (!token) {
            Alert.alert("Loi", "Phien dang nhap da het han.");
            return;
          }

          try {
            await cartService.deleteCartItem(token, item.id);
            fetchCart();
          } catch (err: any) {
            Alert.alert("Loi", err.message);
          }
        },
      },
    ]);
  };

  const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;
  const selectedItems = cart?.items.filter((item) => item.selected) ?? [];
  const selectedSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top"]}>
      <SelloHeader />
      <ScrollView className="flex-1" contentContainerClassName="px-4 py-4">
        <Text className="text-[30px] font-extrabold text-[#1f2934]">Gio hang</Text>

        {loading && (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#006397" />
            <Text className="mt-3 text-[13px] text-[#7d8896]">Dang tai gio hang...</Text>
          </View>
        )}

        {!loading && error && (
          <View className="mt-6 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#465362]">{error}</Text>
          </View>
        )}

        {!loading && !error && cart && cart.items.length === 0 && (
          <View className="mt-6 rounded-[14px] bg-white p-6 items-center">
            <Feather name="shopping-cart" size={48} color="#c5cdd6" />
            <Text className="mt-3 text-[15px] font-semibold text-[#465362]">Gio hang trong</Text>
            <Text className="mt-1 text-[12px] text-[#7d8896]">Hay them san pham vao gio hang!</Text>
          </View>
        )}

        {!loading && !error && cart && cart.items.length > 0 && (
          <View className="mt-4 gap-3">
            {cart.items.map((item) => (
              <View key={item.id} className="flex-row items-center rounded-[14px] bg-white p-3 gap-3">
                <Pressable onPress={() => handleToggleSelect(item)}>
                  <View className={`h-5 w-5 rounded-[4px] border-2 items-center justify-center ${item.selected ? "bg-[#006397] border-[#006397]" : "border-[#c5cdd6]"}`}>
                    {item.selected && <Feather name="check" size={12} color="white" />}
                  </View>
                </Pressable>

                <Image
                  source={{ uri: item.productImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80" }}
                  className="h-16 w-16 rounded-[8px]"
                />

                <View className="flex-1">
                  <Text className="text-[14px] font-semibold text-[#1f2934]" numberOfLines={2}>
                    {item.productName}
                  </Text>
                  <Text className="mt-1 text-[15px] font-bold text-[#006397]">{formatPrice(item.price)}</Text>

                  <View className="mt-2 flex-row items-center gap-2">
                    <Pressable
                      className="h-7 w-7 items-center justify-center rounded-full bg-[#f2f4f7]"
                      onPress={() => handleUpdateQuantity(item, -1)}
                    >
                      <Feather name="minus" size={14} color="#465362" />
                    </Pressable>
                    <Text className="text-[14px] font-semibold text-[#1f2934] w-6 text-center">{item.quantity}</Text>
                    <Pressable
                      className="h-7 w-7 items-center justify-center rounded-full bg-[#f2f4f7]"
                      onPress={() => handleUpdateQuantity(item, 1)}
                    >
                      <Feather name="plus" size={14} color="#465362" />
                    </Pressable>
                  </View>
                </View>

                <Pressable onPress={() => handleDelete(item)} className="p-2">
                  <Feather name="trash-2" size={16} color="#BA1A1A" />
                </Pressable>
              </View>
            ))}

            <View className="mt-2 rounded-[14px] bg-white p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] font-semibold text-[#5E6A78]">
                  Da chon {selectedItems.length} san pham
                </Text>
                <Text className="text-[16px] font-extrabold text-[#006397]">
                  {formatPrice(selectedSubtotal)}
                </Text>
              </View>

              <Pressable
                disabled={!selectedItems.length}
                onPress={() => router.push("/main/checkout" as Href)}
                className={`mt-3 h-[48px] items-center justify-center rounded-[12px] ${
                  selectedItems.length ? "bg-[#006397]" : "bg-[#AFC8D8]"
                }`}
              >
                <Text className="text-[14px] font-extrabold text-white">Tien hanh thanh toan</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
