import { Tabs } from "expo-router";
import { SelloTabBar } from "@/components/main/sello-tab-bar";

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
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="categories" options={{ title: "Categories" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart" }} />
      <Tabs.Screen name="(order)/orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="chat" options={{ title: "Support" }} />
      <Tabs.Screen name="profile" options={{ title: "Account" }} />
      <Tabs.Screen name="(catalog)/search" options={{ href: null }} />
      <Tabs.Screen name="(catalog)/product-list" options={{ href: null }} />
      <Tabs.Screen name="(checkout)/checkout" options={{ href: null }} />
      <Tabs.Screen name="(payment)/payment" options={{ href: null }} />
      <Tabs.Screen name="(payment)/payment-processing" options={{ href: null }} />
      <Tabs.Screen name="(payment)/payment-success" options={{ href: null }} />
      <Tabs.Screen name="(payment)/payment-failed" options={{ href: null }} />
      <Tabs.Screen name="(order)/order-detail" options={{ href: null }} />
      <Tabs.Screen name="(order)/order-tracking" options={{ href: null }} />
      <Tabs.Screen name="(address)/addresses" options={{ href: null }} />
      <Tabs.Screen name="(address)/address-form" options={{ href: null }} />
      <Tabs.Screen name="(account)/notifications" options={{ href: null }} />
      <Tabs.Screen name="(account)/wishlist" options={{ href: null }} />
      <Tabs.Screen name="(account)/change-password" options={{ href: null }} />
    </Tabs>
  );
}
