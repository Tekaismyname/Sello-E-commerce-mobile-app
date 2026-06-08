import { Text, View } from "react-native";

type SelloAuthLogoProps = {
  subtitle?: string;
};

export function SelloAuthLogo({
  subtitle = "COMMERCE EXPERIENCE",
}: SelloAuthLogoProps) {
  return (
    <View className="items-center">
      <View className="h-[96px] w-[96px] items-center justify-center rounded-[28px] bg-[#157bb8] shadow-[0px_12px_24px_rgba(21,123,184,0.24)]">
        <View className="h-[44px] w-[44px] items-center justify-center rounded-[14px] border border-white/25">
          <Text className="text-[24px] font-extrabold text-white">✦</Text>
        </View>
      </View>

      <Text className="mt-6 text-[48px] font-extrabold tracking-[-1.2px] text-[#001d31]">SELLO</Text>
      <Text className="mt-1 text-[14px] font-medium tracking-[3.8px] text-[#3f4850]">{subtitle}</Text>
    </View>
  );
}

