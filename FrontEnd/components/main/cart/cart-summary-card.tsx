import { Pressable, Text, View } from "react-native";

type CartSummaryCardProps = {
  selectedCount: number;
  selectedSubtotal: number;
  formatPrice: (value: number) => string;
  onCheckout: () => void;
};

export function CartSummaryCard({
  selectedCount,
  selectedSubtotal,
  formatPrice,
  onCheckout,
}: CartSummaryCardProps) {
  return (
    <View className="mt-2 rounded-[14px] bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-[#5E6A78]">Da chon {selectedCount} sản phẩm</Text>
        <Text className="text-[16px] font-extrabold text-[#006397]">{formatPrice(selectedSubtotal)}</Text>
      </View>

      <Pressable
        disabled={!selectedCount}
        onPress={onCheckout}
        className={`mt-3 h-[48px] items-center justify-center rounded-[12px] ${
          selectedCount ? "bg-[#006397]" : "bg-[#AFC8D8]"
        }`}
      >
        <Text className="text-[14px] font-extrabold text-white">Tiến hành thanh toán</Text>
      </Pressable>
    </View>
  );
}
