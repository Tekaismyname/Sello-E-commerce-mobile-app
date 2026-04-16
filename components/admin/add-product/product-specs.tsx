import { Text, TextInput, View } from "react-native";

type ProductSpecsProps = {
  sku: string;
  brandId: string;
  warrantyMonths: string;
  onSkuChange: (value: string) => void;
  onBrandIdChange: (value: string) => void;
  onWarrantyMonthsChange: (value: string) => void;
};

export function ProductSpecs({
  sku,
  brandId,
  warrantyMonths,
  onSkuChange,
  onBrandIdChange,
  onWarrantyMonthsChange,
}: ProductSpecsProps) {
  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <Text className="mb-5 text-[16px] font-bold text-[#191C1F]">Thông số kỹ thuật</Text>

      <View className="gap-4">
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">SKU</Text>
            <TextInput
              className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
              placeholder="VD: SP-001"
              placeholderTextColor="#97A0AB"
              value={sku}
              onChangeText={onSkuChange}
            />
          </View>

          <View className="flex-1">
            <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">BRAND ID</Text>
            <TextInput
              className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
              placeholder="VD: 1"
              placeholderTextColor="#97A0AB"
              keyboardType="numeric"
              value={brandId}
              onChangeText={onBrandIdChange}
            />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-[11px] font-bold uppercase text-[#6B7682]">BẢO HÀNH (THÁNG)</Text>
          <TextInput
            className="h-12 rounded-[12px] border border-[#E7E8EC] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F]"
            placeholder="VD: 12"
            placeholderTextColor="#97A0AB"
            keyboardType="numeric"
            value={warrantyMonths}
            onChangeText={onWarrantyMonthsChange}
          />
        </View>
      </View>
    </View>
  );
}
