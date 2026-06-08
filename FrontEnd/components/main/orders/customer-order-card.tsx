import { Order } from "@/types/customer";
import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

type CustomerOrderCardProps = {
  order: Order;
  onOpenDetail: (order: Order) => void;
  onOpenTracking: (order: Order) => void;
  onCancel: (order: Order) => void;
};

const statusConfig = {
  delivered: { label: "DA GIAO HANG", color: "#15803D", icon: "check-circle" as const },
  shipping: { label: "DANG VAN CHUYEN", color: "#0369A1", icon: "truck" as const },
  packed: { label: "DANG DONG GOI", color: "#0369A1", icon: "package" as const },
  confirmed: { label: "CHO XAC NHAN", color: "#7C3AED", icon: "clock" as const },
  pending: { label: "CHO XAC NHAN", color: "#7C3AED", icon: "clock" as const },
  cancelled: { label: "DA HUY", color: "#B91C1C", icon: "x-circle" as const },
  returned: { label: "DA TRA", color: "#92400E", icon: "rotate-ccw" as const },
  return_requested: { label: "YÊU CẦU TRẢ HÀNG", color: "#DC2626", icon: "rotate-ccw" as const },
};

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export function CustomerOrderCard({
  order,
  onOpenDetail,
  onOpenTracking,
  onCancel,
}: CustomerOrderCardProps) {
  const status = statusConfig[order.status] ?? statusConfig.pending;
  const normalizedItems = order.items.map((item) => ({
    ...item,
    quantity: Math.max(item.quantity ?? 1, 1),
  }));
  const primaryItem = normalizedItems[0];
  const imageSource =
    primaryItem?.productImage && primaryItem.productImage.trim()
      ? primaryItem.productImage
      : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80";
  const orderLabel = order.orderCode?.trim() ? order.orderCode : `DON #${order.id}`;
  const itemCount = normalizedItems.reduce((total, current) => total + current.quantity, 0);
  const hasMultipleItems = normalizedItems.length > 1;

  const renderActions = () => {
    if (order.status === "pending" || order.status === "confirmed") {
      return (
        <Pressable className="rounded-[12px] bg-[#FDECEC] px-4 py-2.5" onPress={() => onCancel(order)}>
          <Text className="text-[13px] font-bold text-[#BA1A1A]">Hủy đơn</Text>
        </Pressable>
      );
    }

    if (order.status === "shipping" || order.status === "packed") {
      return (
        <Pressable className="rounded-[12px] bg-[#E8F1FB] px-4 py-2.5" onPress={() => onOpenTracking(order)}>
          <Text className="text-[13px] font-bold text-[#0369A1]">Theo dõi đơn</Text>
        </Pressable>
      );
    }

    if (order.status === "return_requested") {
      return (
        <View className="rounded-[12px] bg-red-50 px-4 py-2.5">
          <Text className="text-[13px] font-bold text-red-600">Đang chờ duyệt</Text>
        </View>
      );
    }

    if (order.status === "delivered") {
      return (
        <View className="flex-row gap-2">
          <Pressable className="rounded-[12px] bg-[#E8F1FB] px-3.5 py-2.5" onPress={() => onOpenDetail(order)}>
            <Text className="text-[13px] font-bold text-[#0369A1]">Viết đánh giá</Text>
          </Pressable>
          <Pressable className="rounded-[12px] bg-[#0F6CBD] px-3.5 py-2.5" onPress={() => onOpenDetail(order)}>
            <Text className="text-[13px] font-bold text-white">Mua lại</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <Pressable className="rounded-[12px] bg-[#0F6CBD] px-4 py-2.5" onPress={() => onOpenDetail(order)}>
        <Text className="text-[13px] font-bold text-white">Mua lại</Text>
      </Pressable>
    );
  };

  return (
    <View className="rounded-[18px] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name={status.icon} size={14} color={status.color} />
          <Text className="ml-2 text-[12px] font-extrabold tracking-[0.4px]" style={{ color: status.color }}>
            {status.label}
          </Text>
        </View>
        <Text className="text-[12px] font-medium text-[#6B7280]">{formatDate(order.createdAt)}</Text>
      </View>

      <Pressable className="mt-3 flex-row" onPress={() => onOpenDetail(order)}>
        <Image source={{ uri: imageSource }} className="h-[92px] w-[92px] rounded-[14px] bg-[#F3F4F6]" />
        <View className="ml-4 flex-1">
          <Text className="text-[12px] font-bold uppercase tracking-[0.5px] text-[#64748B]">{orderLabel}</Text>

          {!hasMultipleItems ? (
            <>
              <Text className="mt-1 text-[17px] font-extrabold leading-[23px] text-[#1F2934]" numberOfLines={2}>
                {primaryItem?.productName ?? `Đơn hàng #${order.id}`}
              </Text>
              {!!primaryItem?.variantSnapshot && (
                <Text className="mt-1 text-[13px] text-[#64748B]" numberOfLines={1}>
                  {primaryItem.variantSnapshot}
                </Text>
              )}
              <Text className="mt-1 text-[13px] font-medium text-[#64748B]">Số lượng: {primaryItem?.quantity ?? 1}</Text>
            </>
          ) : (
            <View className="mt-1 gap-1">
              {normalizedItems.slice(0, 3).map((item) => (
                <Text
                  key={`${order.id}-${item.id}-${item.productId}`}
                  className="text-[13px] font-semibold leading-[18px] text-[#1F2934]"
                  numberOfLines={1}
                >
                  {item.productName} x{item.quantity}
                </Text>
              ))}
              {normalizedItems.length > 3 ? (
                <Text className="text-[12px] font-medium text-[#64748B]">
                  +{normalizedItems.length - 3} sản phẩm khác
                </Text>
              ) : null}
            </View>
          )}

          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <View className="rounded-full bg-[#EEF5FB] px-2.5 py-1">
              <Text className="text-[11px] font-bold text-[#0F6CBD]">{itemCount} món</Text>
            </View>
            {order.paymentStatus ? (
              <View className="rounded-full bg-[#F4F4F5] px-2.5 py-1">
                <Text className="text-[11px] font-bold uppercase text-[#52525B]">{order.paymentStatus}</Text>
              </View>
            ) : null}
          </View>

          <Text className="mt-3 text-[18px] font-extrabold text-[#0369A1]">{formatPrice(order.totalAmount)}</Text>
        </View>
      </Pressable>

      <View className="mt-4 rounded-[14px] bg-[#F8FAFC] px-3 py-2.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-semibold text-[#64748B]">Mã đơn hàng</Text>
          <Text className="text-[12px] font-extrabold text-[#1F2934]">{orderLabel}</Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <Pressable onPress={() => onOpenDetail(order)}>
          <Text className="text-[13px] font-bold text-[#0369A1]">Xem chi tiết</Text>
        </Pressable>
        {renderActions()}
      </View>
    </View>
  );
}
