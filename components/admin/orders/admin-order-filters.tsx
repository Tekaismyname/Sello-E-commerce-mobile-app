import { AdminOrderFilter } from "@/hooks/admin/use-admin-orders-view";
import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

type AdminOrderFiltersProps = {
  search: string;
  filter: AdminOrderFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: AdminOrderFilter) => void;
};

const OPTIONS: { value: AdminOrderFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "shipping", label: "Đang giao" },
];

export function AdminOrderFilters({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: AdminOrderFiltersProps) {
  return (
    <View className="rounded-[16px] bg-white p-4">
      <View className="h-11 flex-row items-center rounded-[11px] bg-[#F2F5FA] px-3">
        <Feather name="search" size={17} color="#6B7280" />
        <TextInput
          className="ml-2 flex-1 text-[14px] text-[#1F2934]"
          placeholder="Tìm mã đơn, tên khách hàng..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        {OPTIONS.map((option) => {
          const selected = option.value === filter;
          return (
            <Pressable
              key={option.value}
              onPress={() => onFilterChange(option.value)}
              className={`mr-2 rounded-full px-5 py-2.5 ${
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
    </View>
  );
}
