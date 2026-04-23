import { ReactNode } from "react";
import { Text, View } from "react-native";

type CheckoutSectionCardProps = {
  title: string;
  children: ReactNode;
};

export function CheckoutSectionCard({ title, children }: CheckoutSectionCardProps) {
  return (
    <View className="rounded-[16px] bg-white p-4">
      <Text className="text-[15px] font-extrabold text-[#1F2934]">{title}</Text>
      <View className="mt-3 gap-2">{children}</View>
    </View>
  );
}
