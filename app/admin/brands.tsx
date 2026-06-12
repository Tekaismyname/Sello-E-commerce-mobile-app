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
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "@/constants/api";
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
    })();
  }, []);

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

  const pickImage = async () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setUploading(true);

      try {
        const publicUrl = await uploadImageFile(asset.uri);
        setForm((current) => ({
          ...current,
          logoUrl: publicUrl,
        }));
      } catch (err: any) {
        alert(err.message || "Cannot upload logo.");
      } finally {
        setUploading(false);
      }
    }
  };

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
      Alert.alert(
        "Missing Info",
        "Please enter brand name."
      );
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
      Alert.alert(
        "Error",
        err?.message ?? "Cannot save brand."
      );
    }
  };

  const toggleStatus = (brand: AdminBrand) => {
    if (!canUpdate) return;

    const nextStatus =
      brand.status === "active" ? "inactive" : "active";

    updateBrandStatus(brand.id, nextStatus).catch((err: any) => {
      Alert.alert(
        "Error",
        err?.message ??
          "Cannot update brand status."
      );
    });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F3F5FA]"
      edges={["top", "bottom"]}
    >
      <AdminHeader title="Manage Brands" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-24"
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[16px] bg-white p-4">
          <View className="flex-row items-center gap-3 rounded-[12px] bg-[#F1F3F6] px-3 py-2">
            <Feather
              name="search"
              size={18}
              color="#6B7280"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search brands..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 py-1 text-[15px] text-[#191C1F]"
            />
          </View>

          {canCreate ? (
            <Pressable
              onPress={openCreate}
              className="mt-3 flex-row items-center justify-center gap-2 rounded-[12px] bg-[#0F7BB8] px-4 py-3"
            >
              <Feather
                name="plus"
                size={18}
                color="#FFFFFF"
              />

              <Text className="text-[15px] font-extrabold text-white">
                Create Brand
              </Text>
            </Pressable>
          ) : null}
        </View>

        {showForm ? (
          <View className="mt-4 rounded-[16px] bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-[18px] font-extrabold text-[#191C1F]">
                {editing
                  ? "Edit Brand"
                  : "Create New Brand"}
              </Text>

              <Pressable
                onPress={resetForm}
                className="h-9 w-9 items-center justify-center rounded-full bg-[#EEF2F7]"
              >
                <Feather
                  name="x"
                  size={18}
                  color="#4B5563"
                />
              </Pressable>
            </View>

            <Text className="mt-4 text-[13px] font-bold text-[#374151]">Brand Name *</Text>

            <TextInput
              value={form.name}
              onChangeText={(name) =>
                setForm((current) => ({
                  ...current,
                  name,
                }))
              }
              placeholder="Example: Sello Basics"
              placeholderTextColor="#9CA3AF"
              className="mt-2 rounded-[12px] bg-[#F1F3F6] px-4 py-3 text-[15px] text-[#191C1F]"
            />

            <Text className="mt-4 text-[13px] font-bold text-[#374151]">
              Slug
            </Text>

            <TextInput
              value={form.slug}
              onChangeText={(slug) =>
                setForm((current) => ({
                  ...current,
                  slug,
                }))
              }
              placeholder="Auto generated if blank"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              className="mt-2 rounded-[12px] bg-[#F1F3F6] px-4 py-3 text-[15px] text-[#191C1F]"
            />

            <Text className="mt-4 text-[13px] font-bold text-[#374151]">
              Brand Logo
            </Text>
 
            {uploading ? (
              <View className="mt-2 h-12 items-center justify-center rounded-[12px] bg-[#F1F3F6] border border-dashed border-[#0F7BB8]">
                <ActivityIndicator size="small" color="#0F7BB8" />
              </View>
            ) : (
              <Pressable
                onPress={pickImage}
                className="mt-2 h-12 flex-row items-center justify-center gap-2 rounded-[12px] bg-[#F1F3F6] active:bg-[#E5E7EB] border border-dashed border-gray-300"
              >
                <Feather name="image" size={16} color="#4B5563" />
                <Text className="text-[13px] font-bold text-[#4B5563]">
                  {form.logoUrl ? "Change logo from device" : "Choose logo from device"}
                </Text>
              </Pressable>
            )}
 
            {form.logoUrl.trim() ? (
              <View className="relative mt-3 h-24 w-full rounded-[12px] border border-[#E7EEF5] bg-[#EEF2F7] overflow-hidden items-center justify-center">
                <Image
                  source={{ uri: form.logoUrl.trim() }}
                  className="h-20 w-20"
                  resizeMode="contain"
                />
                <Pressable
                  onPress={() => setForm((current) => ({ ...current, logoUrl: "" }))}
                  className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1.5"
                >
                  <Feather name="trash-2" size={12} color="white" />
                </Pressable>
              </View>
            ) : null}

            <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-4 py-3">
              <View>
                <Text className="text-[14px] font-bold text-[#191C1F]">
                  Status
                </Text>

                <Text className="text-[12px] text-[#607080]">
                  {form.status === "active"
                    ? "Showing"
                    : "Hidden"}
                </Text>
              </View>

              <Switch
                value={form.status === "active"}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    status: value
                      ? "active"
                      : "inactive",
                  }))
                }
              />
            </View>

            <Pressable
              onPress={submit}
              disabled={
                saving ||
                (!!editing && !canUpdate)
              }
              className="mt-4 flex-row items-center justify-center gap-2 rounded-[12px] bg-[#0F7BB8] px-4 py-3 disabled:opacity-50"
            >
              <Feather
                name="save"
                size={18}
                color="#FFFFFF"
              />

              <Text className="text-[15px] font-extrabold text-white">
                {saving
                  ? "Saving..."
                  : "Save Brand"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!canRead ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">You do not have permission to view brands.</Text>
          </View>
        ) : loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator
              size="large"
              color="#2F95D2"
            />
          </View>
        ) : error ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">
              {error}
            </Text>
          </View>
        ) : (
          <View className="mt-4 gap-3">
            {filteredBrands.map((brand) => (
              <View
                key={brand.id}
                className="rounded-[16px] bg-white p-4"
              >
                <View className="flex-row items-center gap-3">
                  {brand.logoUrl ? (
                    <Image
                      source={{ uri: brand.logoUrl }}
                      className="h-14 w-14 rounded-[12px] bg-[#EEF2F7]"
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="h-14 w-14 items-center justify-center rounded-[12px] bg-[#EAF4FF]">
                      <Feather
                        name="award"
                        size={22}
                        color="#0F6CBD"
                      />
                    </View>
                  )}

                  <View className="flex-1">
                    <Text className="text-[17px] font-extrabold text-[#191C1F]">
                      {brand.name}
                    </Text>

                    <Text className="mt-1 text-[12px] text-[#607080]">
                      {brand.slug ||
                        `brand-${brand.id}`}
                    </Text>
                  </View>

                  <View
                    className={`rounded-full px-3 py-1 ${
                      brand.status === "active"
                        ? "bg-[#DCFCE7]"
                        : "bg-[#F1F3F6]"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-bold ${
                        brand.status === "active"
                          ? "text-[#15803D]"
                          : "text-[#6B7280]"
                      }`}
                    >
                      {brand.status === "active"
                        ? "Showing"
                        : "Hidden"}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row justify-end gap-2 border-t border-[#EEF2F7] pt-3">
                  {canUpdate ? (
                    <>
                      <Pressable
                        onPress={() =>
                          setEditing(brand)
                        }
                        className="flex-row items-center gap-2 rounded-[10px] bg-[#EEF2F7] px-3 py-2"
                      >
                        <Feather
                          name="edit-2"
                          size={15}
                          color="#0F6CBD"
                        />

                        <Text className="text-[13px] font-bold text-[#0F6CBD]">Edit</Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          toggleStatus(brand)
                        }
                        className="flex-row items-center gap-2 rounded-[10px] bg-[#FFF7ED] px-3 py-2"
                      >
                        <Feather
                          name={
                            brand.status === "active"
                              ? "eye-off"
                              : "eye"
                          }
                          size={15}
                          color="#B45309"
                        />

                        <Text className="text-[13px] font-bold text-[#B45309]">
                          {brand.status === "active"
                            ? "Hidden"
                            : "Visible"}
                        </Text>
                      </Pressable>
                    </>
                  ) : null}
                </View>
              </View>
            ))}

            {!filteredBrands.length ? (
              <View className="items-center rounded-[14px] bg-white p-6">
                <Text className="text-[14px] text-[#6B7280]">No matching brand found.</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}