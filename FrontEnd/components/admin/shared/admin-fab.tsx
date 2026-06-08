import { Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

export function AdminFab({ onPress }: { onPress: () => void }) {
  return (
    <View className="absolute bottom-6 right-4 z-40">
      <Pressable 
        onPress={onPress}
        className="h-[56px] w-[56px] items-center justify-center rounded-[16px] bg-[#006397] shadow-lg shadow-[#006397]/40"
      >
        <Feather name="plus" size={24} color="white" />
      </Pressable>
    </View>
  );
}
