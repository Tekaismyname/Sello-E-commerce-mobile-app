import { SelloTabBar } from "@/components/main/sello-tab-bar";
import { Tabs } from "expo-router";

export default function MainLayout() {
  return (
    <Tabs
      initialRouteName="home"
      backBehavior="history"
      tabBar={(props) => <SelloTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Trang chủ" }} />
      <Tabs.Screen name="categories" options={{ title: "Danh mục" }} />
      <Tabs.Screen name="cart" options={{ title: "Giỏ hàng" }} />
      <Tabs.Screen name="orders" options={{ title: "Đơn hàng" }} />
      <Tabs.Screen name="profile" options={{ title: "Tài khoản" }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="product-list" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
