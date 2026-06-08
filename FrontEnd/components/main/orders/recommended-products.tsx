import { ProductCard } from "@/types/main";
import { Image, Text, View } from "react-native";

type RecommendedProductsProps = {
  products: ProductCard[];
};

export function RecommendedProducts({ products }: RecommendedProductsProps) {
  if (!products.length) return null;

  return (
    <View className="mt-5">
      <Text className="text-[22px] font-extrabold text-[#1F2934]">Có thể bạn quan tâm</Text>
      <View className="mt-3 flex-row gap-3">
        {products.slice(0, 2).map((item) => (
          <View key={item.id} className="flex-1 rounded-[16px] bg-white p-3">
            <Image source={{ uri: item.imageUrl }} className="h-[132px] w-full rounded-[10px]" />
            <Text className="mt-3 text-[12px] font-extrabold text-[#4B5563]">
              {(item.categoryName ?? "SẢN PHẨM").toUpperCase()}
            </Text>
            <Text className="mt-1 text-[17px] font-bold leading-[22px] text-[#1F2934]" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="mt-2 text-[15px] font-extrabold text-[#0369A1]">{item.price}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
