import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

export function ProductImagePicker() {
  return (
    <View className="mb-6 rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
      <Text className="mb-5 text-[16px] font-bold text-[#191C1F]">1. Hình ảnh sản phẩm</Text>
      
      <View className="flex-row flex-wrap gap-3">
        {/* Main image */}
        <Pressable className="h-24 w-[46%] items-center justify-center rounded-[12px] bg-[#F4F5F7] border border-dashed border-[#CCD1D9]">
          <Feather name="image" size={24} color="#97A0AB" />
          <Text className="mt-2 text-[12px] font-medium text-[#6B7682]">Ảnh chính</Text>
        </Pressable>

        {/* Sub image 1 */}
        <Pressable className="h-24 w-[46%] items-center justify-center rounded-[12px] bg-[#F4F5F7] border border-dashed border-[#CCD1D9]">
          <Feather name="image" size={24} color="#97A0AB" />
          <Text className="mt-2 text-[12px] font-medium text-[#6B7682]">Ảnh phụ</Text>
        </Pressable>

        {/* Selected image mock */}
        <View className="h-24 w-[46%] rounded-[12px] overflow-hidden relative">
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80" }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <Pressable className="absolute top-2 right-2 h-6 w-6 rounded-full bg-[#DC2626] items-center justify-center">
            <Feather name="x" size={12} color="white" />
          </Pressable>
        </View>

        {/* Sub image 2 */}
        <Pressable className="h-24 w-[46%] items-center justify-center rounded-[12px] bg-[#F4F5F7] border border-dashed border-[#CCD1D9]">
          <Feather name="image" size={24} color="#97A0AB" />
          <Text className="mt-2 text-[12px] font-medium text-[#6B7682]">Ảnh phụ</Text>
        </Pressable>
      </View>

      <Text className="mt-4 text-[12px] text-[#97A0AB] leading-[18px]">
        * Tối đa 5 hình. Dung lượng 2MB. Định dạng: JPG, PNG.
      </Text>
    </View>
  );
}
