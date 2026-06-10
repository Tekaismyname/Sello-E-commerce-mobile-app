import { Tabs } from "expo-router";
import { AdminTabBar } from "@/components/admin/shared/admin-tab-bar";
import { useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";

export default function AdminLayout() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchPendingOrders = async () => {
      try {
        const response = await adminService.listOrders(token);
        const pendingCount = (response.data ?? []).filter(
          (order: any) => order.orderStatus === "pending"
        ).length;
        DeviceEventEmitter.emit("pendingOrdersCount", pendingCount);
      } catch (err) {
        console.error("Error polling pending orders count:", err);
      }
    };

    // Run immediately
    fetchPendingOrders();

    // Poll every 30 seconds
    const interval = setInterval(fetchPendingOrders, 30000);

    return () => clearInterval(interval);
  }, [token]);

  return (
    <Tabs
      initialRouteName="dashboard"
      backBehavior="history"
      tabBar={(props) => <AdminTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="products" options={{ title: "Products" }} />
      <Tabs.Screen name="chats" options={{ title: "Chat" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="system" options={{ href: null }} />
      <Tabs.Screen name="menu" options={{ title: "Menu" }} />
      <Tabs.Screen name="users" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="add-product" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="category-form" options={{ href: null }} />
      <Tabs.Screen name="brands" options={{ href: null }} />
      <Tabs.Screen name="vouchers" options={{ href: null }} />
      <Tabs.Screen name="voucher-form" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="reviews" options={{ href: null }} />
    </Tabs>
  );
}
