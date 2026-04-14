import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AdminStatOverview } from "@/types/admin";

export function AdminStatCards({ data }: { data: AdminStatOverview }) {
  return (
    <View className="gap-4">
      {/* Doanh thu */}
      <View className="rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
        <View className="flex-row items-center justify-between mb-4">
          <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#E1F0FF]">
            <Feather name="credit-card" size={20} color="#006397" />
          </View>
          <View className="rounded-full bg-[#E8F5E9] px-2 py-1 flex-row items-center gap-1">
            <Feather name="trending-up" size={12} color="#064E3B" />
            <Text className="text-[12px] font-bold text-[#064E3B]">+12.5%</Text>
          </View>
        </View>
        <Text className="text-[14px] text-[#3F4850] mb-1">Tổng doanh thu</Text>
        <Text className="text-[28px] font-extrabold text-[#191C1F]">{data.totalRevenue}</Text>
      </View>

      {/* Đơn hàng */}
      <View className="rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
        <View className="flex-row items-center justify-between mb-4">
          <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#F3E8FF]">
            <Feather name="truck" size={20} color="#873DA6" />
          </View>
          <View className="rounded-full bg-[#E7E8EC] px-3 py-1">
            <Text className="text-[12px] font-bold text-[#3F4850]">Hôm nay</Text>
          </View>
        </View>
        <Text className="text-[14px] text-[#3F4850] mb-1">Đơn hàng mới</Text>
        <Text className="text-[28px] font-extrabold text-[#191C1F]">{data.newOrders}</Text>
      </View>

      {/* Hết hàng */}
      <View className="rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
        <View className="flex-row items-center justify-between mb-4">
          <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#FFEAEA]">
            <Feather name="box" size={20} color="#DC2626" />
          </View>
          <Text className="text-[13px] font-bold text-[#006397]">Chi tiết</Text>
        </View>
        <Text className="text-[14px] text-[#3F4850] mb-1">Sản phẩm hết hàng</Text>
        <Text className="text-[28px] font-extrabold text-[#191C1F]">{data.outOfStockProducts}</Text>
      </View>
    </View>
  );
}
