import { Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { UIButton } from "@/components/ui/button";

export function ProductBottomActionBar() {
  return (
    <View className="absolute bottom-0 w-full border-t border-[#e2e8f0] bg-white px-4 py-3 pb-8 flex-row items-center gap-3">
      <Pressable className="h-[52px] w-[52px] items-center justify-center rounded-[12px] border border-[#e2e8f0] bg-white">
        <Feather name="message-circle" size={24} color="#495463" />
      </Pressable>
      <UIButton
        title="Thêm vào giỏ"
        className="flex-1 rounded-[12px] bg-[#1872cc] h-[52px] items-center justify-center"
        textClassName="text-white font-bold text-[16px]"
        onPress={() => {}}
      />
    </View>
  );
}
