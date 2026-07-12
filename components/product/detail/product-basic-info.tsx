import { Text, View } from "react-native";
import { ProductFavoriteButton, ProductPrice, ProductRating } from "../shared";

type ProductBasicInfoProps = {
  category: string;
  title: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  rating: number;
  reviewsCount: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export function ProductBasicInfo({
  category,
  title,
  price,
  oldPrice,
  discount,
  rating,
  reviewsCount,
  isFavorite = false,
  onToggleFavorite,
}: ProductBasicInfoProps) {
  return (
    <View className="bg-white px-4 pt-4 pb-2">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="mb-0.5 text-[12px] font-extrabold uppercase tracking-widest text-[#9b51e0]">
            {category}
          </Text>
          <Text className="text-[24px] font-extrabold leading-[32px] text-[#191C1F]">
            {title}
          </Text>
        </View>
        <View className="mt-1">
          <ProductFavoriteButton
            isFavorite={isFavorite}
            onPress={onToggleFavorite}
            className="bg-transparent h-8 w-8"
            color="#BA1A1A"
          />
        </View>
      </View>

      <View className="mt-4 flex-row items-end justify-between">
        <ProductPrice price={price} oldPrice={oldPrice} discount={discount} />
        <View className="mb-1">
          <ProductRating rating={rating} reviewsCount={reviewsCount} />
        </View>
      </View>
    </View>
  );
}
