import { AdminCategory } from "@/types/admin";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

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

export function AdminCategoryForm({ initialValue, categories, loading, onSubmit }: Props) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [slug, setSlug] = useState(initialValue?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [parentId, setParentId] = useState(initialValue?.parentId ? String(initialValue.parentId) : "");
  const [active, setActive] = useState((initialValue?.status ?? "active") === "active");

  useEffect(() => {
    setName(initialValue?.name ?? "");
    setSlug(initialValue?.slug ?? "");
    setImageUrl(initialValue?.imageUrl ?? "");
    setDescription(initialValue?.description ?? "");
    setParentId(initialValue?.parentId ? String(initialValue.parentId) : "");
    setActive((initialValue?.status ?? "active") === "active");
  }, [initialValue]);

  const parentOptions = useMemo(() => categories.filter((item) => item.id !== initialValue?.id), [categories, initialValue?.id]);

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
      <View className="rounded-[16px] bg-white p-4">
        <Text className="text-[14px] font-bold text-[#111827]">Tên danh mục</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 text-[14px]" value={name} onChangeText={setName} placeholder="VD: Thời trang" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Slug</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 text-[14px]" value={slug} onChangeText={setSlug} placeholder="thoi-trang" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Danh mục cha (ID)</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 text-[14px]" value={parentId} onChangeText={(v) => setParentId(v.replace(/[^0-9]/g, ""))} keyboardType="numeric" placeholder="Bỏ trống nếu là cấp gốc" />
        {!!parentOptions.length && (
          <Text className="mt-1 text-[12px] text-[#6B7280]">Gợi ý: {parentOptions.slice(0, 5).map((item) => `${item.id}-${item.name}`).join(" | ")}</Text>
        )}

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Ảnh bìa URL</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 text-[14px]" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Mô tả</Text>
        <TextInput className="mt-2 min-h-[96px] rounded-[12px] bg-[#F3F5FA] px-3 py-3 text-[14px]" multiline value={description} onChangeText={setDescription} placeholder="Mô tả phong cách danh mục..." />

        <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-3 py-3">
          <Text className="text-[14px] font-semibold text-[#111827]">Trạng thái hoạt động</Text>
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
            parentId: parentId ? Number(parentId) : null,
            description: description.trim() || null,
            status: active ? "active" : "inactive",
          });
        }}
      >
        <Text className="text-[15px] font-bold text-white">Lưu danh mục</Text>
      </Pressable>
    </ScrollView>
  );
}
