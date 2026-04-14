import { Feather } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

export function ProductSpecs() {
  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <View className="mb-5 flex-row items-center gap-2">
        <Feather name="check-square" size={18} color="#006397" />
        <Text className="text-[16px] font-bold text-[#191C1F]">Thông số kỹ thuật</Text>
      </View>

      <View className="gap-4">
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">THƯƠNG HIỆU</Text>
            <TextInput
              className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
              placeholder="Ví dụ: Nike..."
              placeholderTextColor="#97A0AB"
              value="Giày Nike Jordan"
            />
          </View>

          <View className="flex-1">
            <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">MÃ SẢN PHẨM</Text>
            <TextInput
              className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
              placeholder="VD: SP-001"
              placeholderTextColor="#97A0AB"
              value="AJ-RETRO-1CH"
            />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">KIỂU DÁNG</Text>
          <TextInput
            className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
            placeholder="Nhập kiểu dáng..."
            placeholderTextColor="#97A0AB"
            value="High Top / Lifestyle"
          />
        </View>

        <View>
          <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">CHẤT LIỆU</Text>
          <TextInput
            className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
            placeholder="Nhập chất liệu..."
            placeholderTextColor="#97A0AB"
            value="Da cao cấp"
          />
        </View>

        <View>
          <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">BẢO HÀNH</Text>
          <TextInput
            className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
            placeholder="Thời gian bảo hành..."
            placeholderTextColor="#97A0AB"
            value="12 tháng chính hãng"
          />
        </View>
      </View>
    </View>
  );
}
