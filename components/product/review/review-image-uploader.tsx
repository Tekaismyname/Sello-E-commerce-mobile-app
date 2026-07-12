import { useAuth } from "@/contexts/auth-context";
import { uploadService } from "@/services/customer.service";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Dispatch, SetStateAction } from "react";
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from "react-native";

const MAX_IMAGES = 3;

export type ReviewImage = {
  id: string;
  localUri: string;
  remoteUrl: string | null;
  status: "uploading" | "done" | "error";
};

type ReviewImageUploaderProps = {
  images: ReviewImage[];
  onImagesChange: Dispatch<SetStateAction<ReviewImage[]>>;
};

export function ReviewImageUploader({ images, onImagesChange }: ReviewImageUploaderProps) {
  const { token } = useAuth();

  const startUpload = (item: ReviewImage) => {
    if (!token) return;

    uploadService
      .uploadImage(token, item.localUri)
      .then((url) => {
        onImagesChange((prev) =>
          prev.map((img) => (img.id === item.id ? { ...img, remoteUrl: url, status: "done" } : img)),
        );
      })
      .catch(() => {
        onImagesChange((prev) =>
          prev.map((img) => (img.id === item.id ? { ...img, status: "error" } : img)),
        );
      });
  };

  const pickImages = async () => {
    if (!token) {
      Alert.alert("Error", "Please sign in to attach images.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access to attach images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.8,
    });

    if (result.canceled) return;

    const newItems: ReviewImage[] = result.assets
      .slice(0, MAX_IMAGES - images.length)
      .map((asset, index) => ({
        id: `${Date.now()}-${index}-${asset.uri}`,
        localUri: asset.uri,
        remoteUrl: null,
        status: "uploading",
      }));

    onImagesChange((prev) => [...prev, ...newItems].slice(0, MAX_IMAGES));
    newItems.forEach(startUpload);
  };

  const retryUpload = (item: ReviewImage) => {
    onImagesChange((prev) =>
      prev.map((img) => (img.id === item.id ? { ...img, status: "uploading" } : img)),
    );
    startUpload(item);
  };

  const removeImage = (id: string) => {
    onImagesChange((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <View className="mb-6">
      <Text className="mb-3 text-[14px] font-bold text-[#191C1F]">
        Add real photos ({images.length}/{MAX_IMAGES})
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {images.length < MAX_IMAGES && (
          <Pressable
            onPress={pickImages}
            className="h-[80px] w-[80px] items-center justify-center rounded-[12px] border-2 border-dashed border-[#157bb8] bg-[#EBF5FF]"
          >
            <Feather name="camera" size={24} color="#157bb8" />
            <Text className="mt-1 text-[11px] font-semibold text-[#157bb8]">Upload</Text>
          </Pressable>
        )}

        {images.map((img) => (
          <View key={img.id} className="relative h-[80px] w-[80px] overflow-hidden rounded-[12px]">
            <Image source={{ uri: img.localUri }} className="h-full w-full" resizeMode="cover" />

            {img.status === "uploading" && (
              <View className="absolute inset-0 items-center justify-center bg-black/40">
                <ActivityIndicator size="small" color="white" />
              </View>
            )}

            {img.status === "error" && (
              <Pressable
                onPress={() => retryUpload(img)}
                className="absolute inset-0 items-center justify-center bg-black/50"
              >
                <Feather name="refresh-cw" size={18} color="#FCA5A5" />
                <Text className="mt-1 text-[9px] font-bold text-[#FCA5A5]">Retry</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => removeImage(img.id)}
              className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-black/60"
            >
              <Feather name="x" size={12} color="white" />
            </Pressable>
          </View>
        ))}
      </View>

      <View className="mt-3 flex-row items-start gap-2 pl-1">
        <Feather name="info" size={14} color="#6b7682" className="mt-0.5" />
        <Text className="pr-4 text-[12px] leading-[18px] text-[#6b7682]">
          Real photos help other customers decide more easily.
        </Text>
      </View>

      <View className="mt-6 flex-row items-center gap-3 rounded-[12px] bg-[#E8F5E9] p-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#10B981]">
          <Feather name="check" size={20} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-[14px] font-extrabold text-[#064E3B]">Earn 200 Coins instantly</Text>
          <Text className="mt-0.5 text-[12px] leading-[18px] text-[#064E3B]">Complete a review with images to receive a reward.</Text>
        </View>
      </View>
    </View>
  );
}
