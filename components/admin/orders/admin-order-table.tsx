import { AdminOrder, AdminOrderStatus } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

type AdminOrderTableProps = {
  orders: AdminOrder[];
  page: number;
  pageCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelectOrder?: (order: AdminOrder) => void;
  onQuickUpdateStatus?: (orderId: number, nextStatus: AdminOrderStatus, note?: string) => Promise<void>;
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#FEF3C7", text: "#D97706", label: "Chờ xác nhận" },
  confirmed: { bg: "#E0F2FE", text: "#0369A1", label: "Đã xác nhận" },
  packed: { bg: "#F3E8FF", text: "#7E22CE", label: "Đang đóng gói" },
  shipping: { bg: "#F1F5F9", text: "#475569", label: "Đang giao hàng" },
  delivered: { bg: "#DCFCE7", text: "#15803D", label: "Đã giao hàng" },
  cancelled: { bg: "#FEE2E2", text: "#B91C1C", label: "Đã hủy" },
  returned: { bg: "#F5F5F4", text: "#78716C", label: "Đã trả hàng" },
  return_requested: { bg: "#FFD8D8", text: "#DC2626", label: "Yêu cầu trả" },
};

export function AdminOrderTable({
  orders,
  page,
  pageCount,
  pageSize,
  onPageChange,
  onSelectOrder,
  onQuickUpdateStatus,
}: AdminOrderTableProps) {
  const from = orders.length ? (page - 1) * pageSize + 1 : 0;
  const to = (page - 1) * pageSize + orders.length;

  const renderQuickActions = (order: AdminOrder) => {
    if (!onQuickUpdateStatus) return null;

    if (order.orderStatus === "pending") {
      return (
        <Pressable
          className="rounded-[10px] bg-[#0369A1] px-4 py-2 active:opacity-90"
          onPress={() => onQuickUpdateStatus(order.id, "confirmed", "Admin xác nhận đơn hàng nhanh")}
        >
          <Text className="text-[12px] font-bold text-white">Xác nhận đơn</Text>
        </Pressable>
      );
    }
    if (order.orderStatus === "confirmed") {
      return (
        <Pressable
          className="rounded-[10px] bg-[#7E22CE] px-4 py-2 active:opacity-90"
          onPress={() => onQuickUpdateStatus(order.id, "packed", "Admin đã đóng gói sản phẩm xong")}
        >
          <Text className="text-[12px] font-bold text-white">Gói hàng xong</Text>
        </Pressable>
      );
    }
    if (order.orderStatus === "packed") {
      return (
        <Pressable
          className="rounded-[10px] bg-[#D97706] px-4 py-2 active:opacity-90"
          onPress={() => onQuickUpdateStatus(order.id, "shipping", "Admin bàn giao cho vận chuyển")}
        >
          <Text className="text-[12px] font-bold text-white">Giao vận chuyển</Text>
        </Pressable>
      );
    }
    if (order.orderStatus === "shipping") {
      return (
        <Pressable
          className="rounded-[10px] bg-[#15803D] px-4 py-2 active:opacity-90"
          onPress={() => onQuickUpdateStatus(order.id, "delivered", "Admin xác nhận đơn hàng đã giao thành công")}
        >
          <Text className="text-[12px] font-bold text-white">Đã giao xong</Text>
        </Pressable>
      );
    }

    return (
      <View className="flex-row items-center">
        <Text className="text-[12px] font-bold text-[#64748B] mr-1">Xem chi tiết</Text>
        <Feather name="chevron-right" size={14} color="#64748B" />
      </View>
    );
  };

  return (
    <View className="rounded-[20px] bg-transparent">
      <View>
        {orders.map((order) => {
          const style = statusStyles[String(order.orderStatus).toLowerCase()] ?? {
            bg: "#F1F5F9",
            text: "#475569",
            label: order.orderStatus,
          };
          return (
            <Pressable
              key={order.id}
              className="mb-4 rounded-[16px] bg-white border border-[#E2E8F0] p-4 shadow-sm"
              onPress={() => onSelectOrder?.(order)}
            >
              {/* Card Header: Code & Status */}
              <View className="flex-row items-center justify-between border-b border-[#F1F5F9] pb-3">
                <View className="flex-row items-center">
                  <Feather name="file-text" size={14} color="#64748B" />
                  <Text className="ml-1.5 text-[14px] font-black text-[#1F2937]">#{order.orderCode}</Text>
                </View>
                <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: style.bg }}>
                  <Text className="text-[11px] font-extrabold" style={{ color: style.text }}>
                    {style.label}
                  </Text>
                </View>
              </View>

              {/* Customer info */}
              <View className="mt-3 flex-row justify-between">
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-[#64748B] uppercase tracking-[0.5px]">Khách hàng</Text>
                  <Text className="text-[14px] font-extrabold text-[#1E293B] mt-0.5">{order.user.fullName}</Text>
                  <Text className="text-[12px] text-[#64748B] mt-0.5">{order.user.email}</Text>
                </View>
                <Text className="text-[11px] text-[#64748B] font-semibold mt-1">
                  {new Date(order.placedAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>

              {/* Products (items) List */}
              {order.items && order.items.length > 0 ? (
                <View className="mt-3 gap-2">
                  {order.items.slice(0, 2).map((item, idx) => {
                    const img = item.productImage && item.productImage.trim()
                      ? item.productImage
                      : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80";
                    return (
                      <View key={item.id ?? idx} className="flex-row items-center bg-[#F8FAFC] rounded-[10px] p-2 border border-[#F1F5F9]">
                        <Image source={{ uri: img }} className="h-10 w-10 rounded-md bg-gray-200" />
                        <View className="ml-3 flex-1 justify-center">
                          <Text className="text-[13px] font-black text-[#1F2937]" numberOfLines={1}>{item.productName}</Text>
                          <Text className="text-[11px] text-[#64748B] font-semibold mt-0.5">Số lượng: {item.quantity} | Giá: {new Intl.NumberFormat("vi-VN").format(item.price)}đ</Text>
                        </View>
                      </View>
                    );
                  })}
                  {order.items.length > 2 && (
                    <Text className="text-[12px] font-bold text-[#64748B] ml-2">+{order.items.length - 2} sản phẩm khác</Text>
                  )}
                </View>
              ) : null}

              {/* Total and actions */}
              <View className="mt-4 flex-row items-center justify-between border-t border-[#F1F5F9] pt-3">
                <View>
                  <Text className="text-[11px] text-[#64748B] font-semibold uppercase tracking-[0.5px]">Tổng tiền</Text>
                  <Text className="text-[17px] font-black text-[#0369A1] mt-0.5">
                    {new Intl.NumberFormat("vi-VN").format(order.totalAmount)}đ
                  </Text>
                </View>

                {/* Render Quick Actions */}
                {renderQuickActions(order)}
              </View>
            </Pressable>
          );
        })}
      </View>

      {!orders.length && (
        <View className="py-8 items-center bg-white rounded-[16px] p-6 border border-[#E2E8F0]">
          <Feather name="package" size={40} color="#CBD5E1" />
          <Text className="text-[14px] font-bold text-[#64748B] mt-2">Không tìm thấy đơn hàng phù hợp.</Text>
        </View>
      )}

      {orders.length > 0 && (
        <View className="mt-3 flex-row items-center justify-between bg-white rounded-[16px] p-4 border border-[#E2E8F0]">
          <Text className="text-[13px] font-bold text-[#64748B]">Hiển thị {from}-{to} của {Math.max(pageCount * pageSize, to)} đơn</Text>

          <View className="flex-row items-center">
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-[8px] bg-[#F1F5F9]"
              onPress={() => onPageChange(Math.max(1, page - 1))}
            >
              <Feather name="chevron-left" size={14} color="#475569" />
            </Pressable>
            <View className="mx-2 h-8 min-w-[28px] items-center justify-center rounded-[8px] bg-[#0369A1] px-2">
              <Text className="text-[12px] font-bold text-white">{page}</Text>
            </View>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-[8px] bg-[#F1F5F9]"
              onPress={() => onPageChange(Math.min(pageCount, page + 1))}
            >
              <Feather name="chevron-right" size={14} color="#475569" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
