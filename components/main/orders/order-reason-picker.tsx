import { OrderReasonOption } from "@/utils/order-reasons";
import { Pressable, Text, View } from "react-native";

type OrderReasonPickerProps = {
  options: OrderReasonOption[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  translate: (key: string, fallback: string) => string;
};

export function OrderReasonPicker({ options, selectedCode, onSelect, translate }: OrderReasonPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selectedCode === option.code;
        return (
          <Pressable
            key={option.code}
            onPress={() => onSelect(option.code)}
            className={`rounded-full border px-3 py-2 ${
              isSelected ? "border-[#0F6CBD] bg-[#EAF5FC]" : "border-[#E1E7EF] bg-white"
            }`}
          >
            <Text className={`text-[12px] font-semibold ${isSelected ? "text-[#0F6CBD]" : "text-[#4B5563]"}`}>
              {translate(option.key, option.fallback)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
