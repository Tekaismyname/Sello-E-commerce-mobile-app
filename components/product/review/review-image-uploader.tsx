import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

export function ReviewImageUploader() {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-[14px] font-bold text-[#191C1F]">Thêm hình ảnh/Video thực tế</Text>
      
      <View className="flex-row gap-3">
        <Pressable className="h-[80px] w-[80px] items-center justify-center rounded-[12px] border-2 border-dashed border-[#CCD1D9] bg-[#F8F9FA]">
          <Feather name="camera" size={24} color="#6b7682" />
          <Text className="mt-1 text-[11px] text-[#6b7682]">Tải lên</Text>
        </Pressable>
        
        <View className="h-[80px] w-[80px] rounded-[12px] overflow-hidden">
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=200&q=80" }} 
            className="h-full w-full" 
            resizeMode="cover" 
          />
          <Pressable className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-black/60">
            <Feather name="x" size={12} color="white" />
          </Pressable>
        </View>
      </View>
      
      <View className="flex-row items-start gap-2 mt-3 pl-1">
        <Feather name="info" size={14} color="#6b7682" className="mt-0.5" />
        <Text className="text-[12px] text-[#6b7682] pr-4 leading-[18px]">
          Hình ảnh chân thực giúp khách hàng khác chọn mua dễ dàng hơn.
        </Text>
      </View>

      <View className="mt-6 flex-row items-center gap-3 rounded-[12px] bg-[#E8F5E9] p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#10B981]">
          <Feather name="check" size={20} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-[14px] font-extrabold text-[#064E3B]">Nhận ngay 200 Xu</Text>
          <Text className="text-[12px] text-[#064E3B] leading-[18px] mt-0.5">Hoàn thành đánh giá kèm hình ảnh để nhận thưởng.</Text>
        </View>
      </View>
    </View>
  );
}
