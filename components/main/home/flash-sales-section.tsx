import { useEffect, useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
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
    <View className="mb-5 rounded-[16px] bg-[#FFF3F0] px-3 py-3 border border-[#FFE5DF]">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Feather name="zap" size={18} color="#EE4D2D" />
          <Text className="text-[20px] font-black tracking-tighter text-[#EE4D2D] uppercase">FLASH SALE</Text>
        </View>
        <View className="flex-row items-center gap-1">
          {displayedCountdown.map((value, index) => (
            <View key={`${value}-${index}`} className="flex-row items-center">
              <View className="min-w-[22px] h-[20px] justify-center items-center rounded-[4px] bg-[#222222] px-1">
                <Text className="text-center text-[11px] font-black text-white">{value}</Text>
              </View>
              {index < 2 && <Text className="mx-[2px] font-extrabold text-[#EE4D2D] text-[12px] self-center">:</Text>}
            </View>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 py-1">
        {products.map((product, index) => {
          const percent = 30 + (index % 7) * 10;
          return (
            <Pressable
              key={`${product.id}-${index}`}
              onPress={() => router.push(`/product/detail?id=${product.id}` as Href)}
              className="w-[120px] overflow-hidden rounded-[12px] bg-white pb-3 shadow-[0px_4px_10px_rgba(0,0,0,0.03)] border border-[#FFE5DF]"
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <View className="relative h-[84px] w-full bg-[#f3f5fa]">
                <Image source={{ uri: product.imageUrl }} className="h-full w-full" contentFit="cover" />
                {product.badge ? (
                  <View className="absolute left-0 top-0 rounded-br-[8px] bg-[#EE4D2D] px-2 py-[2.5px]">
                    <Text className="text-[9px] font-black text-white">{product.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text className="px-2 pt-2 text-[12px] font-black leading-[16px] text-[#EE4D2D]">{product.price}</Text>
              
              {/* Shopee Progress Bar */}
              <View className="mx-2 mt-2 h-[13px] justify-center overflow-hidden rounded-full bg-[#FFE5DF] relative border border-[#EE4D2D]/10">
                <View
                  style={{ width: `${percent}%` }}
                  className="absolute left-0 top-0 h-full rounded-full bg-[#EE4D2D]"
                />
                <Text className="absolute w-full text-center text-[7.5px] font-black uppercase text-white z-10">
                  {percent > 80 ? "Sắp cháy hàng" : `Đang bán chạy`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
