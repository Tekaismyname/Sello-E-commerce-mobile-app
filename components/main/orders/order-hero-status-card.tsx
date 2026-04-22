import { Order } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type OrderHeroStatusCardProps = {
  order: Order;
};

const statusText: Record<Order["status"], string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  packed: "Đang đóng gói",
  shipping: "Đang giao hàng",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy",
  returned: "Đã trả hàng",
};

export function OrderHeroStatusCard({ order }: OrderHeroStatusCardProps) {
  return (
    <View className="rounded-[16px] bg-[#1579B9] px-5 py-4">
      <Text className="text-[13px] text-[#D7EEF9]">Mã đơn hàng: #{order.orderCode ?? order.id}</Text>
      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-[16px] font-extrabold text-white">{statusText[order.status]}</Text>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/25">
          <Feather name="truck" size={18} color="white" />
        </View>
      </View>
      <Text className="mt-1 text-[13px] text-[#D7EEF9]">
        Dự kiến nhận hàng: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
      </Text>
    </View>
  );
}
