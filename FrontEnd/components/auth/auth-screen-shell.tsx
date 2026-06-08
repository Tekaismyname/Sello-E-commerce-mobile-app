import { ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function AuthScreenShell({
  title,
  subtitle,
  children,
  titleClassName,
  subtitleClassName,
}: AuthScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fd] px-6">
      <View className="flex-1 justify-center">
        <Text className={`text-[36px] font-extrabold text-[#191c1f] ${titleClassName ?? ""}`}>
          {title}
        </Text>
        {subtitle ? (
          <Text className={`mt-2 text-[16px] text-[#3f4850] ${subtitleClassName ?? ""}`}>
            {subtitle}
          </Text>
        ) : null}
        <View className="mt-8 gap-4">{children}</View>
      </View>
    </SafeAreaView>
  );
}
