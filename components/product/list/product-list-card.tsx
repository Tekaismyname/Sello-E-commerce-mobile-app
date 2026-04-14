import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { UICard } from "@/components/ui";
import { ProductCard } from "@/types/main";

type ProductListCardProps = {
  product: ProductCard;
};

export function ProductListCard({ product }: ProductListCardProps) {
  const canOpenDetail = !product.isPlaceholder;

  return (
    <Pressable
      className="w-[48.5%]"
      onPress={() => {
        if (!canOpenDetail) return;
        router.push(`/product/detail?id=${product.id}` as Href);
      }}
    >
      <UICard className="w-full pb-3 overflow-hidden">
        <View className="relative h-[170px]">
          <Image source={{ uri: product.imageUrl }} className="h-full w-full" resizeMode="cover" />
          <Pressable className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-white/80">
            <Feather name="heart" size={13} color="#495463" />
          </Pressable>
          {product.badge ? (
            <View className="absolute bottom-2 left-2 rounded-full bg-[#a14df6] px-2 py-[2px]">
              <Text className="text-[9px] font-bold text-white">{product.badge}</Text>
            </View>
          ) : null}
        </View>

        <Text className="px-2.5 pt-2 text-[12px] font-bold leading-[15px] text-[#2b3642]">{product.title}</Text>
        <Text className="px-2.5 pt-1 text-[10px] text-[#97a0ab]">{product.subtitle}</Text>
        <Text className="px-2.5 pt-1 text-[26px] font-extrabold leading-[28px] text-[#1872cc]">{product.price}</Text>
        {product.oldPrice ? (
          <Text className="px-2.5 text-[10px] text-[#97a0ab] line-through">{product.oldPrice}</Text>
        ) : null}
      </UICard>
    </Pressable>
  );
}
