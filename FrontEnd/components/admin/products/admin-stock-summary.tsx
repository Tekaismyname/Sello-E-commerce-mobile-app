import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function AdminStockSummary() {
  return (
    <View className="gap-4 mb-6">
      <View className="relative overflow-hidden rounded-[16px] bg-[#006397] p-5 shadow-sm">
        <View className="absolute -right-8 -bottom-8 opacity-10">
          <Feather name="box" size={150} color="white" />
        </View>
        <Text className="text-[14px] text-white/90 mb-1">Total Stock</Text>
        <Text className="text-[36px] font-extrabold text-white mb-4">12,840</Text>
        <View className="self-start flex-row items-center gap-1 rounded-[6px] bg-white/20 px-2 py-1">
          <Feather name="trending-up" size={12} color="white" />
          <Text className="text-[11px] font-bold text-white">+12% vs last month</Text>
        </View>
      </View>

      <View className="rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
        <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-[#E8F5E9]">
          <Feather name="check-circle" size={20} color="#064E3B" />
        </View>
        <Text className="text-[13px] text-[#3F4850] mb-0.5">Active Selling</Text>
        <Text className="text-[24px] font-extrabold text-[#191C1F]">452</Text>
      </View>

      <View className="rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
        <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-[#FFEAEA]">
          <Feather name="alert-triangle" size={20} color="#DC2626" />
        </View>
        <Text className="text-[13px] text-[#3F4850] mb-0.5">Low Stock</Text>
        <Text className="text-[24px] font-extrabold text-[#DC2626]">18</Text>
      </View>
    </View>
  );
}
