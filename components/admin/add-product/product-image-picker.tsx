import { AdminProductImage } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Image, Pressable, Text, TextInput, View } from "react-native";

type ProductImagePickerProps = {
  images: AdminProductImage[];
  onChange: (images: AdminProductImage[]) => void;
};

export function ProductImagePicker({ images, onChange }: ProductImagePickerProps) {
  const updateImage = (
    index: number,
    key: keyof AdminProductImage,
    value: string | boolean | number | undefined,
  ) => {
    onChange(
      images.map((image, imageIndex) =>
        imageIndex === index
          ? {
              ...image,
              [key]: value,
            }
          : image,
      ),
    );
  };

  const addImage = () => {
    onChange([
      ...images,
      {
        imageUrl: "",
        isPrimary: images.length === 0,
        sortOrder: images.length,
      },
    ]);
  };

  const removeImage = (index: number) => {
    const nextImages = images.filter((_, imageIndex) => imageIndex !== index);

    if (nextImages.length > 0 && !nextImages.some((image) => image.isPrimary)) {
      nextImages[0] = { ...nextImages[0], isPrimary: true };
    }

    onChange(nextImages.map((image, imageIndex) => ({ ...image, sortOrder: imageIndex })));
  };

  const markPrimary = (index: number) => {
    onChange(
      images.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      })),
    );
  };

  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-[16px] font-bold text-[#191C1F]">1. Hình ảnh sản phẩm</Text>
        <Pressable onPress={addImage} className="flex-row items-center gap-1">
          <Feather name="plus" size={14} color="#006397" />
          <Text className="text-[13px] font-bold text-[#006397]">Thêm ảnh</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {images.map((image, index) => (
          <View key={`image-${index}`} className="rounded-[12px] border border-[#E7E8EC] bg-[#F8F9FA] p-3">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[12px] font-bold uppercase text-[#6B7682]">
                {image.isPrimary ? "Ảnh chính" : `Ảnh ${index + 1}`}
              </Text>
              <Pressable onPress={() => removeImage(index)} className="h-7 w-7 items-center justify-center rounded-full bg-[#FFEAEB]">
                <Feather name="trash-2" size={12} color="#DC2626" />
              </Pressable>
            </View>

            <TextInput
              className="h-12 rounded-[12px] border border-[#E7E8EC] bg-white px-4 text-[14px] text-[#191C1F]"
              placeholder="Dán URL hình ảnh..."
              placeholderTextColor="#97A0AB"
              value={image.imageUrl}
              onChangeText={(value) => updateImage(index, "imageUrl", value)}
            />

            {!!image.imageUrl && (
              <View className="mt-3 h-28 overflow-hidden rounded-[12px] bg-[#F4F5F7]">
                <Image source={{ uri: image.imageUrl }} className="h-full w-full" resizeMode="cover" />
              </View>
            )}

            <Pressable
              onPress={() => markPrimary(index)}
              className={`mt-3 flex-row items-center justify-center gap-2 rounded-[10px] py-3 ${
                image.isPrimary ? "bg-[#006397]" : "bg-[#E8EDF2]"
              }`}
            >
              <Feather
                name={image.isPrimary ? "check-circle" : "circle"}
                size={15}
                color={image.isPrimary ? "white" : "#44515F"}
              />
              <Text
                className={`text-[12px] font-bold ${
                  image.isPrimary ? "text-white" : "text-[#44515F]"
                }`}
              >
                {image.isPrimary ? "Đang là ảnh chính" : "Đặt làm ảnh chính"}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text className="mt-4 text-[12px] leading-[18px] text-[#97A0AB]">
        Mẹo: hiện tại form nhận URL ảnh để thao tác nhanh trong admin. Ảnh chính sẽ được gửi với
        isPrimary=true.
      </Text>
    </View>
  );
}
