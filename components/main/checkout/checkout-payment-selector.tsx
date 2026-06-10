import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type PaymentMethod = {
  id: number;
  code: string;
  name: string;
  status: string;
};

type CheckoutPaymentSelectorProps = {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethodId: number | null;
  onSelectPaymentMethod: (paymentMethodId: number) => void;
};

const getPaymentMethodLabel = (method: PaymentMethod) => {
  const normalizedCode = method.code.trim().toUpperCase();

  if (normalizedCode === "COD") return "Cash on delivery";
  if (normalizedCode === "MOMO") return "MoMo e-wallet";
  if (normalizedCode === "CARD") return "Bank card (domestic/international)";
  if (normalizedCode === "PAYPAL") return "International payment gateway PayPal";

  return method.name;
};

export function CheckoutPaymentSelector({
  paymentMethods,
  selectedPaymentMethodId,
  onSelectPaymentMethod,
}: CheckoutPaymentSelectorProps) {
  return (
    <View className="gap-2">
      {paymentMethods.map((method) => {
        const selected = selectedPaymentMethodId === method.id;

        return (
          <Pressable
            key={method.id}
            onPress={() => onSelectPaymentMethod(method.id)}
            className={`rounded-[12px] border p-3 ${
              selected ? "border-[#006397] bg-[#EAF5FC]" : "border-[#E0E6ED] bg-[#F8F9FB]"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[14px] font-bold text-[#1F2934]">
                  {getPaymentMethodLabel(method)}
                </Text>
                <Text className="mt-1 text-[12px] text-[#5E6A78]">{method.code}</Text>
              </View>
              <Feather
                name={selected ? "check-circle" : "circle"}
                size={18}
                color={selected ? "#006397" : "#94A0AE"}
              />
            </View>
          </Pressable>
        );
      })}

      {!paymentMethods.length && (
        <View className="rounded-[12px] bg-[#F8F9FB] p-3">
          <Text className="text-[13px] font-semibold text-[#5E6A78]">
            No payment methods are currently available.
          </Text>
        </View>
      )}
    </View>
  );
}
