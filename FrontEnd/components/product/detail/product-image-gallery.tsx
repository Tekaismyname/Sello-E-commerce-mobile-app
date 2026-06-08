import { View } from "react-native";
import { ProductImage } from "../shared";

type ProductImageGalleryProps = {
  images: string[];
};

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  // In a real app, this would be a horizontal ScrollView or FlatList
  return (
    <View className="h-[487px] w-full bg-[#F2F3F7]">
      <View className="flex-1 px-4 py-8">
        <ProductImage uri={images[0]} className="h-full w-full bg-transparent" />
      </View>
      <View className="absolute bottom-6 w-full flex-row justify-center gap-2">
        <View className="h-1.5 w-8 rounded-full bg-[#006397]" />
        <View className="h-1.5 w-2 rounded-full bg-[#BFC7D2]" />
        <View className="h-1.5 w-2 rounded-full bg-[#BFC7D2]" />
      </View>
    </View>
  );
}
