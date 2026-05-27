import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useNotificationCount } from "@/utils/notification-store";

type SelloHeaderProps = {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
};

export function SelloHeader({
  onMenuPress,
  onSearchPress,
  onNotificationPress,
}: SelloHeaderProps) {
  const unreadCount = useNotificationCount("customer");

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-row items-center gap-3">
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5]"
          onPress={onMenuPress}
        >
          <Feather name="menu" size={18} color="#2d3640" />
        </Pressable>
        <Pressable onPress={() => router.replace("/main/home" as Href)}>
          <Text className="text-[20px] font-extrabold tracking-[-0.4px] text-[#1a232d]">
            Sello Commerce
          </Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-1">
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5] relative"
          onPress={onNotificationPress ?? (() => router.push("/main/notifications" as Href))}
        >
          <Feather name="bell" size={17} color="#2d3640" />
          {unreadCount > 0 && (
            <View className="absolute -right-0.5 -top-0.5 h-4 min-w-[16px] items-center justify-center rounded-full bg-[#BA1A1A] px-1">
              <Text className="text-[8px] font-bold text-white leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5]"
          onPress={onSearchPress}
        >
          <Feather name="search" size={17} color="#3275f6" />
        </Pressable>
      </View>
    </View>
  );
}
