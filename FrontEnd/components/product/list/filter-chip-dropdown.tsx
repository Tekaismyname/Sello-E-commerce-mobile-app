import { Pressable, Text, View } from "react-native";
import { DropdownOption } from "@/hooks/main/use-product-list-filters";

type FilterChipDropdownProps = {
  options: DropdownOption[];
  onSelect: (value: string) => void;
};

export function FilterChipDropdown({ options, onSelect }: FilterChipDropdownProps) {
  return (
    <View className="mt-2 rounded-[12px] border border-[#dbe1e8] bg-white p-2">
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onSelect(option.value)}
          className="h-[38px] flex-row items-center justify-between rounded-[8px] px-3"
        >
          <Text className="text-[13px] font-semibold text-[#3f4a57]">{option.label}</Text>
          <Text className="text-[12px] font-bold text-[#8d97a5]">Chọn</Text>
        </Pressable>
      ))}
    </View>
  );
}
