import { Feather } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

export function ProductBasicForm() {
  return (
    <View className="mb-6 rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
      <Text className="mb-5 text-[16px] font-bold text-[#191C1F]">2. Thông tin cơ bản</Text>

      <View className="gap-4">
        {/* Tên sản phẩm */}
        <View>
          <Text className="text-[13px] font-bold text-[#3F4850] mb-2">Tên sản phẩm *</Text>
          <TextInput
            className="h-12 rounded-[12px] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F] border border-[#E7E8EC]"
            placeholder="Nhập tên sản phẩm..."
            placeholderTextColor="#97A0AB"
          />
        </View>

        {/* Danh mục */}
        <View>
          <Text className="text-[13px] font-bold text-[#3F4850] mb-2">Danh mục</Text>
          <View className="h-12 rounded-[12px] bg-[#F4F5F7] px-4 flex-row items-center justify-between border border-[#E7E8EC]">
            <Text className="text-[14px] text-[#191C1F]">Chọn danh mục</Text>
            <Feather name="chevron-down" size={20} color="#6B7682" />
          </View>
        </View>
      </View>
    </View>
  );
}
