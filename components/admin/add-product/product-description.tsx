import { Feather } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

type ProductDescriptionProps = {
  description: string;
  onDescriptionChange: (value: string) => void;
};

export function ProductDescription({ description, onDescriptionChange }: ProductDescriptionProps) {
  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <Text className="mb-5 text-[16px] font-bold text-[#191C1F]">Mô tả chi tiết</Text>

      <View className="overflow-hidden rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7]">
        <View className="flex-row items-center justify-between border-b border-[#E7E8EC] bg-white p-2">
          <View className="flex-row items-center gap-1">
            <View className="h-8 w-8 items-center justify-center rounded-[6px]">
              <Feather name="bold" size={16} color="#3F4850" />
            </View>
            <View className="h-8 w-8 items-center justify-center rounded-[6px]">
              <Feather name="italic" size={16} color="#3F4850" />
            </View>
            <View className="h-8 w-8 items-center justify-center rounded-[6px]">
              <Feather name="underline" size={16} color="#3F4850" />
            </View>
            <View className="h-8 w-8 items-center justify-center rounded-[6px]">
              <Feather name="list" size={16} color="#3F4850" />
            </View>
          </View>

          <View className="h-8 w-8 items-center justify-center rounded-[6px]">
            <Feather name="image" size={16} color="#006397" />
          </View>
        </View>

        <TextInput
          className="h-40 p-4 text-[14px] text-[#191C1F]"
          placeholder="Mô tả chi tiết sản phẩm để tăng tỷ lệ chuyển đổi..."
          placeholderTextColor="#97A0AB"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={onDescriptionChange}
        />
      </View>
    </View>
  );
}
