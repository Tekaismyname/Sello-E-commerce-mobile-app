import { Feather } from "@expo/vector-icons";
import { Image, ScrollView, Text, View } from "react-native";
import { ProductCard } from "@/types/main";

type FlashSalesSectionProps = {
  countdownValues: string[];
  products: ProductCard[];
};

export function FlashSalesSection({ countdownValues, products }: FlashSalesSectionProps) {
  return (
    <View className="mb-5 rounded-[16px] bg-[#f4eefe] px-3 py-3">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather name="zap" size={16} color="#7d2de2" />
          <Text className="text-[29px] font-extrabold leading-[30px] text-[#43146f]">FLASH</Text>
          <Text className="text-[29px] font-extrabold leading-[30px] text-[#43146f]">SALE</Text>
        </View>
        <View className="flex-row gap-1">
          {countdownValues.map((value, index) => (
            <View key={`${value}-${index}`} className="min-w-[24px] rounded-full bg-[#8f46e9] px-2 py-[3px]">
              <Text className="text-center text-[11px] font-extrabold text-white">{value}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
        {products.map((product, index) => (
          <View key={`${product.id}-${index}`} className="w-[120px] overflow-hidden rounded-[12px] bg-white pb-3">
            <View className="relative h-[84px]">
              <Image source={{ uri: product.imageUrl }} className="h-full w-full" resizeMode="cover" />
              {product.badge ? (
                <View className="absolute left-1.5 top-1 rounded-full bg-[#f34545] px-1.5 py-[2px]">
                  <Text className="text-[9px] font-bold text-white">{product.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text className="px-2 pt-2 text-[13px] font-bold leading-[16px] text-[#1770ca]">{product.price}</Text>
            <Text className="px-2 pt-1 text-[10px] text-[#6e7885]">{product.subtitle}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
