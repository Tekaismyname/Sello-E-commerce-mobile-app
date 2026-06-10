import { Pressable, Text, View } from "react-native";

type ProductSizeSelectorProps = {
  sizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
};

export function ProductSizeSelector({ sizes, selectedSize, onSelectSize }: ProductSizeSelectorProps) {
  return (
    <View className="bg-white px-4 py-5">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[14px] font-bold uppercase tracking-wider text-[#191C1F]">Size (EU)</Text>
        <Pressable>
          <Text className="text-[12px] font-semibold text-[#006397] underline">Size chart</Text>
        </Pressable>
      </View>
      <View className="flex-row flex-wrap gap-3">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <Pressable
              key={size}
              onPress={() => onSelectSize(size)}
              className={`h-[48px] w-[83.5px] items-center justify-center rounded-[12px] ${
                isSelected ? "bg-[#006397]" : "bg-[#E7E8EC]"
              }`}
            >
              <Text
                className={`text-[15px] font-bold ${
                  isSelected ? "text-white" : "text-[#191C1F]"
                }`}
              >
                {size}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
