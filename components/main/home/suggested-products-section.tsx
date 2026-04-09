import { Pressable, Text, View } from "react-native";
import { SuggestedProductCard } from "@/components/product/suggested-product-card";
import { ProductCard } from "@/types/main";

type SuggestedProductsSectionProps = {
  products: ProductCard[];
};

export function SuggestedProductsSection({ products }: SuggestedProductsSectionProps) {
  return (
    <>
      <Text className="mb-3 text-[44px] font-extrabold leading-[46px] text-[#1d2630]">Gợi ý cho</Text>
      <Text className="mb-3 text-[44px] font-extrabold leading-[46px] text-[#1d2630]">bạn</Text>

      <View className="gap-3">
        <View className="flex-row justify-between">
          {products.slice(0, 2).map((product) => (
            <SuggestedProductCard key={product.id} product={product} />
          ))}
        </View>
        <View className="flex-row justify-between">
          {products.slice(2).map((product) => (
            <SuggestedProductCard key={product.id} product={product} />
          ))}
        </View>
      </View>

      <Pressable className="mt-4 h-[44px] items-center justify-center rounded-[12px] bg-[#ebeff5]">
        <Text className="text-[14px] font-bold text-[#3077d8]">Xem thêm sản phẩm gợi ý</Text>
      </Pressable>
    </>
  );
}
