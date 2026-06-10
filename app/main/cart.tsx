import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CartEmptyState,
  CartErrorState,
  CartItemCard,
  CartLoadingState,
  CartSummaryCard,
} from "@/components/main/cart";
import { SelloHeader } from "@/components/main/sello-header";
import { GuestPlaceholder } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { cartService } from "@/services/customer.service";
import { Cart, CartItem } from "@/types/customer";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

export default function CartScreen() {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Please sign in to view your cart.");
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

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart]),
  );

  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    if (!token) {
      Alert.alert("Error", "Your session has expired.");
      return;
    }

    try {
      await cartService.updateCartItem(token, item.id, { quantity: newQty });
      fetchCart();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleToggleSelect = async (item: CartItem) => {
    if (!token) {
      Alert.alert("Error", "Your session has expired.");
      return;
    }

    try {
      await cartService.selectCartItem(token, item.id, { selected: !item.selected });
      fetchCart();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDelete = async (item: CartItem) => {
    Alert.alert("Remove product", `Are you sure you want to remove "${item.productName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          if (!token) {
            Alert.alert("Error", "Your session has expired.");
            return;
          }

          try {
            await cartService.deleteCartItem(token, item.id);
            fetchCart();
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  const selectedItems = cart?.items.filter((item) => item.selected) ?? [];
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top"]}>
      <SelloHeader />
      <ScrollView className="flex-1" contentContainerClassName="px-4 py-4">
        <Text className="text-[30px] font-extrabold text-[#1f2934]">Cart</Text>

        {loading ? <CartLoadingState /> : null}
        {!loading && !token ? (
          <GuestPlaceholder
            icon="shopping-cart"
            title="Your cart is empty"
            description="Sign in to your Sello account to view the products saved in your cart."
          />
        ) : !loading && error ? (
          <CartErrorState message={error} />
        ) : null}
        {!loading && token && !error && cart && cart.items.length === 0 ? <CartEmptyState /> : null}

        {!loading && token && !error && cart && cart.items.length > 0 ? (
          <View className="mt-4 gap-3">
            {cart.items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                formatPrice={formatPrice}
                onToggleSelect={handleToggleSelect}
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDelete}
              />
            ))}

            <CartSummaryCard
              selectedCount={selectedItems.length}
              selectedSubtotal={selectedSubtotal}
              formatPrice={formatPrice}
              onCheckout={() => router.push("/main/checkout" as Href)}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
