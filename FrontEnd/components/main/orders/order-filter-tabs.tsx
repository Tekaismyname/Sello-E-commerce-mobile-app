import { CustomerOrderFilter } from "@/hooks/customer/use-orders-view";
import { Pressable, ScrollView, Text } from "react-native";

type OrderFilterTabsProps = {
  value: CustomerOrderFilter;
  onChange: (next: CustomerOrderFilter) => void;
};

const OPTIONS: { value: CustomerOrderFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "shipping", label: "Đang giao" },
];

export function OrderFilterTabs({ value, onChange }: OrderFilterTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`mr-2 rounded-full px-6 py-2.5 ${
              selected ? "bg-[#D98CFF]" : "bg-[#E8EAF0]"
            }`}
          >
            <Text className={`text-[13px] font-bold ${selected ? "text-[#3F1F5A]" : "text-[#4A5565]"}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
