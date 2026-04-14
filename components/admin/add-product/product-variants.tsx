import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

export function ProductVariants() {
  return (
    <View className="mb-6 rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-[16px] font-bold text-[#191C1F]">Phân loại sản phẩm</Text>
        <Pressable className="flex-row items-center gap-1">
          <Feather name="plus" size={14} color="#006397" />
          <Text className="text-[13px] font-bold text-[#006397]">Thêm nhóm</Text>
        </Pressable>
      </View>

      <View className="gap-4">
        {/* Colors Group */}
        <View className="rounded-[12px] border border-[#E7E8EC] bg-[#F8F9FA] p-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[12px] font-bold text-[#6B7682] uppercase">Màu sắc</Text>
            <Feather name="trash-2" size={14} color="#97A0AB" />
          </View>
          
          <View className="flex-row flex-wrap gap-2">
            <View className="h-10 w-10 rounded-[8px] border-2 border-[#006397] overflow-hidden p-0.5 relative">
              <Image 
                source={{ uri: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=50&q=80" }} 
                className="w-full h-full rounded-[4px]"
              />
              <View className="absolute top-0 right-0 bg-[#006397] rounded-bl-[4px]">
                <Feather name="check" size={10} color="white" />
              </View>
            </View>
            
            <Pressable className="h-10 w-10 items-center justify-center rounded-[8px] bg-white border border-[#E7E8EC]">
              <Feather name="plus" size={16} color="#6B7682" />
            </Pressable>
          </View>
        </View>

        {/* Sizes Group */}
        <View className="rounded-[12px] border border-[#E7E8EC] bg-[#F8F9FA] p-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[12px] font-bold text-[#6B7682] uppercase">Kích thước</Text>
            <Feather name="trash-2" size={14} color="#97A0AB" />
          </View>
          
          <View className="flex-row flex-wrap gap-2">
            <View className="h-10 px-4 items-center justify-center rounded-[8px] bg-white border border-[#E7E8EC]">
              <Text className="text-[14px] font-bold text-[#3F4850]">41</Text>
            </View>
            
            <View className="h-10 px-4 items-center justify-center rounded-[8px] bg-[#006397] border border-[#006397]">
              <Text className="text-[14px] font-bold text-white">42</Text>
            </View>

            <View className="h-10 px-4 items-center justify-center rounded-[8px] bg-white border border-[#E7E8EC]">
              <Text className="text-[14px] font-bold text-[#3F4850]">43</Text>
            </View>
            
            <Pressable className="h-10 w-10 items-center justify-center rounded-[8px] bg-white border border-[#E7E8EC]">
              <Feather name="plus" size={16} color="#6B7682" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
