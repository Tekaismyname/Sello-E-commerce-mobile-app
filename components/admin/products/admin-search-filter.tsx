import { Feather } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

export function AdminSearchFilter({ searchQuery, onSearchQueryChange }: any) {
  return (
    <View className="mb-6 gap-3">
      <View className="flex-row items-center rounded-[12px] bg-[#F4F5F7] px-4 h-12 shadow-sm">
        <Feather name="search" size={20} color="#6b7682" />
        <TextInput
          className="flex-1 ml-3 text-[14px] text-[#191C1F]"
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#97a0ab"
          value={searchQuery}
          onChangeText={onSearchQueryChange}
        />
      </View>
      <Pressable className="h-12 w-full flex-row items-center justify-center gap-2 rounded-[12px] bg-[#E7E8EC] shadow-sm">
        <Feather name="filter" size={18} color="#191C1F" />
        <Text className="text-[14px] font-bold text-[#191C1F]">Bộ lọc</Text>
      </Pressable>
    </View>
  );
}
