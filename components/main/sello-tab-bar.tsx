import { Feather } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabMeta = {
  key: string;
  label: string;
  icon: "home" | "grid" | "shopping-cart" | "file-text" | "user" | "message-square";
};

const tabs: TabMeta[] = [
  { key: "home", label: "Home", icon: "home" },
  { key: "categories", label: "Categories", icon: "grid" },
  { key: "cart", label: "Cart", icon: "shopping-cart" },
  { key: "orders", label: "Orders", icon: "file-text" },
  { key: "chat", label: "Support", icon: "message-square" },
  { key: "profile", label: "Account", icon: "user" },
];

const hiddenRoutes = new Set(["search", "product-list"]);
const routeKey = (name: string) => name.split("/").pop() ?? name;

export function SelloTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const focusedRouteName = routeKey(state.routes[state.index]?.name ?? "");

  if (focusedRouteName && hiddenRoutes.has(focusedRouteName)) {
    return null;
  }

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      className="border-t border-[#e8edf4] bg-white px-2 pt-1"
    >
      <View className="flex-row items-center justify-between">
        {tabs.map((tab) => {
          const routeIndex = state.routes.findIndex((route) => routeKey(route.name) === tab.key);

          if (routeIndex < 0) {
            return <View key={tab.key} className="h-[56px] flex-1" />;
          }

          const route = state.routes[routeIndex];
          const isFocused = state.index === routeIndex;
          const descriptor = descriptors[route.key];
          const tintColor = isFocused ? "#2d6dff" : "#8c96a2";

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

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptor.options.tabBarAccessibilityLabel}
              testID={descriptor.options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="h-[56px] flex-1 items-center justify-center"
            >
              <Feather name={tab.icon} size={18} color={tintColor} />
              <Text
                className={`mt-1 text-[11px] font-semibold ${
                  isFocused ? "text-[#2d6dff]" : "text-[#8c96a2]"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
