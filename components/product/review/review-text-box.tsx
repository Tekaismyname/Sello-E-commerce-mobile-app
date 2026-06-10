import { Text, TextInput, View } from "react-native";

type ReviewTextBoxProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function ReviewTextBox({ value, onChangeText }: ReviewTextBoxProps) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-[14px] font-bold text-[#191C1F]">Share your thoughts</Text>
      <TextInput
        className="h-[120px] rounded-[12px] bg-[#F4F5F7] p-4 text-[14px] text-[#191C1F]"
        placeholder="Tell us more about the product quality, sizing, and how it feels to use..."
        placeholderTextColor="#97a0ab"
        multiline
        textAlignVertical="top"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
