import { Feather } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

export function ProductSpecs() {
  return (
    <View className="mb-6 rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
      <View className="flex-row items-center gap-2 mb-5">
        <Feather name="check-square" size={18} color="#006397" />
        <Text className="text-[16px] font-bold text-[#191C1F]">Thông số kỹ thuật</Text>
      </View>

      <View className="gap-4">
        <View className="flex-row gap-4">
          {/* Thương hiệu */}
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-[#6B7682] mb-2 uppercase">THƯƠNG HIỆU</Text>
            <TextInput
              className="h-12 rounded-[12px] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F] border border-[#E7E8EC]"
              placeholder="Ví dụ: Nike..."
              placeholderTextColor="#97A0AB"
              value="Giày Nike Jordan"
            />
          </View>
          
          {/* Mã sản phẩm */}
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-[#6B7682] mb-2 uppercase">MÃ SẢN PHẨM</Text>
            <TextInput
              className="h-12 rounded-[12px] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F] border border-[#E7E8EC]"
              placeholder="VD: SP-001"
              placeholderTextColor="#97A0AB"
              value="AJ-RETRO-1CH"
            />
          </View>
        </View>

        {/* Kiểu dáng */}
        <View>
          <Text className="text-[11px] font-bold text-[#6B7682] mb-2 uppercase">KIỂU DÁNG</Text>
          <TextInput
            className="h-12 rounded-[12px] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F] border border-[#E7E8EC]"
            placeholder="Nhập kiểu dáng..."
            placeholderTextColor="#97A0AB"
            value="High Top / Lifestyle"
          />
        </View>

        {/* Chất liệu */}
        <View>
          <Text className="text-[11px] font-bold text-[#6B7682] mb-2 uppercase">CHẤT LIỆU</Text>
          <TextInput
            className="h-12 rounded-[12px] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F] border border-[#E7E8EC]"
            placeholder="Nhập chất liệu..."
            placeholderTextColor="#97A0AB"
            value="Da cao cấp"
          />
        </View>

        {/* Bảo hành */}
        <View>
          <Text className="text-[11px] font-bold text-[#6B7682] mb-2 uppercase">BẢO HÀNH</Text>
          <TextInput
            className="h-12 rounded-[12px] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F] border border-[#E7E8EC]"
            placeholder="Thời gian bảo hành..."
            placeholderTextColor="#97A0AB"
            value="12 tháng chính hãng"
          />
        </View>
      </View>
    </View>
  );
}
