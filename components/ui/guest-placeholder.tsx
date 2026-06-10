import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
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
  buttonText = "Sign In Now",
}: GuestPlaceholderProps) {
  const handleLoginRedirect = () => {
    router.push("/auth/login" as Href);
  };

  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-[#EBF5FF] shadow-[0px_8px_20px_rgba(21,123,184,0.15)]">
        <Feather name={icon} size={36} color="#157bb8" />
      </View>

      <Text className="mb-2 text-center text-[20px] font-extrabold text-[#1F2934]">
        {title}
      </Text>

      <Text className="mb-8 max-w-[280px] text-center text-[14px] leading-[22px] text-[#5A6E85]">
        {description}
      </Text>

      <UIButton
        title={buttonText}
        variant="primary"
        className="h-[52px] w-full max-w-[240px] rounded-[14px] shadow-[0px_8px_16px_rgba(21,123,184,0.2)]"
        onPress={handleLoginRedirect}
      />
    </View>
  );
}
