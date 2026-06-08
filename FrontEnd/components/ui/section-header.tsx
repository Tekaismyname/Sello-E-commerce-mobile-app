import { Pressable, Text, View } from "react-native";

type UISectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
};

export function UISectionHeader({ title, actionLabel, onActionPress, className }: UISectionHeaderProps) {
  return (
    <View className={`mb-3 flex-row items-center justify-between ${className ?? ""}`}>
      <Text className="text-[24px] font-extrabold text-[#1c2530]">{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onActionPress}>
          <Text className="text-[13px] font-semibold text-[#2c79e8]">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
