import { FontAwesome } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type SocialAuthOptionsProps = {
  onGooglePress?: () => void;
  onApplePress?: () => void;
};

export function SocialAuthOptions({
  onGooglePress,
  onApplePress,
}: SocialAuthOptionsProps) {
  return (
    <View className="mt-8 items-center">
      <View className="w-full flex-row items-center justify-between">
        <View className="h-[1px] flex-1 bg-[#cfd3da]" />
        <Text className="px-4 text-[14px] font-semibold tracking-[1px] text-[#3f4850]">HOẶC THAM GIA BẰNG</Text>
        <View className="h-[1px] flex-1 bg-[#cfd3da]" />
      </View>

      <View className="mt-6 flex-row gap-6">
        <Pressable
          className="h-[56px] w-[56px] items-center justify-center rounded-full bg-white"
          onPress={onGooglePress}
        >
          <FontAwesome name="google" size={22} color="#EA4335" />
        </Pressable>
        <Pressable
          className="h-[56px] w-[56px] items-center justify-center rounded-full bg-[#191c1f]"
          onPress={onApplePress}
        >
          <FontAwesome name="apple" size={24} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

