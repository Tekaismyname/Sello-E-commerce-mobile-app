import { Text, TextInput, View } from "react-native";

type ReviewTextBoxProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function ReviewTextBox({ value, onChangeText }: ReviewTextBoxProps) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-[14px] font-bold text-[#191C1F]">Chia sẻ cảm nhận của bạn</Text>
      <TextInput
        className="h-[120px] rounded-[12px] bg-[#F4F5F7] p-4 text-[14px] text-[#191C1F]"
        placeholder="Hãy chia sẻ thêm về chất lượng sản phẩm, kích cỡ và cảm giác khi sử dụng nhé..."
        placeholderTextColor="#97a0ab"
        multiline
        textAlignVertical="top"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
