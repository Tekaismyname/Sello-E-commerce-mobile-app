import { Href, router } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const slides = [
  {
    id: "intro",
    title: "Meet the\nSello\nExperience",
    description:
      "Discover a premium shopping experience curated with care and delivered in a bold, editorial style right on your phone.",
    imageUri: "https://www.figma.com/api/mcp/asset/e6800592-41b2-49f9-a79c-277facfb88b2",
  },
  {
    id: "discover",
    title: "Explore\nCurated\nCollections",
    description:
      "Stay ahead with fresh weekly picks, hand-selected products, and recommendations tailored to your personal style.",
    imageUri: "https://www.figma.com/api/mcp/asset/e6800592-41b2-49f9-a79c-277facfb88b2",
  },
  {
    id: "checkout",
    title: "Fast,\nSecure\nCheckout",
    description:
      "From cart to confirmation in just a few taps, with a smooth and transparent checkout experience every step of the way.",
    imageUri: "https://www.figma.com/api/mcp/asset/e6800592-41b2-49f9-a79c-277facfb88b2",
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenWidth, setScreenWidth] = useState(390);
  const scrollRef = useRef<ScrollView>(null);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const width = event.nativeEvent.layoutMeasurement.width;
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const goToWelcome = () => {
    router.replace("/onboarding/welcome" as Href);
  };

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      goToWelcome();
      return;
    }

    const nextIndex = currentSlide + 1;
    scrollRef.current?.scrollTo({
      x: nextIndex * screenWidth,
      animated: true,
    });
    setCurrentSlide(nextIndex);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fd]">
      <View className="flex-row justify-end px-6 pt-2">
        <Pressable
          className="rounded-[12px] px-4 py-2 active:bg-[#e1e2e6]"
          onPress={goToWelcome}
        >
          <Text className="text-[16px] font-semibold text-[#3f4850]">Skip</Text>
        </Pressable>
      </View>

      <View
        className="flex-1"
        onLayout={(event) => setScreenWidth(event.nativeEvent.layout.width)}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          className="flex-1"
        >
          {slides.map((slide, index) => (
            <View key={slide.id} className="w-screen px-8 pb-8 pt-4">
              <View className="relative h-[407px] w-full items-center justify-center">
                <View className="absolute inset-0 rotate-[3deg] rounded-[32px] bg-[#3498db]/10" />
                <View className="absolute inset-0 -rotate-[2deg] rounded-[32px] bg-[#de8ffd]/10" />

                <View className="h-[407px] w-full overflow-hidden rounded-[32px] bg-[#001d31] shadow-[0px_20px_25px_rgba(0,29,49,0.08)]">
                  <Image
                    source={{ uri: slide.imageUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 justify-end px-6 pb-6">
                    <View className="self-start rounded-full bg-[#00a757] px-3 py-1">
                      <Text className="text-[10px] font-semibold uppercase tracking-[1px] text-[#003216]">
                        New
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="mt-12 gap-4">
                <Text className="text-[52px] font-extrabold leading-[56px] tracking-[-1px] text-[#191c1f]">
                  {slide.title}
                </Text>
                <Text className="text-[18px] leading-[30px] text-[#3f4850]">
                  {slide.description}
                </Text>
              </View>

              <View className="mt-10 flex-row items-center gap-2">
                {slides.map((_, dotIndex) => (
                  <View
                    key={`${slide.id}-dot-${dotIndex}`}
                    className={
                      dotIndex === currentSlide
                        ? "h-[6px] w-[32px] rounded-full bg-[#167ab8]"
                        : "h-[6px] w-[8px] rounded-full bg-[#e1e2e6]"
                    }
                  />
                ))}
              </View>

              <View className="mt-8">
                {index === currentSlide ? (
                  <Pressable
                    className="h-[60px] items-center justify-center rounded-[12px] bg-[#157bb8] active:opacity-90"
                    onPress={handleNext}
                  >
                    <Text className="text-[18px] font-semibold text-white">
                      {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
