import { AdminOrderFilter } from "@/hooks/admin/use-admin-orders-view";
import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

type AdminOrderFiltersProps = {
  search: string;
  filter: AdminOrderFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: AdminOrderFilter) => void;
  counts: Record<AdminOrderFilter, number>;
};

const OPTIONS: { value: AdminOrderFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "packed", label: "Chờ lấy hàng" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "return", label: "Trả hàng/Hoàn tiền" },
];

export function AdminOrderFilters({
  search,
  filter,
  onSearchChange,
  onFilterChange,
  counts,
}: AdminOrderFiltersProps) {
  return (
    <View className="rounded-[16px] bg-white p-4">
      <View className="h-11 flex-row items-center rounded-[11px] bg-[#F2F5FA] px-3">
        <Feather name="search" size={17} color="#6B7280" />
        <TextInput
          className="ml-2 flex-1 text-[14px] text-[#1F2934]"
          placeholder="Tìm mã đơn hàng, tên khách hàng..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
        {OPTIONS.map((option) => {
          const selected = option.value === filter;
          const count = counts[option.value] ?? 0;
          return (
            <Pressable
              key={option.value}
              onPress={() => onFilterChange(option.value)}
              className={`mr-2 rounded-full px-4 py-2 flex-row items-center ${
                selected ? "bg-[#0369A1]" : "bg-[#F1F5F9]"
              }`}
            >
              <Text className={`text-[13px] font-bold ${selected ? "text-white" : "text-[#475569]"}`}>
                {option.label}
              </Text>
              <View className={`ml-1.5 rounded-full px-1.5 py-0.5 min-w-[20px] items-center justify-center ${
                selected ? "bg-white/25" : "bg-gray-200"
              }`}>
                <Text className={`text-[11px] font-extrabold ${selected ? "text-white" : "text-[#475569]"}`}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
