import { ProductCard } from "@/types/main";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from "react-native";
import { useSettings } from "@/contexts/settings-context";

const CARD_STEP = 132; // 120px card + 12px gap

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
  const { t } = useSettings();
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

  // Shimmer/glow loop on the "FLASH SALE" wordmark.
  const shimmer = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.4, duration: 900, easing: Easing.ease, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  // Pulse the seconds box each time the second changes.
  const digitPulse = useRef(new Animated.Value(1)).current;
  const prevSeconds = useRef<string | null>(null);
  const seconds = displayedCountdown[2];
  useEffect(() => {
    if (seconds !== prevSeconds.current) {
      prevSeconds.current = seconds ?? null;
      Animated.sequence([
        Animated.timing(digitPulse, { toValue: 1.25, duration: 90, useNativeDriver: true }),
        Animated.timing(digitPulse, { toValue: 1, duration: 90, useNativeDriver: true }),
      ]).start();
    }
  }, [seconds, digitPulse]);

  // Slow auto-scroll through the products; pauses while the user is dragging.
  const scrollRef = useRef<ScrollView>(null);
  const offsetRef = useRef(0);
  const contentWidthRef = useRef(0);
  const viewportWidthRef = useRef(0);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (products.length <= 2) return undefined;
    const timer = setInterval(() => {
      if (draggingRef.current) return;
      const maxOffset = Math.max(0, contentWidthRef.current - viewportWidthRef.current);
      let next = offsetRef.current + CARD_STEP;
      if (next > maxOffset) next = 0;
      offsetRef.current = next;
      scrollRef.current?.scrollTo({ x: next, animated: true });
    }, 2500);
    return () => clearInterval(timer);
  }, [products.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetRef.current = e.nativeEvent.contentOffset.x;
  };

  return (
    <View className="mb-5 rounded-[16px] border border-[#FFE5DF] bg-[#FFF3F0] px-3 py-3">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Feather name="zap" size={18} color="#EE4D2D" />
          <Animated.Text
            style={{ opacity: shimmer }}
            className="text-[20px] font-black uppercase tracking-tighter text-[#EE4D2D]"
          >
            FLASH SALE
          </Animated.Text>
        </View>
        <View className="flex-row items-center gap-1">
          {displayedCountdown.map((value, index) => (
            <View key={`${value}-${index}`} className="flex-row items-center">
              <Animated.View
                style={index === 2 ? { transform: [{ scale: digitPulse }] } : undefined}
                className="min-w-[22px] h-[20px] items-center justify-center rounded-[4px] bg-[#222222] px-1"
              >
                <Text className="text-center text-[11px] font-black text-white">{value}</Text>
              </Animated.View>
              {index < 2 && <Text className="mx-[2px] self-center text-[12px] font-extrabold text-[#EE4D2D]">:</Text>}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 py-1"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollBeginDrag={() => { draggingRef.current = true; }}
        onScrollEndDrag={() => { draggingRef.current = false; }}
        onLayout={(e) => { viewportWidthRef.current = e.nativeEvent.layout.width; }}
        onContentSizeChange={(w) => { contentWidthRef.current = w; }}
      >
        {products.map((product, index) => {
          const percent = 30 + (index % 7) * 10;
          return (
            <Pressable
              key={`${product.id}-${index}`}
              onPress={() => router.push(`/product/detail?id=${product.id}` as Href)}
              className="w-[120px] overflow-hidden rounded-[12px] border border-[#FFE5DF] bg-white pb-3 shadow-[0px_4px_10px_rgba(0,0,0,0.03)]"
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

              <View className="relative mx-2 mt-2 h-[13px] justify-center overflow-hidden rounded-full border border-[#EE4D2D]/10 bg-[#FFE5DF]">
                <View
                  style={{ width: `${percent}%` }}
                  className="absolute left-0 top-0 h-full rounded-full bg-[#EE4D2D]"
                />
                <Text className="absolute z-10 w-full text-center text-[7.5px] font-black uppercase text-white">
                  {percent > 80 ? t("almost_sold_out", "Almost Sold Out") : t("best_seller", "Best Seller")}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

