import { AdminCategory } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

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

export function AdminCategoryForm({ initialValue, categories, loading, onSubmit }: Props) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [slug, setSlug] = useState(initialValue?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [parentId, setParentId] = useState<number | null>(initialValue?.parentId ?? null);
  const [parentSearch, setParentSearch] = useState(initialValue?.parentName ?? "");
  const [showParentOptions, setShowParentOptions] = useState(false);
  const [active, setActive] = useState((initialValue?.status ?? "active") === "active");

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

  const previewImage = imageUrl.trim() || fallbackImage;

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
      <View className="rounded-[16px] bg-white p-4">
        <Text className="text-[14px] font-bold text-[#111827]">Category Cover Image</Text>
        <View className="mt-2 overflow-hidden rounded-[14px] bg-[#EEF2F6]">
          <Image source={{ uri: previewImage }} className="h-[150px] w-full" resizeMode="cover" />
        </View>

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Category Name</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 text-[14px]" value={name} onChangeText={setName} placeholder="VD: Thoi trang" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Slug</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 text-[14px]" value={slug} onChangeText={setSlug} placeholder="thoi-trang" />

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
              placeholder="Tim danh muc cha..."
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
              <Text className="text-[14px] font-semibold text-[#111827]">Khong co danh muc cha</Text>
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

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Cover Image URL</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 text-[14px]" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Mo ta</Text>
        <TextInput className="mt-2 min-h-[96px] rounded-[12px] bg-[#F3F5FA] px-3 py-3 text-[14px]" multiline value={description} onChangeText={setDescription} placeholder="Mo ta phong cach danh muc..." />

        <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-3 py-3">
          <View className="flex-1 pr-4">
            <Text className="text-[14px] font-semibold text-[#111827]">Active Status</Text>
            <Text className="mt-1 text-[12px] text-[#6B7280]">Hidden categories won't appear in the store.</Text>
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
