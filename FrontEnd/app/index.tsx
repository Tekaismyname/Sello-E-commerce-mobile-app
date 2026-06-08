import { Href, router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding/onboarding" as Href);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fd]">
      <View className="flex-1 items-center justify-center px-8">
        <View className="items-center gap-5">
          <View className="h-[96px] w-[96px] items-center justify-center rounded-[28px] bg-[#157bb8] shadow-[0px_12px_24px_rgba(21,123,184,0.24)]">
            <View className="h-[44px] w-[44px] items-center justify-center rounded-[14px] border border-white/25">
              <Text className="text-[26px] font-extrabold text-white">*</Text>
            </View>
          </View>

          <View className="items-center gap-2">
            <Text className="text-[48px] font-extrabold tracking-[-1.2px] text-[#001d31]">
              SELLO
            </Text>
            <Text className="text-[16px] font-medium tracking-[4px] text-[#3f4850]">
              COMMERCE EXPERIENCE
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
