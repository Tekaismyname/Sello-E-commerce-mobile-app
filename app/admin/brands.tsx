import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useAdminBrandsView } from "@/hooks/admin/use-admin-brands-view";
import { AdminBrand } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  slug: "",
  logoUrl: "",
  status: "active" as "active" | "inactive",
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminBrandsScreen() {
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("brands:read");
  const canCreate = hasPermission("brands:create");
  const canUpdate = hasPermission("brands:update");

  const {
    filteredBrands,
    loading,
    saving,
    error,
    search,
    setSearch,
    createBrand,
    updateBrand,
    updateBrandStatus,
  } = useAdminBrandsView(token);

  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!editing) return;
    setForm({
      name: editing.name,
      slug: editing.slug ?? "",
      logoUrl: editing.logoUrl ?? "",
      status: editing.status,
    });
    setShowForm(true);
  }, [editing]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const openCreate = () => {
    if (!canCreate) return;
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const submit = async () => {
    const name = form.name.trim();
    if (!name) {
      Alert.alert("Thieu thong tin", "Vui long nhap ten brand.");
      return;
    }

    const payload = {
      name,
      slug: form.slug.trim() || slugify(name),
      logoUrl: form.logoUrl.trim() || null,
      status: form.status,
    };

    try {
      if (editing) {
        await updateBrand(editing.id, payload);
      } else {
        await createBrand(payload);
      }
      resetForm();
    } catch (err: any) {
      Alert.alert("Loi", err?.message ?? "Khong the luu brand.");
    }
  };

  const toggleStatus = (brand: AdminBrand) => {
    if (!canUpdate) return;
    const nextStatus = brand.status === "active" ? "inactive" : "active";
    updateBrandStatus(brand.id, nextStatus).catch((err: any) => {
      Alert.alert("Loi", err?.message ?? "Khong the cap nhat trang thai brand.");
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <AdminHeader title="Quan ly Brand" />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        <View className="rounded-[16px] bg-white p-4">
          <View className="flex-row items-center gap-3 rounded-[12px] bg-[#F1F3F6] px-3 py-2">
            <Feather name="search" size={18} color="#6B7280" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Tim brand..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 py-1 text-[15px] text-[#191C1F]"
            />
          </View>

          {canCreate ? (
            <Pressable
              onPress={openCreate}
              className="mt-3 flex-row items-center justify-center gap-2 rounded-[12px] bg-[#0F7BB8] px-4 py-3"
            >
              <Feather name="plus" size={18} color="#FFFFFF" />
              <Text className="text-[15px] font-extrabold text-white">Tao brand</Text>
            </Pressable>
          ) : null}
        </View>

        {showForm ? (
          <View className="mt-4 rounded-[16px] bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-[18px] font-extrabold text-[#191C1F]">
                {editing ? "Sua brand" : "Tao brand moi"}
              </Text>
              <Pressable onPress={resetForm} className="h-9 w-9 items-center justify-center rounded-full bg-[#EEF2F7]">
                <Feather name="x" size={18} color="#4B5563" />
              </Pressable>
            </View>

            <Text className="mt-4 text-[13px] font-bold text-[#374151]">Ten brand *</Text>
            <TextInput
              value={form.name}
              onChangeText={(name) => setForm((current) => ({ ...current, name }))}
              placeholder="Vi du: Sello Basics"
              placeholderTextColor="#9CA3AF"
              className="mt-2 rounded-[12px] bg-[#F1F3F6] px-4 py-3 text-[15px] text-[#191C1F]"
            />

            <Text className="mt-4 text-[13px] font-bold text-[#374151]">Slug</Text>
            <TextInput
              value={form.slug}
              onChangeText={(slug) => setForm((current) => ({ ...current, slug }))}
              placeholder="Tu dong tao neu bo trong"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              className="mt-2 rounded-[12px] bg-[#F1F3F6] px-4 py-3 text-[15px] text-[#191C1F]"
            />

            <Text className="mt-4 text-[13px] font-bold text-[#374151]">Logo URL</Text>
            <TextInput
              value={form.logoUrl}
              onChangeText={(logoUrl) => setForm((current) => ({ ...current, logoUrl }))}
              placeholder="https://..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              className="mt-2 rounded-[12px] bg-[#F1F3F6] px-4 py-3 text-[15px] text-[#191C1F]"
            />

            {form.logoUrl.trim() ? (
              <Image source={{ uri: form.logoUrl.trim() }} className="mt-3 h-24 w-full rounded-[12px] bg-[#EEF2F7]" resizeMode="contain" />
            ) : null}

            <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-4 py-3">
              <View>
                <Text className="text-[14px] font-bold text-[#191C1F]">Trang thai</Text>
                <Text className="text-[12px] text-[#607080]">
                  {form.status === "active" ? "Dang hien thi" : "Dang an"}
                </Text>
              </View>
              <Switch
                value={form.status === "active"}
                onValueChange={(value) => setForm((current) => ({ ...current, status: value ? "active" : "inactive" }))}
              />
            </View>

            <Pressable
              onPress={submit}
              disabled={saving || (!!editing && !canUpdate)}
              className="mt-4 flex-row items-center justify-center gap-2 rounded-[12px] bg-[#0F7BB8] px-4 py-3 disabled:opacity-50"
            >
              <Feather name="save" size={18} color="#FFFFFF" />
              <Text className="text-[15px] font-extrabold text-white">{saving ? "Dang luu..." : "Luu brand"}</Text>
            </Pressable>
          </View>
        ) : null}

        {!canRead ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">
              Ban khong co quyen xem danh sach brand.
            </Text>
          </View>
        ) : loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="large" color="#2F95D2" />
          </View>
        ) : error ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">{error}</Text>
          </View>
        ) : (
          <View className="mt-4 gap-3">
            {filteredBrands.map((brand) => (
              <View key={brand.id} className="rounded-[16px] bg-white p-4">
                <View className="flex-row items-center gap-3">
                  {brand.logoUrl ? (
                    <Image source={{ uri: brand.logoUrl }} className="h-14 w-14 rounded-[12px] bg-[#EEF2F7]" resizeMode="contain" />
                  ) : (
                    <View className="h-14 w-14 items-center justify-center rounded-[12px] bg-[#EAF4FF]">
                      <Feather name="award" size={22} color="#0F6CBD" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-[17px] font-extrabold text-[#191C1F]">{brand.name}</Text>
                    <Text className="mt-1 text-[12px] text-[#607080]">{brand.slug || `brand-${brand.id}`}</Text>
                  </View>
                  <View className={`rounded-full px-3 py-1 ${brand.status === "active" ? "bg-[#DCFCE7]" : "bg-[#F1F3F6]"}`}>
                    <Text className={`text-[12px] font-bold ${brand.status === "active" ? "text-[#15803D]" : "text-[#6B7280]"}`}>
                      {brand.status === "active" ? "Active" : "Hidden"}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row justify-end gap-2 border-t border-[#EEF2F7] pt-3">
                  {canUpdate ? (
                    <>
                      <Pressable
                        onPress={() => setEditing(brand)}
                        className="flex-row items-center gap-2 rounded-[10px] bg-[#EEF2F7] px-3 py-2"
                      >
                        <Feather name="edit-2" size={15} color="#0F6CBD" />
                        <Text className="text-[13px] font-bold text-[#0F6CBD]">Sua</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => toggleStatus(brand)}
                        className="flex-row items-center gap-2 rounded-[10px] bg-[#FFF7ED] px-3 py-2"
                      >
                        <Feather name={brand.status === "active" ? "eye-off" : "eye"} size={15} color="#B45309" />
                        <Text className="text-[13px] font-bold text-[#B45309]">
                          {brand.status === "active" ? "An" : "Hien"}
                        </Text>
                      </Pressable>
                    </>
                  ) : null}
                </View>
              </View>
            ))}

            {!filteredBrands.length ? (
              <View className="items-center rounded-[14px] bg-white p-6">
                <Text className="text-[14px] text-[#6B7280]">Khong tim thay brand phu hop.</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
