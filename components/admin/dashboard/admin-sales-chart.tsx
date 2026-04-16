import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function AdminSalesChart() {
  const chartData = [
    { day: "Th 2", height: 40, active: false },
    { day: "Th 3", height: 60, active: false },
    { day: "Th 4", height: 90, active: true },
    { day: "Th 5", height: 30, active: false },
    { day: "Th 6", height: 75, active: false },
    { day: "Th 7", height: 45, active: false },
    { day: "CN", height: 10, active: false },
  ];

  return (
    <View className="rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
      <View className="flex-row items-center justify-between mb-8">
        <View>
          <Text className="text-[18px] font-extrabold text-[#191C1F]">Phân tích doanh thu</Text>
          <Text className="text-[12px] text-[#6b7682] mt-0.5">Biểu đồ so sánh doanh thu theo tuần</Text>
        </View>
        <View className="flex-row items-center gap-1 rounded-[8px] bg-[#F4F5F7] px-3 py-1.5">
          <Text className="text-[12px] font-bold text-[#3F4850]">Tháng này</Text>
          <Feather name="chevron-down" size={14} color="#3F4850" />
        </View>
      </View>

      <View className="flex-row items-end justify-between h-[150px] pb-6 relative">
        {chartData.map((item, index) => (
          <View key={index} className="items-center w-10">
            <View
              className={`w-8 rounded-t-[6px] ${item.active ? "bg-[#006397]" : "bg-[#F2F3F7]"}`}
              style={{ height: `${item.height}%` }}
            />
            <Text className={`absolute -bottom-6 text-[11px] font-bold ${item.active ? "text-[#006397]" : "text-[#6b7682]"}`}>
              {item.day.split(' ')[0]}{'\n'}{item.day.split(' ')[1] || ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
