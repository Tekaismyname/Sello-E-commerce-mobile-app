import { Pressable, Text, View } from "react-native";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

type CheckoutFooterBarProps = {
  totalAmount: number;
  disabled?: boolean;
  submitting?: boolean;
  onSubmit: () => void;
};

export function CheckoutFooterBar({
  totalAmount,
  disabled,
  submitting,
  onSubmit,
}: CheckoutFooterBarProps) {
  return (
    <View className="border-t border-[#E1E7EF] bg-white px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[12px] font-bold text-[#64748B]">TOTAL</Text>
          <Text className="mt-1 text-[33px] font-extrabold text-[#0369A1]">{formatPrice(totalAmount)}</Text>
        </View>

        <Pressable
          onPress={onSubmit}
          disabled={disabled || submitting}
          className={`h-[54px] min-w-[178px] items-center justify-center rounded-[12px] px-8 ${
            disabled || submitting ? "bg-[#9EBBCE]" : "bg-[#2F95D2]"
          }`}
        >
          <Text className="text-[17px] font-extrabold text-white">
            {submitting ? "Placing..." : "Place order"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
