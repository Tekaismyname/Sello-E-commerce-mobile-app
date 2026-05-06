import { ActivityIndicator, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

export function CartLoadingState() {
  return (
    <View className="mt-10 items-center">
      <ActivityIndicator size="large" color="#006397" />
      <Text className="mt-3 text-[13px] text-[#7d8896]">Đang tải giỏ hàng...</Text>
    </View>
  );
}

type CartErrorStateProps = {
  message: string;
};

export function CartErrorState({ message }: CartErrorStateProps) {
  return (
    <View className="mt-6 rounded-[14px] bg-white p-4">
      <Text className="text-[14px] font-semibold text-[#465362]">{message}</Text>
    </View>
  );
}

export function CartEmptyState() {
  return (
    <View className="mt-6 items-center rounded-[14px] bg-white p-6">
      <Feather name="shopping-cart" size={48} color="#c5cdd6" />
      <Text className="mt-3 text-[15px] font-semibold text-[#465362]">Giỏ hàng trống</Text>
      <Text className="mt-1 text-[12px] text-[#7d8896]">Hãy thêm sản phẩm vào giỏ hàng!</Text>
    </View>
  );
}
