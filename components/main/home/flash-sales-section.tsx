import { useEffect, useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Image, ScrollView, Text, View } from "react-native";
import { ProductCard } from "@/types/main";

type FlashSalesSectionProps = {
  countdownValues: string[];
  flashSaleEndsAt?: string;
  products: ProductCard[];
};

const pad2 = (value: number) => String(Math.max(0, value)).padStart(2, "0");

const getCountdown = (flashSaleEndsAt?: string) => {
  if (!flashSaleEndsAt) return null;

  const end = new Date(flashSaleEndsAt).getTime();
  if (!Number.isFinite(end)) return null;

  const diffMs = Math.max(0, end - Date.now());
  const totalSeconds = Math.floor(diffMs / 1000);

  return [pad2(Math.floor(totalSeconds / 3600)), pad2(Math.floor((totalSeconds % 3600) / 60)), pad2(totalSeconds % 60)];
};

export function FlashSalesSection({ countdownValues, flashSaleEndsAt, products }: FlashSalesSectionProps) {
  const [liveCountdown, setLiveCountdown] = useState<string[] | null>(() => getCountdown(flashSaleEndsAt));

  useEffect(() => {
    setLiveCountdown(getCountdown(flashSaleEndsAt));

    if (!flashSaleEndsAt) return undefined;

    const timer = setInterval(() => {
      setLiveCountdown(getCountdown(flashSaleEndsAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSaleEndsAt]);

  const displayedCountdown = useMemo(
    () => (liveCountdown && liveCountdown.length === 3 ? liveCountdown : countdownValues),
    [countdownValues, liveCountdown],
  );

  return (
    <View className="mb-5 rounded-[16px] bg-[#f4eefe] px-3 py-3">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Feather name="zap" size={16} color="#7d2de2" />
          <Text className="text-[29px] font-extrabold leading-[30px] text-[#43146f]">FLASH</Text>
          <Text className="text-[29px] font-extrabold leading-[30px] text-[#43146f]">SALE</Text>
        </View>
        <View className="flex-row gap-1">
          {displayedCountdown.map((value, index) => (
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
