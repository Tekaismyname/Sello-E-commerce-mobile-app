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
  packed: { label: "DANG VAN CHUYEN", color: "#0369A1", icon: "truck" as const },
  confirmed: { label: "CHO XAC NHAN", color: "#4B5563", icon: "clock" as const },
  pending: { label: "CHO XAC NHAN", color: "#4B5563", icon: "clock" as const },
  cancelled: { label: "DA HUY", color: "#B91C1C", icon: "x-circle" as const },
  returned: { label: "DA TRA", color: "#92400E", icon: "rotate-ccw" as const },
};

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

export function CustomerOrderCard({
  order,
  onOpenDetail,
  onOpenTracking,
  onCancel,
}: CustomerOrderCardProps) {
  const item = order.items[0];
  const status = statusConfig[order.status] ?? statusConfig.pending;
  const imageSource =
    item?.productImage && item.productImage.trim()
      ? item.productImage
      : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80";

  const renderActions = () => {
    if (order.status === "pending" || order.status === "confirmed") {
      return (
        <Pressable
          className="rounded-[10px] bg-[#FDECEC] px-5 py-2.5"
          onPress={() => onCancel(order)}
        >
          <Text className="text-[13px] font-bold text-[#BA1A1A]">Huy don</Text>
        </Pressable>
      );
    }

    if (order.status === "shipping" || order.status === "packed") {
      return (
        <Pressable
          className="rounded-[10px] bg-[#E8EDF3] px-5 py-2.5"
          onPress={() => onOpenTracking(order)}
        >
          <Text className="text-[13px] font-bold text-[#0369A1]">Theo doi don hang</Text>
        </Pressable>
      );
    }

    return (
      <Pressable
        className="rounded-[10px] bg-[#2F95D2] px-5 py-2.5"
        onPress={() => onOpenDetail(order)}
      >
        <Text className="text-[13px] font-bold text-white">Mua lai</Text>
      </Pressable>
    );
  };

  return (
    <View className="rounded-[18px] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name={status.icon} size={14} color={status.color} />
          <Text className="ml-2 text-[13px] font-extrabold" style={{ color: status.color }}>
            {status.label}
          </Text>
        </View>
        <Text className="text-[12px] text-[#6B7280]">
          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
        </Text>
      </View>

      <Pressable className="mt-3 flex-row" onPress={() => onOpenDetail(order)}>
        <Image source={{ uri: imageSource }} className="h-[84px] w-[96px] rounded-[10px]" />
        <View className="ml-4 flex-1">
          <Text className="text-[18px] font-extrabold leading-[24px] text-[#1F2934]" numberOfLines={2}>
            {item?.productName ?? `Don #${order.id}`}
          </Text>
          {!!item?.variantSnapshot && (
            <Text className="mt-1 text-[14px] text-[#64748B]" numberOfLines={1}>
              {item.variantSnapshot}
            </Text>
          )}
          <Text className="mt-1 text-[15px] font-extrabold text-[#0369A1]">
            {formatPrice(order.totalAmount)}
          </Text>
        </View>
      </Pressable>

      <View className="mt-3 flex-row items-center justify-end">
        <Pressable className="mr-3" onPress={() => onOpenDetail(order)}>
          <Text className="text-[13px] font-bold text-[#0369A1]">Xem chi tiet</Text>
        </Pressable>
        {renderActions()}
      </View>
    </View>
  );
}
