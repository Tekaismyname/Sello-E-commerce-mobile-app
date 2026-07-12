import { useEffect, useState } from "react";

// Lightweight module singleton mirroring notification-store, so the header
// heart badge stays in sync with the wishlist from anywhere in the app.
let wishlistCount = 0;
const listeners = new Set<() => void>();

export const wishlistStore = {
  getCount() {
    return wishlistCount;
  },
  setCount(count: number) {
    wishlistCount = Math.max(0, count);
    listeners.forEach((l) => l());
  },
  increment() {
    this.setCount(wishlistCount + 1);
  },
  decrement() {
    this.setCount(wishlistCount - 1);
  },
  reset() {
    this.setCount(0);
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useWishlistCount() {
  const [count, setCount] = useState(wishlistStore.getCount());

  useEffect(() => {
    return wishlistStore.subscribe(() => setCount(wishlistStore.getCount()));
  }, []);

  return count;
}
