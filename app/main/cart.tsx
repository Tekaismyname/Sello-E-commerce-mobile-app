import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View, LayoutAnimation, Platform, UIManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
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
import { useSettings } from "@/contexts/settings-context";
import { cartService } from "@/services/customer.service";
import { Cart, CartItem } from "@/types/customer";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

export default function CartScreen() {
  const { token } = useAuth();
  const { t, showToast } = useSettings();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);

    if (!token) {
      setError(t("profile_guest_desc", "Đăng nhập để quản lý địa chỉ giao hàng, danh sách yêu thích và cài đặt tài khoản."));
      setLoading(false);
      return;
    }

    try {
      const res = await cartService.getCart(token);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCart(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [token, t]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart]),
  );

  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    if (!token) {
      showToast(t("error", "Lỗi"), "Phiên đăng nhập đã hết hạn.", "error");
      return;
    }

    try {
      await cartService.updateCartItem(token, item.id, { quantity: newQty });
      fetchCart(true);
    } catch (err: any) {
      showToast(t("error", "Lỗi"), err.message, "error");
    }
  };

  const handleToggleSelect = async (item: CartItem) => {
    if (!token) {
      showToast(t("error", "Lỗi"), "Phiên đăng nhập đã hết hạn.", "error");
      return;
    }

    try {
      await cartService.selectCartItem(token, item.id, { selected: !item.selected });
      fetchCart(true);
    } catch (err: any) {
      showToast(t("error", "Lỗi"), err.message, "error");
    }
  };

  const handleDelete = async (item: CartItem) => {
    Alert.alert(
      t("remove_product", "Xóa sản phẩm"),
      t("remove_product_confirm", "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"),
      [
        { text: t("cancel", "Hủy"), style: "cancel" },
        {
          text: t("remove_product", "Xóa"),
          style: "destructive",
          onPress: async () => {
            if (!token) {
              showToast(t("error", "Lỗi"), "Phiên đăng nhập đã hết hạn.", "error");
              return;
            }

            try {
              await cartService.deleteCartItem(token, item.id);
              fetchCart(true);
            } catch (err: any) {
              showToast(t("error", "Lỗi"), err.message, "error");
            }
          },
        },
      ]
    );
  };

  const selectedItems = cart?.items.filter((item) => item.selected) ?? [];
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top"]}>
      <SelloHeader />
      <ScrollView className="flex-1" contentContainerClassName="px-4 py-4">
        <Text className="text-[30px] font-extrabold text-[#1f2934]">{t("cart_title", "Giỏ hàng")}</Text>

        {loading ? <CartLoadingState /> : null}
        {!loading && !token ? (
          <GuestPlaceholder
            icon="shopping-cart"
            title={t("empty_cart", "Giỏ hàng trống")}
            description={t("empty_cart_desc", "Hãy thêm sản phẩm vào giỏ hàng của bạn.")}
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

