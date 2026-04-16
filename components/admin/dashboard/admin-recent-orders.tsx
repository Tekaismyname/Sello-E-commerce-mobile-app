import { Image, Text, View } from "react-native";
import { AdminRecentOrder } from "@/types/admin";

export function AdminRecentOrders({ orders }: { orders: AdminRecentOrder[] }) {
  return (
    <View className="rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-[18px] font-extrabold text-[#191C1F]">Đơn hàng gần đây</Text>
        <Text className="text-[14px] font-bold text-[#006397]">Tất cả</Text>
      </View>

      <View className="gap-5 mt-2">
        {orders.map((order) => (
          <View key={order.id} className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 rounded-[8px] bg-[#F4F5F7] items-center justify-center overflow-hidden">
                <Image source={{ uri: order.image }} className="h-10 w-10 mix-blend-multiply" />
              </View>
              <View>
                <Text className="text-[14px] font-bold text-[#191C1F] mb-0.5" numberOfLines={1}>{order.name}</Text>
                <Text className="text-[12px] text-[#6b7682]">ID: #{order.id} • {order.time}</Text>
              </View>
            </View>

            <View className="items-end">
              <Text className="text-[14px] font-bold text-[#006397] mb-0.5">{order.price}</Text>
              <View className={`rounded-full px-2 py-0.5 ${order.statusColor}`}>
                <Text className={`text-[10px] font-bold uppercase tracking-wider ${order.statusText}`}>
                  {order.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
