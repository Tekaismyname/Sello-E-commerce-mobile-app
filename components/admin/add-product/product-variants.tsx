import { AdminProductVariant } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL } from "@/constants/api";

type ProductVariantsProps = {
  variants: AdminProductVariant[];
  onChange: (variants: AdminProductVariant[]) => void;
};

const onlyDigits = (value: string) => value.replace(/[^0-9]/g, "");

export function ProductVariants({ variants, onChange }: ProductVariantsProps) {
  const { token } = useAuth();
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
    })();
  }, []);

  const updateVariant = (
    index: number,
    key: keyof AdminProductVariant,
    value: string | number | undefined,
  ) => {
    onChange(
      variants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [key]: value,
            }
          : variant,
      ),
    );
  };

  const addVariant = () => {
    onChange([
      ...variants,
      {
        color: "",
        size: "",
        skuVariant: "",
        price: 0,
        stockQty: 0,
        status: "active",
      },
    ]);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, variantIndex) => variantIndex !== index));
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
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setUploadingIndex(index);

      try {
        const publicUrl = await uploadImageFile(asset.uri);
        updateVariant(index, "imageUrl", publicUrl);
      } catch (err: any) {
        alert(err.message || "Cannot upload variant image.");
      } finally {
        setUploadingIndex(null);
      }
    }
  };

  return (
    <View className="mb-6 rounded-[16px] border border-[#F2F3F7] bg-white p-5 shadow-sm">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-[16px] font-bold text-[#191C1F]">Product Variants List</Text>
        <Pressable onPress={addVariant} className="flex-row items-center gap-1">
          <Feather name="plus" size={14} color="#006397" />
          <Text className="text-[13px] font-bold text-[#006397]">Add Variant</Text>
        </Pressable>
      </View>

      <View className="gap-4">
        {variants.map((variant, index) => (
          <View key={`variant-${index}`} className="rounded-[12px] border border-[#E7E8EC] bg-[#F8F9FA] p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[12px] font-bold uppercase text-[#6B7682]">Variant {index + 1}</Text>
              <Pressable onPress={() => removeVariant(index)} className="h-7 w-7 items-center justify-center rounded-full bg-[#FFEAEB]">
                <Feather name="trash-2" size={12} color="#DC2626" />
              </Pressable>
            </View>

            <View className="gap-3">
              <View className="flex-row gap-3">
                <TextInput
                  className="flex-1 rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                  placeholder="Color"
                  placeholderTextColor="#97A0AB"
                  value={variant.color ?? ""}
                  onChangeText={(value) => updateVariant(index, "color", value)}
                />
                <TextInput
                  className="flex-1 rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                  placeholder="Size"
                  placeholderTextColor="#97A0AB"
                  value={variant.size ?? ""}
                  onChangeText={(value) => updateVariant(index, "size", value)}
                />
              </View>
 
              <TextInput
                className="rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                placeholder="SKU variant"
                placeholderTextColor="#97A0AB"
                value={variant.skuVariant ?? ""}
                onChangeText={(value) => updateVariant(index, "skuVariant", value)}
              />

              {/* Image Picker for Variant */}
              <View className="rounded-[12px] border border-[#E7E8EC] bg-white p-2">
                {uploadingIndex === index ? (
                  <View className="h-12 items-center justify-center">
                    <ActivityIndicator size="small" color="#006397" />
                  </View>
                ) : variant.imageUrl ? (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <Image source={{ uri: variant.imageUrl }} className="h-10 w-10 rounded-[8px] bg-gray-100" resizeMode="cover" />
                      <Text className="text-[12px] text-gray-500 font-semibold max-w-[150px]" numberOfLines={1}>
                        Uploaded image
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => pickImage(index)}
                      className="rounded-full bg-[#EAF4FF] px-3 py-1.5 flex-row items-center gap-1 active:bg-[#CDE5FF]"
                    >
                      <Feather name="edit-2" size={10} color="#006397" />
                      <Text className="text-[10px] font-bold text-[#006397]">Change</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => pickImage(index)}
                    className="h-11 flex-row items-center justify-center gap-2 rounded-[8px] bg-gray-55 active:bg-gray-100"
                  >
                    <Feather name="image" size={14} color="#556070" />
                    <Text className="text-[12px] font-bold text-[#556070]">Upload variant image</Text>
                  </Pressable>
                )}
              </View>

              <View className="flex-row gap-3">
                <TextInput
                  className="flex-1 rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                  placeholder="Price"
                  placeholderTextColor="#97A0AB"
                  keyboardType="numeric"
                  value={String(variant.price ?? "")}
                  onChangeText={(value) => updateVariant(index, "price", Number(onlyDigits(value) || "0"))}
                />
                <TextInput
                  className="flex-1 rounded-[12px] border border-[#E7E8EC] bg-white px-4 py-3 text-[14px] text-[#191C1F]"
                  placeholder="Stock"
                  placeholderTextColor="#97A0AB"
                  keyboardType="numeric"
                  value={String(variant.stockQty ?? "")}
                  onChangeText={(value) =>
                    updateVariant(index, "stockQty", Number(onlyDigits(value) || "0"))
                  }
                />
              </View>
            </View>
          </View>
        ))}

        {variants.length === 0 && (
          <View className="rounded-[12px] bg-[#F8F9FA] p-4">
            <Text className="text-[13px] text-[#6B7682]">No variants yet. You can create a single product or add a new variant.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
