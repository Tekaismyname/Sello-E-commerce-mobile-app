import { AdminOrder } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type AdminOrderTableProps = {
  orders: AdminOrder[];
  page: number;
  pageCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelectOrder?: (order: AdminOrder) => void;
};

export function AdminOrderTable({
  orders,
  page,
  pageCount,
  pageSize,
  onPageChange,
  onSelectOrder,
}: AdminOrderTableProps) {
  const orderStatusLabel: Record<string, string> = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    packed: "Đã đóng gói",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
    returned: "Đã trả",
  };
  const from = orders.length ? (page - 1) * pageSize + 1 : 0;
  const to = (page - 1) * pageSize + orders.length;

  return (
    <View className="rounded-[16px] bg-white p-4">
      <View className="flex-row border-b border-[#E5EBF2] pb-3">
        <Text className="flex-1 text-[12px] font-bold text-[#4B5563]">MÃ ĐƠN HÀNG</Text>
        <Text className="flex-[1.5] text-[12px] font-bold text-[#4B5563]">KHÁCH HÀNG</Text>
      </View>

      <View>
        {orders.map((order) => (
          <Pressable
            key={order.id}
            className="flex-row items-center py-4 border-b border-[#EFF3F8]"
            onPress={() => onSelectOrder?.(order)}
          >
            <View className="flex-1">
              <Text className="text-[16px] font-extrabold text-[#0369A1]">#{order.orderCode}</Text>
              <Text className="mt-1 text-[12px] text-[#64748B]">
                {new Intl.NumberFormat("vi-VN").format(order.totalAmount)} đ
              </Text>
            </View>
            <View className="flex-[1.5]">
              <Text className="text-[15px] font-bold text-[#1F2934]">{order.user.fullName}</Text>
              <Text className="mt-0.5 text-[13px] text-[#64748B]">{order.user.email}</Text>
              <Text className="mt-1 text-[12px] font-semibold text-[#334155]">
                {orderStatusLabel[String(order.orderStatus).toLowerCase()] ?? order.orderStatus}
              </Text>
            </View>
            {onSelectOrder ? (
              <Feather name="chevron-right" size={16} color="#64748B" />
            ) : null}
          </Pressable>
        ))}
      </View>

      {!orders.length && (
        <View className="py-8 items-center">
          <Text className="text-[14px] text-[#64748B]">Không có đơn hàng phù hợp.</Text>
        </View>
      )}

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-[13px] leading-[19px] text-[#4B5563]">
          Hiển thị {from}-{to} trong số {Math.max(pageCount * pageSize, to)} đơn hàng
        </Text>

        <View className="flex-row items-center">
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-[8px] bg-[#F3F5F8]"
            onPress={() => onPageChange(Math.max(1, page - 1))}
          >
            <Feather name="chevron-left" size={16} color="#475569" />
          </Pressable>
          <View className="mx-2 h-9 min-w-[34px] items-center justify-center rounded-[8px] bg-[#0369A1] px-2">
            <Text className="text-[14px] font-bold text-white">{page}</Text>
          </View>
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-[8px] bg-[#F3F5F8]"
            onPress={() => onPageChange(Math.min(pageCount, page + 1))}
          >
            <Feather name="chevron-right" size={16} color="#475569" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
