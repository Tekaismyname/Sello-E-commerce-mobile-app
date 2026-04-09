import { ComponentProps, ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type UIInputProps = {
  label?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  wrapperClassName?: string;
  inputRowClassName?: string;
  inputClassName?: string;
  onContainerPress?: () => void;
} & ComponentProps<typeof TextInput>;

export function UIInput({
  label,
  leftSlot,
  rightSlot,
  wrapperClassName,
  inputRowClassName,
  inputClassName,
  onContainerPress,
  placeholderTextColor = "#97a0aa",
  ...rest
}: UIInputProps) {
  const inputRowClass =
    `h-[52px] flex-row items-center rounded-[12px] border border-[#d9dadf] bg-white px-4 ${inputRowClassName ?? ""}`;

  const inputNode = (
    <>
      {leftSlot}
      <TextInput
        className={`flex-1 text-[16px] text-[#191c1f] ${leftSlot ? "ml-3" : ""} ${inputClassName ?? ""}`}
        placeholderTextColor={placeholderTextColor}
        {...rest}
      />
      {rightSlot}
    </>
  );

  return (
    <View className={wrapperClassName}>
      {label ? <Text className="mb-2 text-[14px] font-medium text-[#3f4850]">{label}</Text> : null}
      {onContainerPress ? (
        <Pressable className={inputRowClass} onPress={onContainerPress}>
          {inputNode}
        </Pressable>
      ) : (
        <View className={inputRowClass}>{inputNode}</View>
      )}
    </View>
  );
}
