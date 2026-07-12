import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { Href, router } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { wishlistService } from "@/services/customer.service";
import { triggerLocalNotification } from "@/utils/local-notification";
import { wishlistStore } from "@/utils/wishlist-store";

/**
 * Shared wishlist state for a single product so multiple UI entry points
 * (the bottom action bar heart + the heart next to the title) stay in sync.
 */
export function useProductWishlist(productId: number) {
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<{ id: number; productId: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!token) {
        setWishlistItems([]);
        return;
      }

      try {
        setLoading(true);
        const response = await wishlistService.getWishlist(token);
        const items = response.data ?? [];
        setWishlistItems(items.map((item) => ({ id: item.id, productId: item.productId })));
        wishlistStore.setCount(items.length);
      } catch {
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [productId, token]);

  const existingWishlistItem = useMemo(
    () => wishlistItems.find((item) => item.productId === productId),
    [productId, wishlistItems],
  );
  const inWishlist = Boolean(existingWishlistItem);

  const toggle = useCallback(async () => {
    if (!token) {
      Alert.alert(
        "Sign-in required",
        "You need to sign in to your Sello account to use this feature.",
        [
          { text: "Later", style: "cancel" },
          { text: "Sign in now", onPress: () => router.push("/auth/login" as Href) },
        ],
      );
      return;
    }

    try {
      setLoading(true);

      if (existingWishlistItem) {
        await wishlistService.deleteWishlistItem(token, existingWishlistItem.id);
      } else {
        await wishlistService.addWishlistItem(token, productId);
      }

      const latest = await wishlistService.getWishlist(token);
      const latestItems = latest.data ?? [];
      setWishlistItems(latestItems.map((item) => ({ id: item.id, productId: item.productId })));
      wishlistStore.setCount(latestItems.length);
      triggerLocalNotification(
        "Wishlist updated",
        existingWishlistItem
          ? "The product has been removed from your wishlist."
          : "The product has been added to your wishlist.",
      );
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Unable to update your wishlist.");
    } finally {
      setLoading(false);
    }
  }, [existingWishlistItem, productId, token]);

  return { inWishlist, loading, toggle };
}
