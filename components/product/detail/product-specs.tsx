import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function ProductSpecs() {
  return (
    <View className="bg-white px-4 py-5">
      <View className="rounded-[12px] bg-[#F2F3F7] p-5">
        <View className="mb-4 flex-row items-center gap-2">
          <Feather name="file-text" size={20} color="#006397" />
          <Text className="text-[18px] font-extrabold text-[#191C1F]">Thông Số Kỹ Thuật</Text>
        </View>

        <View className="gap-4">
          <View className="flex-row justify-between border-b border-[#E7E8EC] pb-4">
            <Text className="text-[14px] text-[#3F4850]">Thương hiệu</Text>
            <Text className="text-[14px] font-bold text-[#191C1F]">Nike Jordan</Text>
          </View>
          <View className="flex-row justify-between border-b border-[#E7E8EC] pb-4">
            <Text className="text-[14px] text-[#3F4850]">Mã sản phẩm</Text>
            <Text className="text-[14px] font-bold text-[#191C1F]">AJ1-RETRO-CHI</Text>
          </View>
          <View className="flex-row justify-between border-b border-[#E7E8EC] pb-4">
            <Text className="text-[14px] text-[#3F4850]">Kiểu dáng</Text>
            <Text className="text-[14px] font-bold text-[#191C1F]">High Top / Lifestyle</Text>
          </View>
          <View className="flex-row justify-between border-b border-[#E7E8EC] pb-4">
            <Text className="text-[14px] text-[#3F4850]">Chất liệu</Text>
            <Text className="text-[14px] font-bold text-[#191C1F]">Da cao cấp (Full-grain Leather)</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[14px] text-[#3F4850]">Bảo hành</Text>
            <Text className="text-[14px] font-bold text-[#191C1F]">12 tháng chính hãng</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
