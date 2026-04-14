import { Text, TextInput, View } from "react-native";

type ProductPriceStockProps = {
  basePrice: string;
  comparePrice: string;
  stockQty: string;
  onBasePriceChange: (value: string) => void;
  onComparePriceChange: (value: string) => void;
  onStockQtyChange: (value: string) => void;
};

export function ProductPriceStock({
  basePrice,
  comparePrice,
  stockQty,
  onBasePriceChange,
  onComparePriceChange,
  onStockQtyChange,
}: ProductPriceStockProps) {
  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <Text className="mb-5 text-[16px] font-bold text-[#191C1F]">3. Giá bán và kho hàng</Text>

      <View className="gap-4">
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">GIÁ BÁN *</Text>
            <View className="h-12 flex-row items-center justify-between rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4">
              <TextInput
                className="flex-1 text-[14px] text-[#191C1F]"
                placeholder="0"
                placeholderTextColor="#97A0AB"
                keyboardType="numeric"
                value={basePrice}
                onChangeText={onBasePriceChange}
              />
              <Text className="text-[14px] font-bold text-[#6B7682]">₫</Text>
            </View>
          </View>

          <View className="flex-1">
            <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">GIÁ GỐC</Text>
            <View className="h-12 flex-row items-center justify-between rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4">
              <TextInput
                className="flex-1 text-[14px] text-[#191C1F]"
                placeholder="0"
                placeholderTextColor="#97A0AB"
                keyboardType="numeric"
                value={comparePrice}
                onChangeText={onComparePriceChange}
              />
              <Text className="text-[14px] font-bold text-[#6B7682]">₫</Text>
            </View>
          </View>
        </View>

        <View>
          <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">SỐ LƯỢNG KHO</Text>
          <TextInput
            className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
            placeholder="0"
            placeholderTextColor="#97A0AB"
            keyboardType="numeric"
            value={stockQty}
            onChangeText={onStockQtyChange}
          />
        </View>
      </View>
    </View>
  );
}
