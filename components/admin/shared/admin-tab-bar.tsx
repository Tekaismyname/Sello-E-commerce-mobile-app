import { Feather } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePermissions } from "@/hooks/auth/use-permissions";

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
  { key: "system", label: "He thong", icon: "settings", permission: "system:dashboard:read" },
  { key: "menu", label: "Menu", icon: "menu" },
];

export function AdminTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { hasPermission } = usePermissions();

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
          const tintColor = isFocused ? "#006397" : "#97A0AB";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptor.options.tabBarAccessibilityLabel}
              onPress={onPress}
              className="h-[56px] flex-1 items-center justify-center"
            >
              <Feather name={tab.icon} size={16} color={tintColor} />
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
