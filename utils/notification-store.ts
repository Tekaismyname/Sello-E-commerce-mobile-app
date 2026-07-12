import { useState, useEffect } from "react";

let customerUnreadCount = 0;
let adminUnreadCount = 0;
const listeners = new Set<() => void>();

export const notificationStore = {
  getCustomerCount() {
    return customerUnreadCount;
  },
  setCustomerCount(count: number) {
    customerUnreadCount = count;
    listeners.forEach((l) => l());
  },
  getAdminCount() {
    return adminUnreadCount;
  },
  setAdminCount(count: number) {
    adminUnreadCount = count;
    listeners.forEach((l) => l());
  },
  // Clears both badges at once — used on signIn/signOut so a new session
  // never shows counts that belong to the previous account.
  reset() {
    customerUnreadCount = 0;
    adminUnreadCount = 0;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useNotificationCount(type: "customer" | "admin") {
  const [count, setCount] = useState(
    type === "customer" ? notificationStore.getCustomerCount() : notificationStore.getAdminCount()
  );

  useEffect(() => {
    return notificationStore.subscribe(() => {
      setCount(
        type === "customer" ? notificationStore.getCustomerCount() : notificationStore.getAdminCount()
      );
    });
  }, [type]);

  return count;
}
