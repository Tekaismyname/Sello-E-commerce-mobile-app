import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type AdminOrderStatsProps = {
  total: number;
  pending: number;
  shipping: number;
  monthlyRevenue: number;
};

const formatMoney = (value: number) => `${(value / 1_000_000).toFixed(1)}M`;

export function AdminOrderStats({ total, pending, shipping, monthlyRevenue }: AdminOrderStatsProps) {
  const cards = [
    { key: "total", label: "Tong don hang", value: String(total), icon: "clipboard", color: "#2563EB" },
    { key: "pending", label: "Cho xu ly", value: String(pending), icon: "briefcase", color: "#D97706" },
    { key: "shipping", label: "Dang giao", value: String(shipping), icon: "truck", color: "#7E22CE" },
    {
      key: "revenue",
      label: "Doanh thu thang",
      value: `${formatMoney(monthlyRevenue)}d`,
      icon: "dollar-sign",
      color: "#047857",
    },
  ] as const;

  return (
    <View className="mt-4 gap-3">
      {cards.map((card) => (
        <View key={card.key} className="rounded-[14px] bg-white p-4">
          <View className="h-8 w-8 items-center justify-center rounded-[8px] bg-[#EEF4FA]">
            <Feather name={card.icon} size={16} color={card.color} />
          </View>
          <Text className="mt-3 text-[14px] text-[#4B5563]">{card.label}</Text>
          <Text className="mt-1 text-[22px] font-extrabold text-[#1F2934]">{card.value}</Text>
        </View>
      ))}
    </View>
  );
}
