import { Tabs } from "expo-router";
import { AdminTabBar } from "@/components/admin/shared/admin-tab-bar";

export default function AdminLayout() {
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
      <Tabs.Screen name="system" options={{ title: "System" }} />
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
