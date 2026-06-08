import { ComponentProps } from "react";
import { TextInput } from "react-native";
import { UIInput } from "@/components/ui";

type AuthInputProps = {
  label?: string;
  inputClassName?: string;
  wrapperClassName?: string;
} & ComponentProps<typeof TextInput>;

export function AuthInput({ label, inputClassName, wrapperClassName, ...rest }: AuthInputProps) {
  return (
    <UIInput
      label={label}
      wrapperClassName={wrapperClassName}
      inputClassName={inputClassName}
      {...rest}
    />
  );
}
