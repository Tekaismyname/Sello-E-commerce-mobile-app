import { PressableProps } from "react-native";
import { UIButton } from "@/components/ui";

type AuthButtonProps = {
  title: string;
  loading?: boolean;
  className?: string;
} & Omit<PressableProps, "className">;

export function AuthButton({ title, loading, className, disabled, ...rest }: AuthButtonProps) {
  return (
    <UIButton
      title={title}
      loading={loading}
      disabled={disabled}
      className={className}
      {...rest}
    />
  );
}
