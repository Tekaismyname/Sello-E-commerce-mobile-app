import { ActivityIndicator, Text, View } from "react-native";

type MainLoadingStateProps = {
  message?: string;
};

export function MainLoadingState({ message = "Đang tải dữ liệu..." }: MainLoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <ActivityIndicator size="small" color="#2f7ed6" />
      <Text className="text-[13px] font-semibold text-[#6f7a88]">{message}</Text>
    </View>
  );
}

type MainErrorStateProps = {
  message: string;
};

export function MainErrorState({ message }: MainErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-center text-[13px] font-semibold text-[#d35a5a]">{message}</Text>
    </View>
  );
}
