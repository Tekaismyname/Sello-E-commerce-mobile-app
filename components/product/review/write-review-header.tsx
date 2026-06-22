import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type WriteReviewHeaderProps = {
  onClose: () => void;
};

export function WriteReviewHeader({ onClose }: WriteReviewHeaderProps) {
  return (
    <View className="z-10 flex-row items-center justify-between bg-white px-4 py-4 shadow-sm">
      <Pressable onPress={onClose} className="h-8 w-8 items-center justify-center">
        <Feather name="x" size={24} color="#1a232d" />
      </Pressable>
      <Text className="text-[18px] font-extrabold text-[#1a232d]">Write review</Text>
      <Pressable className="h-8 w-8 items-center justify-center">
        <Feather name="help-circle" size={24} color="#006397" />
      </Pressable>
    </View>
  );
}
