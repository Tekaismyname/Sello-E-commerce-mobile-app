import { Text } from "react-native";

type UIMessageTone = "error" | "success" | "info";

type UIMessageProps = {
  tone: UIMessageTone;
  text: string;
  className?: string;
};

const toneClass: Record<UIMessageTone, string> = {
  error: "bg-[#ffe7e7] text-[#b42318]",
  success: "bg-[#e8f7ee] text-[#067647]",
  info: "bg-[#e8eef9] text-[#0f4c81]",
};

export function UIMessage({ tone, text, className }: UIMessageProps) {
  if (!text) {
    return null;
  }

  return <Text className={`rounded-[10px] px-3 py-2 text-[14px] ${toneClass[tone]} ${className ?? ""}`}>{text}</Text>;
}
