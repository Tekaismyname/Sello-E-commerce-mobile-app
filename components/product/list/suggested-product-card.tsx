import { Href, router } from "expo-router";
import { Pressable, Text } from "react-native";
import { Image } from "expo-image";
import { UICard } from "@/components/ui";
import { ProductCard } from "@/types/main";

type SuggestedProductCardProps = {
  product: ProductCard;
};

export function SuggestedProductCard({ product }: SuggestedProductCardProps) {
  return (
    <Pressable
      className="w-[48.5%]"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
      onPress={() => router.push(`/product/detail?id=${product.id}` as Href)}
    >
      <UICard className="w-full pb-3 overflow-hidden">
        <Image source={{ uri: product.imageUrl }} className="h-[120px] w-full" contentFit="cover" />
        <Text className="px-2.5 pt-2 text-[12px] font-semibold leading-[16px] text-[#253240]">{product.title}</Text>
        <Text className="px-2.5 pt-1 text-[10px] text-[#8a94a0]">{product.subtitle}</Text>
        <Text className="px-2.5 pt-2 text-[20px] font-extrabold leading-[21px] text-[#1675d4]">{product.price}</Text>
        {product.oldPrice ? (
          <Text className="px-2.5 pt-1 text-[10px] text-[#95a0ac] line-through">{product.oldPrice}</Text>
        ) : null}
      </UICard>
    </Pressable>
  );
}
