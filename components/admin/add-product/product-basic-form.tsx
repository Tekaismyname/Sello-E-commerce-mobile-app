import { Feather } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

type ProductBasicFormProps = {
  name: string;
  categoryId: string;
  onNameChange: (value: string) => void;
  onCategoryIdChange: (value: string) => void;
};

export function ProductBasicForm({
  name,
  categoryId,
  onNameChange,
  onCategoryIdChange,
}: ProductBasicFormProps) {
  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <Text className="mb-5 text-[16px] font-bold text-[#191C1F]">2. Thông tin cơ bản</Text>

      <View className="gap-4">
        <View>
          <Text className="mb-2 text-[13px] font-bold text-[#3F4850]">Tên sản phẩm *</Text>
          <TextInput
            className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
            placeholder="Nhập tên sản phẩm..."
            placeholderTextColor="#97A0AB"
            value={name}
            onChangeText={onNameChange}
          />
        </View>

        <View>
          <Text className="mb-2 text-[13px] font-bold text-[#3F4850]">Mã danh mục (Category ID) *</Text>
          <View className="h-12 flex-row items-center justify-between gap-2 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4">
            <TextInput
              className="flex-1 text-[14px] text-[#191C1F]"
              placeholder="Ví dụ: 1"
              placeholderTextColor="#97A0AB"
              keyboardType="numeric"
              value={categoryId}
              onChangeText={onCategoryIdChange}
            />
            <Feather name="chevron-down" size={20} color="#6B7682" />
          </View>
        </View>
      </View>
    </View>
  );
}
