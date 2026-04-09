import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

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
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-row items-center gap-3">
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5]"
          onPress={onMenuPress}
        >
          <Feather name="menu" size={18} color="#2d3640" />
        </Pressable>
        <Text className="text-[20px] font-extrabold tracking-[-0.4px] text-[#1a232d]">
          Sello Commerce
        </Text>
      </View>

      <View className="flex-row items-center gap-1">
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full active:bg-[#f0f2f5]"
          onPress={onNotificationPress}
        >
          <Feather name="bell" size={17} color="#2d3640" />
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
