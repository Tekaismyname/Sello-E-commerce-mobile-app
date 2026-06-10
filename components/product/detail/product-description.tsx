import { Text, View } from "react-native";

type ProductDescriptionProps = {
  description: string;
};

export function ProductDescription({ description }: ProductDescriptionProps) {
  const fallbackDescription =
    "The Air Jordan 1 High OG delivers an iconic design with premium materials and all-day comfort. This version works perfectly for both daily movement and streetwear styling.";

  return (
    <View className="bg-white px-4 py-5">
      <Text className="mb-3 text-[20px] font-extrabold text-[#191C1F]">Detailed description</Text>
      <Text className="text-[14px] leading-[24px] text-[#3F4850]">
        {description?.trim() ? description : fallbackDescription}
      </Text>

      <View className="mt-6 rounded-[12px] bg-[#F2F3F7] p-5">
        <Text className="text-[14px] italic leading-[24px] text-[#191C1F]">
          This pair completely changed my style. The craftsmanship is excellent and the cushioning feels incredibly comfortable.
        </Text>
        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#CCE5FF]">
            <Text className="text-[14px] font-bold text-[#006397]">TN</Text>
          </View>
          <View>
            <Text className="text-[14px] font-bold text-[#191C1F]">Thanh Nam</Text>
            <Text className="text-[12px] text-[#6b7682]">Sneaker enthusiast</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
