import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

export function ProductDescription() {
  return (
    <View className="mb-6 rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
      <Text className="mb-5 text-[16px] font-bold text-[#191C1F]">Mô tả chi tiết</Text>

      <View className="rounded-[12px] bg-[#F4F5F7] border border-[#E7E8EC] overflow-hidden">
        {/* Editor Toolbar */}
        <View className="flex-row items-center justify-between border-b border-[#E7E8EC] p-2 bg-white">
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

        {/* Text Area */}
        <TextInput
          className="p-4 h-40 text-[14px] text-[#191C1F]"
          placeholder="Khuyến khích cung cấp chi tiết: thương hiệu, chất liệu, thiết kế, công năng... giúp tăng tỷ lệ chốt đơn."
          placeholderTextColor="#97A0AB"
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );
}
