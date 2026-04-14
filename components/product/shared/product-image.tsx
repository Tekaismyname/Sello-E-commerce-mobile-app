import { Image, View } from "react-native";

type ProductImageProps = {
  uri: string;
  className?: string;
};

export function ProductImage({ uri, className }: ProductImageProps) {
  return (
    <View className={`bg-[#f3f5f8] ${className ?? ""}`}>
      <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
    </View>
  );
}
