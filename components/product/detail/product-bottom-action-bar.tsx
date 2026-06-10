import { UIButton } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cartService, wishlistService } from "@/services/customer.service";
import { triggerLocalNotification } from "@/utils/local-notification";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, View } from "react-native";

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
        "Sign-in required",
        "You need to sign in to your Sello account to use this feature.",
        [
          { text: "Later", style: "cancel" },
          {
            text: "Sign in now",
            onPress: () => router.push("/auth/login" as Href),
          },
        ],
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
        triggerLocalNotification("Added to cart", "The product has been added to your cart.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Unable to add this product to the cart.");
    }
  };

  const toggleWishlist = async () => {
    if (!token) {
      Alert.alert(
        "Sign-in required",
        "You need to sign in to your Sello account to use this feature.",
        [
          { text: "Later", style: "cancel" },
          {
            text: "Sign in now",
            onPress: () => router.push("/auth/login" as Href),
          },
        ],
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
        "Wishlist updated",
        existingWishlistItem
          ? "The product has been removed from your wishlist."
          : "The product has been added to your wishlist.",
      );
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Unable to update your wishlist.");
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
        title="Add to cart"
        variant="light"
        className="h-[52px] flex-1 rounded-[20px] border border-[#1872cc] bg-white"
        textClassName="text-[#1872cc] font-bold text-[15px]"
        onPress={() => addToCart(false)}
      />

      <UIButton
        title="Buy now"
        className="h-[52px] flex-1 items-center justify-center rounded-[12px] bg-[#1872cc]"
        textClassName="text-white-600 font-bold text-[15px]"
        onPress={() => addToCart(true)}
      />
    </View>
  );
}
