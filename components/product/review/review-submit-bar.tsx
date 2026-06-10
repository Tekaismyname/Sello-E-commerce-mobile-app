import { Pressable, Text, View } from "react-native";

type ReviewSubmitBarProps = {
  onSubmit: () => void;
  disabled?: boolean;
};

export function ReviewSubmitBar({ onSubmit, disabled }: ReviewSubmitBarProps) {
  return (
    <View className="bg-white p-4 shadow-sm">
      <Pressable
        onPress={onSubmit}
        disabled={disabled}
        className={`mb-2 mt-1 h-14 items-center justify-center rounded-[12px] shadow-sm ${
          disabled ? "bg-[#3498DB]/50" : "bg-[#3498DB]"
        }`}
      >
        <Text className="text-[16px] font-bold text-white">Submit review</Text>
      </Pressable>
    </View>
  );
}
