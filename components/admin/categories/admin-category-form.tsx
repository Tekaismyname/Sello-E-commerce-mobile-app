import { AdminCategory } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Switch, Text, TextInput, View, ActivityIndicator, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE_URL } from "@/constants/api";

type Props = {
  initialValue?: AdminCategory | null;
  categories: AdminCategory[];
  loading?: boolean;
  onSubmit: (payload: {
    name: string;
    slug?: string;
    imageUrl?: string | null;
    parentId?: number | null;
    description?: string | null;
    status?: "active" | "inactive";
  }) => Promise<void>;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80";

const PRESET_ICONS = [
  { label: "Fashion", url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80" },
  { label: "Clothing", url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80" },
  { label: "Shoes", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" },
  { label: "Accessories", url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80" },
  { label: "Phones", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80" },
  { label: "Laptops", url: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=600&q=80" },
  { label: "Watches", url: "https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?auto=format&fit=crop&w=600&q=80" },
  { label: "Books", url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80" },
  { label: "Home", url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=80" },
  { label: "Headphones", url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80" },
];

export function AdminCategoryForm({ initialValue, categories, loading, onSubmit }: Props) {
  const { token } = useAuth();
  const [name, setName] = useState(initialValue?.name ?? "");
  const [slug, setSlug] = useState(initialValue?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [parentId, setParentId] = useState<number | null>(initialValue?.parentId ?? null);
  const [parentSearch, setParentSearch] = useState(initialValue?.parentName ?? "");
  const [showParentOptions, setShowParentOptions] = useState(false);
  const [active, setActive] = useState((initialValue?.status ?? "active") === "active");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
    })();
  }, []);

  useEffect(() => {
    setName(initialValue?.name ?? "");
    setSlug(initialValue?.slug ?? "");
    setImageUrl(initialValue?.imageUrl ?? "");
    setDescription(initialValue?.description ?? "");
    setParentId(initialValue?.parentId ?? null);
    setParentSearch(initialValue?.parentName ?? "");
    setActive((initialValue?.status ?? "active") === "active");
  }, [initialValue]);

  const parentOptions = useMemo(() => {
    const keyword = parentSearch.trim().toLowerCase();
    return categories
      .filter((item) => item.id !== initialValue?.id)
      .filter((item) => !keyword || item.name.toLowerCase().includes(keyword) || String(item.id).includes(keyword))
      .slice(0, 8);
  }, [categories, initialValue?.id, parentSearch]);

  const uploadImageFile = async (fileUri: string): Promise<string> => {
    const formData = new FormData();
    let filename = fileUri.split("/").pop() || "upload.jpg";
    if (!filename.includes(".")) {
      filename = `${filename}.jpg`;
    }
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
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${errorText || res.statusText}`);
    }

    const json = await res.json();
    return `${API_BASE_URL}${json.url}`;
  };

  const pickImage = async () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.4,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setUploading(true);

      try {
        const publicUrl = await uploadImageFile(asset.uri);
        setImageUrl(publicUrl);
      } catch (err: any) {
        alert(err.message || "Cannot upload image.");
      } finally {
        setUploading(false);
      }
    }
  };

  const previewImage = imageUrl.trim() || fallbackImage;

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
      <View className="rounded-[16px] bg-white p-4">
        <Text className="text-[14px] font-bold text-[#111827]">Category Cover Image</Text>
        <View className="mt-2 overflow-hidden rounded-[14px] bg-[#EEF2F6]">
          <Image source={{ uri: previewImage }} className="h-[150px] w-full" resizeMode="cover" />
        </View>

        <Text className="mt-4 text-[13px] font-semibold text-[#4B5563]">Quickly select preset cover image:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 py-1 mt-2">
          {PRESET_ICONS.map((preset, index) => (
            <Pressable
              key={index}
              onPress={() => setImageUrl(preset.url)}
              className="items-center mr-2"
            >
              <Image 
                source={{ uri: preset.url }} 
                className="h-12 w-12 rounded-full border border-gray-200"
                style={{ borderWidth: imageUrl === preset.url ? 2.5 : 1, borderColor: imageUrl === preset.url ? "#2F95D2" : "#E5E7EB" }}
              />
              <Text className="mt-1 text-[10px] text-gray-500">{preset.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Category Name</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 text-[14px]" value={name} onChangeText={setName} placeholder="E.g: Fashion" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Slug</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 text-[14px]" value={slug} onChangeText={setSlug} placeholder="fashion" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Parent Category</Text>
        <View className="mt-2 rounded-[12px] bg-[#F3F5FA]">
          <View className="h-12 flex-row items-center px-3">
            <Feather name="search" size={16} color="#6B7280" />
            <TextInput
              className="ml-2 flex-1 text-[14px] text-[#111827]"
              value={parentSearch}
              onChangeText={(value) => {
                setParentSearch(value);
                setParentId(null);
                setShowParentOptions(true);
              }}
              onFocus={() => setShowParentOptions(true)}
              placeholder="Search parent category..."
              placeholderTextColor="#9CA3AF"
            />
            {parentId ? (
              <Pressable
                onPress={() => {
                  setParentId(null);
                  setParentSearch("");
                  setShowParentOptions(false);
                }}
              >
                <Feather name="x" size={16} color="#6B7280" />
              </Pressable>
            ) : null}
          </View>
        </View>

        {showParentOptions ? (
          <View className="mt-2 rounded-[12px] border border-[#E5E7EB] bg-white">
            <Pressable
              className="flex-row items-center justify-between px-3 py-3"
              onPress={() => {
                setParentId(null);
                setParentSearch("");
                setShowParentOptions(false);
              }}
            >
              <Text className="text-[14px] font-semibold text-[#111827]">No parent category</Text>
              {!parentId ? <Feather name="check" size={16} color="#0369A1" /> : null}
            </Pressable>
            {parentOptions.map((item) => (
              <Pressable
                key={item.id}
                className="flex-row items-center justify-between border-t border-[#F3F4F6] px-3 py-3"
                onPress={() => {
                  setParentId(item.id);
                  setParentSearch(item.name);
                  setShowParentOptions(false);
                }}
              >
                <View>
                  <Text className="text-[14px] font-semibold text-[#111827]">{item.name}</Text>
                  <Text className="text-[12px] text-[#6B7280]">ID: {item.id}</Text>
                </View>
                {parentId === item.id ? <Feather name="check" size={16} color="#0369A1" /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Cover Image</Text>
        {uploading ? (
          <View className="mt-2 h-12 items-center justify-center rounded-[12px] bg-[#F3F5FA] border border-dashed border-[#2F95D2]">
            <ActivityIndicator size="small" color="#2F95D2" />
          </View>
        ) : (
          <Pressable
            onPress={pickImage}
            className="mt-2 h-12 flex-row items-center justify-center gap-2 rounded-[12px] bg-[#F3F5FA] active:bg-[#E5E7EB] border border-dashed border-gray-300"
          >
            <Feather name="image" size={16} color="#4B5563" />
            <Text className="text-[13px] font-bold text-[#4B5563]">
              {imageUrl ? "Change image from device" : "Upload image from device"}
            </Text>
          </Pressable>
        )}

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Description</Text>
        <TextInput className="mt-2 min-h-[96px] rounded-[12px] bg-[#F3F5FA] px-3 py-3 text-[14px]" multiline value={description} onChangeText={setDescription} placeholder="Category style description..." />

        <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-3 py-3">
          <View className="flex-1 pr-4">
            <Text className="text-[14px] font-semibold text-[#111827]">Active Status</Text>
            <Text className="mt-1 text-[12px] text-[#6B7280]">Hidden categories won{"'"}t appear in the store.</Text>
          </View>
          <Switch value={active} onValueChange={setActive} />
        </View>
      </View>

      <Pressable
        disabled={loading || !name.trim()}
        className="mt-4 h-12 items-center justify-center rounded-[12px] bg-[#2F95D2] disabled:opacity-60"
        onPress={async () => {
          await onSubmit({
            name: name.trim(),
            slug: slug.trim() || undefined,
            imageUrl: imageUrl.trim() || null,
            parentId,
            description: description.trim() || null,
            status: active ? "active" : "inactive",
          });
        }}
      >
        <Text className="text-[15px] font-bold text-white">Save Category</Text>
      </Pressable>
    </ScrollView>
  );
}
