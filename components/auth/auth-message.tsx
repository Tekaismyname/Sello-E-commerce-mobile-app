import { UIMessage } from "@/components/ui";

type AuthMessageProps = {
  kind: "error" | "success" | "info";
  text: string;
};

export function AuthMessage({ kind, text }: AuthMessageProps) {
  return <UIMessage tone={kind} text={text} />;
}
