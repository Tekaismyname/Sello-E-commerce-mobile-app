import { Text, View } from "react-native";

type ProductDescriptionProps = {
  description: string;
};

export function ProductDescription({ description }: ProductDescriptionProps) {
  const fallbackDescription =
    "Air Jordan 1 High OG mang đến thiết kế kinh điển với chất liệu cao cấp và cảm giác mang êm ái. Phiên bản này phù hợp cho cả di chuyển hằng ngày lẫn phong cách streetwear.";

  return (
    <View className="bg-white px-4 py-5">
      <Text className="mb-3 text-[20px] font-extrabold text-[#191C1F]">Mô Tả Chi Tiết</Text>
      <Text className="text-[14px] leading-[24px] text-[#3F4850]">
        {description?.trim() ? description : fallbackDescription}
      </Text>

      <View className="mt-6 rounded-[12px] bg-[#F2F3F7] p-5">
        <Text className="text-[14px] italic leading-[24px] text-[#191C1F]">
          Đôi giày này đã thay đổi hoàn toàn phong cách của tôi. Độ hoàn thiện cao và cảm giác mang rất êm ái.
        </Text>
        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#CCE5FF]">
            <Text className="text-[14px] font-bold text-[#006397]">TN</Text>
          </View>
          <View>
            <Text className="text-[14px] font-bold text-[#191C1F]">Thanh Nam</Text>
            <Text className="text-[12px] text-[#6b7682]">Sneaker Enthusiast</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
