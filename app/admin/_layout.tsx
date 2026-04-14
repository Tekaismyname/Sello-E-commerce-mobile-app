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
      <Tabs.Screen name="users" options={{ title: "Users" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="reports" options={{ title: "Reports" }} />
      <Tabs.Screen name="add-product" options={{ href: null }} />
    </Tabs>
  );
}
