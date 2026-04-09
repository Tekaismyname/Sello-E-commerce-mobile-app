import { ReactNode } from "react";
import { View, ViewProps } from "react-native";

type UICardProps = {
  children: ReactNode;
  className?: string;
} & Omit<ViewProps, "className">;

export function UICard({ children, className, ...rest }: UICardProps) {
  return (
    <View className={`rounded-[14px] bg-white ${className ?? ""}`} {...rest}>
      {children}
    </View>
  );
}
