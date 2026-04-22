import { Feather } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

type ProductFeaturesProps = {
  features: string[];
  onChange: (features: string[]) => void;
};

export function ProductFeatures({ features, onChange }: ProductFeaturesProps) {
  const updateFeature = (index: number, value: string) => {
    onChange(features.map((feature, featureIndex) => (featureIndex === index ? value : feature)));
  };

  const addFeature = () => {
    onChange([...features, ""]);
  };

  const removeFeature = (index: number) => {
    onChange(features.filter((_, featureIndex) => featureIndex !== index));
  };

  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-[16px] font-bold text-[#191C1F]">Đặc điểm nổi bật</Text>
        <Pressable onPress={addFeature} className="flex-row items-center gap-1">
          <Feather name="plus" size={14} color="#006397" />
          <Text className="text-[13px] font-bold text-[#006397]">Thêm đặc điểm</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {features.map((feature, index) => (
          <View key={`feature-${index}`} className="flex-row items-center gap-3 rounded-[12px] bg-[#F4F5F7] p-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
              <Feather name="star" size={16} color="#006397" />
            </View>
            <TextInput
              className="flex-1 text-[14px] text-[#191C1F]"
              placeholder="Nhập đặc điểm nổi bật..."
              placeholderTextColor="#97A0AB"
              value={feature}
              onChangeText={(value) => updateFeature(index, value)}
            />
            <Pressable onPress={() => removeFeature(index)} className="h-8 w-8 items-center justify-center rounded-full bg-[#FFEAEB]">
              <Feather name="x" size={12} color="#DC2626" />
            </Pressable>
          </View>
        ))}

        {features.length === 0 && (
          <View className="rounded-[12px] bg-[#F8F9FA] p-4">
            <Text className="text-[13px] text-[#6B7682]">Chưa có đặc điểm nào. Bấm Thêm đặc điểm để bổ sung.</Text>
          </View>
        )}
      </View>

      <Text className="mt-4 text-[12px] leading-[18px] text-[#97A0AB]">
        Các đặc điểm này sẽ được lưu vào mô tả ngắn để phục vụ hiển thị nhanh.
      </Text>
    </View>
  );
}
