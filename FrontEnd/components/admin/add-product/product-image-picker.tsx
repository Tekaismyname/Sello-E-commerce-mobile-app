import { AdminProductImage } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL } from "@/constants/api";

type ProductImagePickerProps = {
  images: AdminProductImage[];
  onChange: (images: AdminProductImage[]) => void;
};

export function ProductImagePicker({ images, onChange }: ProductImagePickerProps) {
  const { token } = useAuth();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need gallery permissions to pick product images!");
        }
      }
    })();
  }, []);

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

  const uploadImageFile = async (fileUri: string): Promise<string> => {
    const formData = new FormData();
    const filename = fileUri.split("/").pop() || "upload.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const fileType = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: fileType,
    } as any);

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: "POST",
      body: formData,
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${errorText || res.statusText}`);
    }

    const json = await res.json();
    return `${API_BASE_URL}${json.url}`;
  };

  const pickImage = async (index: number) => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setUploadingIndex(index);

      try {
        const publicUrl = await uploadImageFile(asset.uri);
        updateImage(index, "imageUrl", publicUrl);
      } catch (err: any) {
        alert(err.message || "Failed to upload image.");
      } finally {
        setUploadingIndex(null);
      }
    }
  };

  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-[16px] font-bold text-[#191C1F]">1. Product Images</Text>
        <Pressable onPress={addImage} className="flex-row items-center gap-1">
          <Feather name="plus" size={14} color="#006397" />
          <Text className="text-[13px] font-bold text-[#006397]">Add Image</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {images.map((image, index) => (
          <View key={`image-${index}`} className="rounded-[12px] border border-[#E7E8EC] bg-[#F8F9FA] p-3">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[12px] font-bold uppercase text-[#6B7682]">
                {image.isPrimary ? "Primary Image" : `Image ${index + 1}`}
              </Text>
              <Pressable onPress={() => removeImage(index)} className="h-7 w-7 items-center justify-center rounded-full bg-[#FFEAEB]">
                <Feather name="trash-2" size={12} color="#DC2626" />
              </Pressable>
            </View>

            {uploadingIndex === index ? (
              <View className="h-28 items-center justify-center rounded-[12px] border border-dashed border-[#006397] bg-[#F4F9FC]">
                <ActivityIndicator color="#006397" />
              </View>
            ) : !image.imageUrl ? (
              <Pressable
                onPress={() => pickImage(index)}
                className="h-28 items-center justify-center rounded-[12px] border border-dashed border-[#006397] bg-[#F4F9FC] active:opacity-80"
              >
                <Feather name="image" size={24} color="#006397" />
                <Text className="mt-2 text-[13px] font-bold text-[#006397]">Pick from Gallery</Text>
              </Pressable>
            ) : (
              <View className="h-28 overflow-hidden rounded-[12px] bg-[#F4F5F7] relative">
                <Image source={{ uri: image.imageUrl }} className="h-full w-full" resizeMode="cover" />
                <Pressable
                  onPress={() => pickImage(index)}
                  className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1.5 flex-row items-center gap-1"
                >
                  <Feather name="edit-2" size={10} color="white" />
                  <Text className="text-[10px] font-bold text-white">Change</Text>
                </Pressable>
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
                {image.isPrimary ? "Is Primary Image" : "Set as Primary Image"}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text className="mt-4 text-[12px] leading-[18px] text-[#97A0AB]">Tip: Select images directly from your device gallery. The primary image will be saved with isPrimary=true.</Text>
    </View>
  );
}
