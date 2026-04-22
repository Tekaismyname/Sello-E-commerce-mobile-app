import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type TimelineItem = {
  id: number;
  status: string;
  description: string | null;
  createdAt: string;
};

type OrderTimelineProps = {
  timeline: TimelineItem[];
  currentStatus?: string;
};

const stepOrder = ["pending", "confirmed", "packed", "shipping", "delivered", "cancelled", "returned"];

const normalizeStatus = (value: string) => value.toLowerCase().trim();

export function OrderTimeline({ timeline, currentStatus }: OrderTimelineProps) {
  if (!timeline.length) {
    return (
      <View className="rounded-[12px] bg-[#F8F9FB] p-4">
        <Text className="text-[13px] text-[#5E6A78]">Chưa có cập nhật hành trình đơn hàng.</Text>
      </View>
    );
  }

  return (
    <View className="rounded-[16px] bg-white p-4">
      <Text className="text-[15px] font-extrabold text-[#1F2934]">Hành trình đơn hàng</Text>

      <View className="mt-3 gap-3">
        {timeline.map((item, index) => {
          const active =
            !currentStatus ||
            stepOrder.indexOf(normalizeStatus(item.status)) <=
              stepOrder.indexOf(normalizeStatus(currentStatus));

          return (
            <View key={item.id} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  active ? "bg-[#EAF5FC]" : "bg-[#EDF1F6]"
                }`}
              >
                <Feather name={active ? "check" : "minus"} size={13} color={active ? "#006397" : "#9AA5B2"} />
              </View>
              {index < timeline.length - 1 ? (
                <View className={`mt-1 h-7 w-[2px] ${active ? "bg-[#D7E3EE]" : "bg-[#E9EEF4]"}`} />
              ) : null}
            </View>

            <View className="flex-1 pb-1">
              <Text
                className={`text-[13px] font-bold capitalize ${
                  active ? "text-[#1F2934]" : "text-[#9AA5B2]"
                }`}
              >
                {item.status}
              </Text>
              {!!item.description && (
                <Text
                  className={`mt-1 text-[12px] leading-[18px] ${
                    active ? "text-[#5E6A78]" : "text-[#A9B3BE]"
                  }`}
                >
                  {item.description}
                </Text>
              )}
              <Text className="mt-1 text-[11px] text-[#8A97A5]">
                {new Date(item.createdAt).toLocaleString("vi-VN")}
              </Text>
            </View>
          </View>
          );
        })}
      </View>
    </View>
  );
}
