import { Text, TextInput, View } from "react-native";

export function ProductPriceStock() {
  return (
    <View className="mb-6 rounded-[16px] bg-white p-5 shadow-sm border border-[#F2F3F7]">
      <Text className="mb-5 text-[16px] font-bold text-[#191C1F]">3. Giá bán & Kho hàng</Text>

      <View className="gap-4">
        <View className="flex-row gap-4">
          {/* Giá bán */}
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-[#6B7682] mb-2 uppercase">GIÁ BÁN</Text>
            <View className="h-12 rounded-[12px] bg-[#F4F5F7] px-4 flex-row items-center justify-between border border-[#E7E8EC]">
              <TextInput
                className="flex-1 text-[14px] text-[#191C1F]"
                placeholder="0"
                placeholderTextColor="#97A0AB"
                keyboardType="numeric"
              />
              <Text className="text-[14px] font-bold text-[#6B7682]">₫</Text>
            </View>
          </View>
          
          {/* Giá gốc */}
          <View className="flex-1">
            <Text className="text-[11px] font-bold text-[#6B7682] mb-2 uppercase">GIÁ GỐC</Text>
            <View className="h-12 rounded-[12px] bg-[#F4F5F7] px-4 flex-row items-center justify-between border border-[#E7E8EC]">
              <TextInput
                className="flex-1 text-[14px] text-[#191C1F]"
                placeholder="0"
                placeholderTextColor="#97A0AB"
                keyboardType="numeric"
              />
              <Text className="text-[14px] font-bold text-[#6B7682]">₫</Text>
            </View>
          </View>
        </View>

        {/* Số lượng kho */}
        <View>
          <Text className="text-[11px] font-bold text-[#6B7682] mb-2 uppercase">SỐ LƯỢNG KHO</Text>
          <TextInput
            className="h-12 rounded-[12px] bg-[#F4F5F7] px-4 text-[14px] text-[#191C1F] border border-[#E7E8EC]"
            placeholder="0"
            placeholderTextColor="#97A0AB"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );
}
