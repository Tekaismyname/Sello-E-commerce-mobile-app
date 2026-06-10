import { Feather } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

export function ProductFeatures() {
  return (
    <View className="bg-white px-4 py-8">
      <View className="mb-6 items-center">
        <Text className="text-[20px] font-extrabold text-[#191C1F]">Key highlights</Text>
        <View className="mt-2 h-1 w-12 rounded-full bg-[#006397]" />
      </View>

      <View className="mb-4 overflow-hidden rounded-[12px] bg-[#F2F3F7]">
        <View className="h-[160px] w-full bg-[#006397]">
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80" }}
            className="h-full w-full opacity-60"
            resizeMode="cover"
          />
        </View>
        <View className="p-4">
          <Text className="mb-2 text-[18px] font-extrabold text-[#191C1F]">AeroCloud cushioning technology</Text>
          <Text className="text-[13px] leading-[20px] text-[#3F4850]">
            The multilayer air cushioning system helps absorb impact and protect your joints during long journeys. Every step feels rewarding.
          </Text>
          <View className="mt-4 gap-2">
            <View className="flex-row items-center gap-2">
              <Feather name="check-circle" size={14} color="#006D37" />
              <Text className="text-[12px] font-bold text-[#006D37]">40% less impact force</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Feather name="check-circle" size={14} color="#006D37" />
              <Text className="text-[12px] font-bold text-[#006D37]">95% energy return</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mb-4 flex-row items-center rounded-[12px] bg-[#006397] p-4">
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Feather name="shield" size={20} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-white">Sustainable materials</Text>
          <Text className="mt-1 text-[12px] text-white/80">Made with 65% recycled materials for a more eco-friendly footprint.</Text>
        </View>
      </View>

      <View className="mb-4 flex-row items-center rounded-[12px] bg-[#F2F3F7] p-4">
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white">
          <Feather name="wind" size={20} color="#006397" />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-[#191C1F]">Ultra breathable</Text>
          <Text className="mt-1 text-[12px] text-[#3F4850]">Engineered mesh optimizes airflow around your feet.</Text>
        </View>
      </View>

      <View className="flex-row items-center rounded-[12px] bg-[#F2F3F7] p-4">
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white">
          <Feather name="feather" size={20} color="#873DA6" />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-[#191C1F]">Lightweight feel</Text>
          <Text className="mt-1 text-[12px] text-[#3F4850]">Experience featherlight comfort with every step.</Text>
        </View>
      </View>
    </View>
  );
}
