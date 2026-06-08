import { cartService, wishlistService } from "@/services/customer.service";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { UIButton } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { triggerLocalNotification } from "@/utils/local-notification";

type ProductBottomActionBarProps = {
  productId: number;
  variantId?: number | null;
};

export function ProductBottomActionBar({
  productId,
  variantId,
}: ProductBottomActionBarProps) {
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<{ id: number; productId: number }[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!token) {
        setWishlistItems([]);
        return;
      }

      try {
        setWishlistLoading(true);
        const response = await wishlistService.getWishlist(token);
        setWishlistItems((response.data ?? []).map((item) => ({ id: item.id, productId: item.productId })));
      } catch {
        setWishlistItems([]);
      } finally {
        setWishlistLoading(false);
      }
    };

    loadWishlist();
  }, [productId, token]);

  const existingWishlistItem = useMemo(
    () => wishlistItems.find((item) => item.productId === productId),
    [productId, wishlistItems],
  );
  const inWishlist = Boolean(existingWishlistItem);

  const addToCart = async (goCheckout = false) => {
    if (!token) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập tài khoản Sello để thực hiện chức năng này.",
        [
          { text: "Để sau", style: "cancel" },
          {
            text: "Đăng nhập ngay",
            onPress: () => router.push("/auth/login" as Href),
          },
        ]
      );
      return;
    }

    try {
      await cartService.addCartItem(token, {
        productId,
        variantId: variantId ?? null,
        quantity: 1,
      });

      if (goCheckout) {
        router.push("/main/checkout" as Href);
      } else {
        triggerLocalNotification("Thêm vào giỏ hàng thành công 🛒", "Sản phẩm đã được thêm vào giỏ hàng của bạn.");
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message ?? "Không thể thêm vào giỏ hàng.");
    }
  };

  const toggleWishlist = async () => {
    if (!token) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập tài khoản Sello để thực hiện chức năng này.",
        [
          { text: "Để sau", style: "cancel" },
          {
            text: "Đăng nhập ngay",
            onPress: () => router.push("/auth/login" as Href),
          },
        ]
      );
      return;
    }

    try {
      setWishlistLoading(true);

      if (existingWishlistItem) {
        await wishlistService.deleteWishlistItem(token, existingWishlistItem.id);
      } else {
        await wishlistService.addWishlistItem(token, productId);
      }

      const latest = await wishlistService.getWishlist(token);
      setWishlistItems((latest.data ?? []).map((item) => ({ id: item.id, productId: item.productId })));
      triggerLocalNotification(
        "Danh sách yêu thích ❤️",
        existingWishlistItem ? "Đã xóa sản phẩm khỏi danh sách yêu thích." : "Đã thêm sản phẩm vào danh sách yêu thích.",
      );
    } catch (err: any) {
      Alert.alert("Lỗi", err.message ?? "Không thể cập nhật danh sách yêu thích.");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <View className="absolute bottom-0 w-full flex-row items-center gap-3 border-t border-[#e2e8f0] bg-white px-4 py-3 pb-8">
      <Pressable
        className="h-[52px] w-[52px] items-center justify-center rounded-[12px] border border-[#e2e8f0] bg-white disabled:opacity-60"
        disabled={wishlistLoading}
        onPress={toggleWishlist}
      >
        <Feather name="heart" size={24} color={inWishlist ? "#BE123C" : "#495463"} />
      </Pressable>

      <UIButton
        title="Thêm vào giỏ"
        variant="light"
        className="flex-1 h-[52px] rounded-[20px] border border-[#1872cc] bg-white"
        textClassName="text-[#1872cc] font-bold text-[15px]"
        onPress={() => addToCart(false)}
      />

      <UIButton
        title="Mua hàng"
        className="flex-1 rounded-[12px] bg-[#1872cc] h-[52px] items-center justify-center"
        textClassName="text-white-600 font-bold text-[15px]"
        onPress={() => addToCart(true)}
      />
    </View>
  );
}
