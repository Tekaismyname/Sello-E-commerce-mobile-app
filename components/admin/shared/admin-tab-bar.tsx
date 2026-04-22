import { Feather } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabMeta = {
  key: string;
  label: string;
  icon: "home" | "grid" | "users" | "truck" | "bar-chart-2" | "settings";
};

const tabs: TabMeta[] = [
  { key: "dashboard", label: "Trang chủ", icon: "home" },
  { key: "products", label: "Sản phẩm", icon: "grid" },
  { key: "users", label: "Người dùng", icon: "users" },
  { key: "orders", label: "Đơn hàng", icon: "truck" },
  { key: "reports", label: "Báo cáo", icon: "bar-chart-2" },
  { key: "system", label: "Hệ thống", icon: "settings" },
];

export function AdminTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      className="border-t border-[#F2F3F7] bg-white px-1 pt-1"
    >
      <View className="flex-row items-center justify-between">
        {tabs.map((tab) => {
          const routeIndex = state.routes.findIndex((route) => route.name === tab.key);

          if (routeIndex < 0) {
            return <View key={tab.key} className="h-[56px] flex-1" />;
          }

          const route = state.routes[routeIndex];
          const isFocused = state.index === routeIndex;
          const descriptor = descriptors[route.key];
          const tintColor = isFocused ? "#006397" : "#CCD1D9";

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
              <Text
                className={`mt-1 text-[10px] font-bold ${
                  isFocused ? "text-[#006397]" : "text-[#97A0AB]"
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
