import { ActivityIndicator, Pressable, PressableProps, Text } from "react-native";

type UIButtonVariant = "primary" | "secondary" | "light";

type UIButtonProps = {
  title: string;
  loading?: boolean;
  variant?: UIButtonVariant;
  className?: string;
  textClassName?: string;
} & Omit<PressableProps, "className">;

const buttonVariantClass: Record<UIButtonVariant, string> = {
  primary: "bg-[#157bb8]",
  secondary: "bg-[#d9dadf]",
  light: "bg-white border border-[#dbe2ea]",
};

const textVariantClass: Record<UIButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-[#157bb8]",
  light: "text-[#2b3642]",
};

export function UIButton({
  title,
  loading,
  variant = "primary",
  className,
  textClassName,
  disabled,
  ...rest
}: UIButtonProps) {
  return (
    <Pressable
      className={`h-[56px] items-center justify-center rounded-[12px] active:opacity-90 ${buttonVariantClass[variant]} ${className ?? ""}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#ffffff" : "#157bb8"} />
      ) : (
        <Text className={`text-[18px] font-semibold ${textVariantClass[variant]} ${textClassName ?? ""}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
