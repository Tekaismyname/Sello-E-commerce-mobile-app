import { Image, Pressable, Text, View } from "react-native";

export type ProductColor = {
  name: string;
  imageUrl: string;
};

type ProductColorSelectorProps = {
  colors: ProductColor[];
  selectedColor: string;
  onSelectColor: (colorName: string) => void;
};

export function ProductColorSelector({ colors, selectedColor, onSelectColor }: ProductColorSelectorProps) {
  return (
    <View className="bg-white px-4 py-5">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[14px] font-bold uppercase tracking-wider text-[#191C1F]">Màu sắc</Text>
        <Text className="text-[14px] text-[#3F4850]">{selectedColor}</Text>
      </View>
      <View className="flex-row gap-3">
        {colors.map((color) => {
          const isSelected = selectedColor === color.name;
          return (
            <Pressable
              key={color.name}
              onPress={() => onSelectColor(color.name)}
              className={`h-[68px] w-[68px] items-center justify-center rounded-[12px] border-[2px] ${
                isSelected ? "border-black" : "border-transparent"
              } bg-[#F2F3F7] overflow-hidden`}
            >
              <Image source={{ uri: color.imageUrl }} className="h-[80%] w-[80%]" resizeMode="contain" />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
