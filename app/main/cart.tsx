import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { SelloHeader } from "@/components/main/sello-header";
import { useAuth } from "@/contexts/auth-context";
import { addressService, cartService, checkoutService } from "@/services/customer.service";
import { Cart, CartItem } from "@/types/customer";

const COD_PAYMENT_METHOD_ID = 1;

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

export default function CartScreen() {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui long dang nhap de xem gio hang.");
      setLoading(false);
      return;
    }

    try {
      const response = await cartService.getCart(token);
      setCart(response.data);
    } catch (nextError: any) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    const nextQuantity = item.quantity + delta;
    if (nextQuantity < 1) {
      return;
    }

    if (item.availableStock && nextQuantity > item.availableStock) {
      Alert.alert("Vuot ton kho", `San pham nay chi con ${item.availableStock} trong kho.`);
      return;
    }

    if (!token) {
      Alert.alert("Loi", "Phien dang nhap da het han.");
      return;
    }

    try {
      const response = await cartService.updateCartItem(token, item.id, { quantity: nextQuantity });
      setCart(response.data);
    } catch (nextError: any) {
      Alert.alert("Loi", nextError.message);
    }
  };

  const handleToggleSelect = async (item: CartItem) => {
    if (!token) {
      Alert.alert("Loi", "Phien dang nhap da het han.");
      return;
    }

    try {
      const response = await cartService.selectCartItem(token, item.id, { selected: !item.selected });
      setCart(response.data);
    } catch (nextError: any) {
      Alert.alert("Loi", nextError.message);
    }
  };

  const handleDelete = async (item: CartItem) => {
    Alert.alert("Xoa san pham", `Ban co chac muon xoa "${item.productName}"?`, [
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
            await fetchCart();
          } catch (nextError: any) {
            Alert.alert("Loi", nextError.message);
          }
        },
      },
    ]);
  };

  const handleCheckout = async () => {
    if (!token || !cart) {
      return;
    }

    if (cart.selectedItems < 1) {
      Alert.alert("Chua chon san pham", "Hay tick it nhat mot san pham de dat hang.");
      return;
    }

    setCheckoutLoading(true);

    try {
      const addressResponse = await addressService.listAddresses(token);
      const checkoutAddress = addressResponse.data.find((item) => item.isDefault) ?? addressResponse.data[0];

      if (!checkoutAddress) {
        throw new Error("Chua co dia chi mac dinh. Hay tao dia chi truoc khi dat hang.");
      }

      const response = await checkoutService.createOrder(token, {
        addressId: checkoutAddress.id,
        paymentMethodId: COD_PAYMENT_METHOD_ID,
      });

      await fetchCart();

      Alert.alert("Dat hang thanh cong", `Don ${response.data.orderCode} da duoc tao theo hinh thuc COD.`, [
        {
          text: "Xem chi tiet",
          onPress: () =>
            router.push(`/order/${response.data.orderId}` as Href),
        },
        {
          text: "Don hang",
          onPress: () => router.push("/main/orders" as Href),
        },
      ]);
    } catch (nextError: any) {
      Alert.alert("Khong the dat hang", nextError.message ?? "Da co loi xay ra.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top"]}>
      <SelloHeader />

      <ScrollView className="flex-1" contentContainerClassName="px-4 py-4 pb-32">
        <Text className="text-[30px] font-extrabold text-[#1f2934]">Gio hang</Text>

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#006397" />
            <Text className="mt-3 text-[13px] text-[#7d8896]">Dang tai gio hang...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View className="mt-6 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#465362]">{error}</Text>
          </View>
        ) : null}

        {!loading && !error && cart && cart.items.length === 0 ? (
          <View className="mt-6 items-center rounded-[14px] bg-white p-6">
            <Feather name="shopping-cart" size={48} color="#c5cdd6" />
            <Text className="mt-3 text-[15px] font-semibold text-[#465362]">Gio hang trong</Text>
            <Text className="mt-1 text-[12px] text-[#7d8896]">Hay them san pham vao gio hang!</Text>
          </View>
        ) : null}

        {!loading && !error && cart && cart.items.length > 0 ? (
          <View className="mt-4 gap-3">
            <View className="rounded-[14px] bg-[#EAF4FF] p-4">
              <Text className="text-[13px] font-semibold text-[#365066]">
                Da chon {cart.selectedItems}/{cart.totalItems} san pham
              </Text>
              <Text className="mt-2 text-[22px] font-extrabold text-[#102033]">
                {formatPrice(cart.total)}
              </Text>
              <Text className="mt-1 text-[12px] text-[#607080]">Tong tam tinh theo cac san pham duoc chon.</Text>
            </View>

            {cart.items.map((item) => (
              <View key={item.id} className="flex-row items-center gap-3 rounded-[14px] bg-white p-3">
                <Pressable onPress={() => handleToggleSelect(item)}>
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-[4px] border-2 ${
                      item.selected ? "border-[#006397] bg-[#006397]" : "border-[#c5cdd6]"
                    }`}
                  >
                    {item.selected ? <Feather name="check" size={12} color="white" /> : null}
                  </View>
                </Pressable>

                <Image
                  source={{
                    uri:
                      item.productImage ||
                      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80",
                  }}
                  className="h-16 w-16 rounded-[8px]"
                />

                <View className="flex-1">
                  <Text className="text-[14px] font-semibold text-[#1f2934]" numberOfLines={2}>
                    {item.productName}
                  </Text>
                  {item.variantLabel ? (
                    <Text className="mt-1 text-[12px] text-[#607080]">{item.variantLabel}</Text>
                  ) : null}
                  <Text className="mt-1 text-[15px] font-bold text-[#006397]">{formatPrice(item.price)}</Text>

                  <View className="mt-2 flex-row items-center gap-2">
                    <Pressable
                      className="h-7 w-7 items-center justify-center rounded-full bg-[#f2f4f7]"
                      onPress={() => handleUpdateQuantity(item, -1)}
                    >
                      <Feather name="minus" size={14} color="#465362" />
                    </Pressable>
                    <Text className="w-6 text-center text-[14px] font-semibold text-[#1f2934]">{item.quantity}</Text>
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
          </View>
        ) : null}
      </ScrollView>

      {cart && cart.items.length > 0 ? (
        <View className="absolute bottom-0 left-0 right-0 border-t border-[#E3E8EF] bg-white px-4 pb-8 pt-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-[12px] font-semibold text-[#607080]">Tong thanh toan</Text>
              <Text className="mt-1 text-[22px] font-extrabold text-[#102033]">{formatPrice(cart.total)}</Text>
            </View>

            <Text className="text-right text-[12px] text-[#607080]">
              COD mac dinh
              {"\n"}
              theo dia chi default
            </Text>
          </View>

          <Pressable
            className={`items-center justify-center rounded-[14px] py-4 ${
              cart.selectedItems > 0 ? "bg-[#0F172A]" : "bg-[#CBD7E1]"
            }`}
            disabled={checkoutLoading || cart.selectedItems < 1}
            onPress={handleCheckout}
          >
            {checkoutLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[15px] font-bold text-white">Dat hang ngay</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
