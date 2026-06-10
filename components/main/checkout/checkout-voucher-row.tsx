import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type CheckoutVoucherRowProps = {
  appliedCode?: string;
  onPress: () => void;
};

export function CheckoutVoucherRow({ appliedCode, onPress }: CheckoutVoucherRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-[14px] bg-white px-4 py-4 flex-row items-center justify-between"
    >
      <View className="flex-row items-center">
        <Feather name="tag" size={17} color="#9333EA" />
        <Text className="ml-2 text-[17px] font-bold text-[#1F2934]">Shop offers</Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-[14px] text-[#4B5563]">
          {appliedCode ? appliedCode : "Choose or enter a code"}
        </Text>
        <Feather name="chevron-right" size={17} color="#64748B" />
      </View>
    </Pressable>
  );
}
