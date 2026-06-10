import { OtpDeliveryMethod } from "@/types/auth";
import { Pressable, Text, View } from "react-native";

type DeliveryMethodToggleProps = {
  value: OtpDeliveryMethod;
  onChange: (value: OtpDeliveryMethod) => void;
};

export function DeliveryMethodToggle({ value, onChange }: DeliveryMethodToggleProps) {
  const renderButton = (method: OtpDeliveryMethod, title: string) => (
    <Pressable
      key={method}
      className={`h-[40px] flex-1 items-center justify-center rounded-[10px] ${
        value === method ? "bg-[#157bb8]" : "bg-[#e6e8ec]"
      }`}
      onPress={() => onChange(method)}
    >
      <Text
        className={`text-[14px] font-semibold ${
          value === method ? "text-white" : "text-[#3f4850]"
        }`}
      >
        {title}
      </Text>
    </Pressable>
  );

  return (
    <View>
      <Text className="mb-2 text-[14px] font-medium text-[#3f4850]">Receive OTP via</Text>
      <View className="flex-row gap-2">
        {renderButton("email", "Email")}
        {renderButton("phone", "Phone number")}
      </View>
    </View>
  );
}
