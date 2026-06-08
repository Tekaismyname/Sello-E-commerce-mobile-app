import { Pressable, Text, View } from "react-native";
import { SuggestedProductCard } from "@/components/product";
import { ProductCard } from "@/types/main";

type SuggestedProductsSectionProps = {
  products: ProductCard[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onViewMore?: () => void;
};

export function SuggestedProductsSection({
  products,
  hasMore = false,
  loadingMore = false,
  onViewMore,
}: SuggestedProductsSectionProps) {
  if (!products.length) {
    return null;
  }

  return (
    <>
      <Text className="mb-3 text-[32px] font-extrabold leading-[36px] text-[#1d2630]">Gợi ý cho bạn</Text>

      <View className="flex-row flex-wrap justify-between gap-y-3">
        {products.map((product, index) => (
          <SuggestedProductCard key={`${product.id}-${index}`} product={product} />
        ))}
      </View>

      {hasMore ? (
        <Pressable
          className="mt-4 h-[44px] items-center justify-center rounded-[12px] bg-[#ebeff5]"
          onPress={onViewMore}
          disabled={loadingMore}
        >
          <Text className="text-[14px] font-bold text-[#3077d8]">
            {loadingMore ? "Đang tải thêm..." : "Xem thêm sản phẩm gợi ý"}
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}
