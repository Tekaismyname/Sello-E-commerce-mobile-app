import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { UIButton } from "./button";

type GuestPlaceholderProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  buttonText?: string;
};

export function GuestPlaceholder({
  icon,
  title,
  description,
  buttonText = "Đăng nhập ngay",
}: GuestPlaceholderProps) {
  const handleLoginRedirect = () => {
    router.push("/auth/login" as Href);
  };

  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      {/* Icon Wrapper with Glassmorphism / Sleek drop shadow effect */}
      <View className="h-20 w-20 items-center justify-center rounded-full bg-[#EBF5FF] shadow-[0px_8px_20px_rgba(21,123,184,0.15)] mb-6">
        <Feather name={icon} size={36} color="#157bb8" />
      </View>

      {/* Title */}
      <Text className="text-[20px] font-extrabold text-[#1F2934] text-center mb-2">
        {title}
      </Text>

      {/* Description */}
      <Text className="text-[14px] leading-[22px] text-[#5A6E85] text-center mb-8 max-w-[280px]">
        {description}
      </Text>

      {/* Login CTA Button */}
      <UIButton
        title={buttonText}
        variant="primary"
        className="w-full max-w-[240px] h-[52px] rounded-[14px] shadow-[0px_8px_16px_rgba(21,123,184,0.2)]"
        onPress={handleLoginRedirect}
      />
    </View>
  );
}
