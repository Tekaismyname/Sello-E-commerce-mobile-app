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
      style={{
        paddingBottom: Math.max(insets.bottom, 8),
        borderTopWidth: 1,
        borderTopColor: "#F2F3F7",
        backgroundColor: "white",
        paddingHorizontal: 4,
        paddingTop: 4,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
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
              style={{
                height: 56,
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ position: "relative" }}>
                <Feather name={tab.icon} size={16} color={tintColor} />
                {tab.key === "orders" && !isFocused && pendingCount > 0 && (
                  <View style={{
                    position: "absolute",
                    right: -8,
                    top: -6,
                    height: 14,
                    minWidth: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 7,
                    backgroundColor: "#BA1A1A",
                    paddingHorizontal: 2,
                  }}>
                    <Text style={{ fontSize: 8, fontWeight: "bold", color: "white", lineHeight: 10 }}>
                      {pendingCount}
                    </Text>
                  </View>
                )}
                {tab.key === "chats" && !isFocused && pendingChatsCount > 0 && (
                  <View style={{
                    position: "absolute",
                    right: -8,
                    top: -6,
                    height: 14,
                    minWidth: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 7,
                    backgroundColor: "#BA1A1A",
                    paddingHorizontal: 2,
                  }}>
                    <Text style={{ fontSize: 8, fontWeight: "bold", color: "white", lineHeight: 10 }}>
                      {pendingChatsCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{
                marginTop: 4,
                fontSize: 10,
                fontWeight: "bold",
                color: isFocused ? "#006397" : "#97A0AB",
              }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
