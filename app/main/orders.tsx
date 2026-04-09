import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelloHeader } from "@/components/main/sello-header";

export default function OrdersScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#f6f8fc]" edges={["top"]}>
      <SelloHeader />
      <ScrollView className="flex-1" contentContainerClassName="px-4 py-4">
        <Text className="text-[30px] font-extrabold text-[#1f2934]">Đơn hàng</Text>
        <Text className="mt-1 text-[13px] font-medium text-[#7d8896]">
          Chưa tích hợp endpoint đơn hàng từ backend.
        </Text>

        <View className="mt-6 rounded-[14px] bg-white p-4">
          <Text className="text-[14px] font-semibold text-[#465362]">
            Khi backend có API đơn hàng, danh sách đơn sẽ hiển thị tại đây.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
