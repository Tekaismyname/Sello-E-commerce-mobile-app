import { Text, View } from "react-native";

type CheckoutPricingProps = {
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
};

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

export function CheckoutPricing({ subtotal, shippingFee, discount, totalAmount }: CheckoutPricingProps) {
  return (
    <View className="rounded-[16px] bg-white p-4">
      <Text className="text-[15px] font-extrabold text-[#1F2934]">Chi tiet thanh toan</Text>

      <View className="mt-3 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] text-[#5E6A78]">Tam tinh</Text>
          <Text className="text-[13px] font-semibold text-[#1F2934]">{formatPrice(subtotal)}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] text-[#5E6A78]">Phi van chuyen</Text>
          <Text className="text-[13px] font-semibold text-[#1F2934]">{formatPrice(shippingFee)}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] text-[#5E6A78]">Giam gia</Text>
          <Text className="text-[13px] font-semibold text-[#12805C]">-{formatPrice(discount)}</Text>
        </View>
      </View>

      <View className="my-3 h-[1px] bg-[#E6EBF1]" />

      <View className="flex-row items-center justify-between">
        <Text className="text-[15px] font-extrabold text-[#1F2934]">Tong cong</Text>
        <Text className="text-[18px] font-extrabold text-[#006397]">{formatPrice(totalAmount)}</Text>
      </View>
    </View>
  );
}
