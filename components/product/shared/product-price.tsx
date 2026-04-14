import { Text, View } from "react-native";

type ProductPriceProps = {
  price: string;
  oldPrice?: string;
  discount?: string;
  size?: "small" | "large";
};

export function ProductPrice({ price, oldPrice, discount, size = "large" }: ProductPriceProps) {
  if (size === "small") {
    return (
      <View className="flex-row items-end gap-1.5">
        <Text className="text-[20px] font-extrabold leading-[21px] text-[#1675d4]">{price}</Text>
        {oldPrice ? (
          <Text className="mb-[2px] text-[10px] text-[#95a0ac] line-through">{oldPrice}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="mt-2">
      <Text className="text-[32px] font-extrabold text-[#006397]">{price}</Text>
      <View className="mt-1 flex-row items-center gap-2">
        {oldPrice ? (
          <Text className="text-[16px] text-[#6b7682] line-through">{oldPrice}</Text>
        ) : null}
        {discount ? (
          <View className="rounded-full bg-[#FFDAD6] px-2 py-0.5">
            <Text className="text-[11px] font-bold text-[#BA1A1A]">{discount}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
