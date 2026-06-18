import { Feather } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { DeviceEventEmitter, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useRouter } from "expo-router";

type TabMeta = {
  key: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  permission?: string;
};

const tabs: TabMeta[] = [
  { key: "dashboard", label: "Dashboard", icon: "home" },
  { key: "products", label: "Product", icon: "grid", permission: "products:read" },
  { key: "chats", label: "Chat", icon: "message-square", permission: "chats:read" },
  { key: "orders", label: "Orders", icon: "truck", permission: "orders:read" },
  { key: "menu", label: "Menu", icon: "menu" },
];

export function AdminTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingChatsCount, setPendingChatsCount] = useState(0);

  useEffect(() => {
    const subOrders = DeviceEventEmitter.addListener("pendingOrdersCount", (count: number) => {
      setPendingCount(count);
    });
    const subChats = DeviceEventEmitter.addListener("pendingChatsCount", (count: number) => {
      setPendingChatsCount(count);
    });
    return () => {
      subOrders.remove();
      subChats.remove();
    };
  }, []);

  // Filter tabs based on active admin's permissions
  const visibleTabs = tabs.filter(
    (tab) => !tab.permission || hasPermission(tab.permission)
  );

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      className="border-t border-[#F2F3F7] bg-white px-1 pt-1"
    >
      <View className="flex-row items-center justify-between">
        {visibleTabs.map((tab) => {
          const routeIndex = state.routes.findIndex((route) => route.name === tab.key);

          if (routeIndex < 0) {
            return null; // Hide the tab completely without rendering an empty space
          }

          const route = state.routes[routeIndex];
          const isFocused = state.index === routeIndex;
          const descriptor = descriptors[route.key];
          if (!descriptor) return null;
          const tintColor = isFocused ? "#006397" : "#97A0AB";

          const onPress = () => {
            const currentRouteName = state.routes[state.index]?.name;
            const isFromHiddenScreen = !currentRouteName || !tabs.some((t) => t.key === currentRouteName);

            if (isFromHiddenScreen) {
              router.navigate(`/admin/${tab.key}` as any);
              return;
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              router.navigate(`/admin/${tab.key}` as any);
            }
          };

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptor.options?.tabBarAccessibilityLabel}
              onPress={onPress}
              className="h-[56px] flex-1 items-center justify-center"
            >
              <View className="relative">
                <Feather name={tab.icon} size={16} color={tintColor} />
                {tab.key === "orders" && pendingCount > 0 && (
                  <View className="absolute -right-2 -top-1.5 h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#BA1A1A] px-0.5">
                    <Text className="text-[8px] font-bold text-white leading-none">
                      {pendingCount}
                    </Text>
                  </View>
                )}
                {tab.key === "chats" && pendingChatsCount > 0 && (
                  <View className="absolute -right-2 -top-1.5 h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#BA1A1A] px-0.5">
                    <Text className="text-[8px] font-bold text-white leading-none">
                      {pendingChatsCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text className={`mt-1 text-[10px] font-bold ${isFocused ? "text-[#006397]" : "text-[#97A0AB]"}`}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
