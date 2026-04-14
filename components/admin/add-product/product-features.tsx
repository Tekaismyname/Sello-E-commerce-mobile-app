import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export function ProductFeatures() {
  return (
    <View className="mb-6 rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-[16px] font-bold text-[#191C1F]">Đặc điểm nổi bật</Text>
        <Pressable className="flex-row items-center gap-1">
          <Feather name="plus" size={14} color="#006397" />
          <Text className="text-[13px] font-bold text-[#006397]">Thêm đặc điểm</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {/* Feature 1 (Light) */}
        <View className="rounded-[12px] bg-[#F4F5F7] p-4 relative flex-row gap-3">
          <View className="h-10 w-10 bg-white rounded-full items-center justify-center shadow-sm">
            <Feather name="wind" size={18} color="#006397" />
          </View>
          <View className="flex-1 pr-6">
            <Text className="text-[14px] font-bold text-[#191C1F] mb-1">Công nghệ đệm AeroCloud™</Text>
            <Text className="text-[12px] text-[#3F4850] leading-[18px]">
              Hệ thống giảm xóc tối ưu giúp giảm chấn cho đôi chân...
            </Text>
          </View>
          <Pressable className="absolute top-2 right-2 h-6 w-6 items-center justify-center rounded-full bg-[#FFEAEB]">
            <Feather name="x" size={12} color="#DC2626" />
          </Pressable>
        </View>

        {/* Feature 2 (Dark/Primary color) */}
        <View className="rounded-[12px] bg-[#006397] p-4 relative flex-row gap-3">
          <View className="h-10 w-10 bg-white/20 rounded-full items-center justify-center">
            <Feather name="shield" size={18} color="white" />
          </View>
          <View className="flex-1 pr-6">
            <Text className="text-[14px] font-bold text-white mb-1">Vật Liệu Đệm Tổng Hợp</Text>
            <Text className="text-[12px] text-white/80 leading-[18px]">
              Hỗ trợ 3D giúp ổn định gót chân, chống lật cổ chân khi...
            </Text>
          </View>
          <Pressable className="absolute top-2 right-2 h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <Feather name="x" size={12} color="white" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
