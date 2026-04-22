import { useCallback, useEffect, useMemo, useState } from "react";
import { wishlistService } from "@/services/customer.service";
import { WishlistItem } from "@/types/customer";

export function useWishlistView(token: string) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!token) {
      setError("Vui long dang nhap de xem wishlist.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await wishlistService.getWishlist(token);
      setWishlist(response.data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Khong the tai wishlist.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addItem = useCallback(
    async (productId: number) => {
      if (!token) return;
      setSaving(true);

      try {
        const response = await wishlistService.addWishlistItem(token, productId);
        setWishlist(response.data ?? []);
      } finally {
        setSaving(false);
      }
    },
    [token],
  );

  const removeItem = useCallback(
    async (wishlistItemId: number) => {
      if (!token) return;
      setSaving(true);

      try {
        await wishlistService.deleteWishlistItem(token, wishlistItemId);
        await fetchWishlist();
      } finally {
        setSaving(false);
      }
    },
    [fetchWishlist, token],
  );

  const productIdSet = useMemo(() => new Set(wishlist.map((item) => item.productId)), [wishlist]);

  return {
    wishlist,
    loading,
    saving,
    error,
    fetchWishlist,
    addItem,
    removeItem,
    productIdSet,
  };
}
