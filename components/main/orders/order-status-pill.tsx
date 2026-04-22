import { OrderStatus } from "@/types/customer";
import { Text, View } from "react-native";

const statusLabel: Record<OrderStatus, string> = {
  pending: "Cho xu ly",
  confirmed: "Da xac nhan",
  packed: "Da dong goi",
  shipping: "Dang giao",
  delivered: "Da giao",
  cancelled: "Da huy",
  returned: "Da tra",
};

const statusStyle: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-[#FFF3E0]", text: "text-[#E65100]" },
  confirmed: { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]" },
  packed: { bg: "bg-[#F3E8FF]", text: "text-[#873DA6]" },
  shipping: { bg: "bg-[#E0F7FA]", text: "text-[#00838F]" },
  delivered: { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]" },
  cancelled: { bg: "bg-[#FFEBEE]", text: "text-[#C62828]" },
  returned: { bg: "bg-[#FFF8E1]", text: "text-[#F57F17]" },
};

type OrderStatusPillProps = {
  status: OrderStatus;
};

export function OrderStatusPill({ status }: OrderStatusPillProps) {
  const style = statusStyle[status] ?? statusStyle.pending;

  return (
    <View className={`rounded-full px-3 py-1 ${style.bg}`}>
      <Text className={`text-[11px] font-bold ${style.text}`}>{statusLabel[status]}</Text>
    </View>
  );
}
