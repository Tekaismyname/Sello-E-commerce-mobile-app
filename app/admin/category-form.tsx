import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminCategory } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminCategoryFormScreen() {
  const { id } = useLocalSearchParams();
  const editingId = Number(Array.isArray(id) ? id[0] : id);
  const isEditing = Number.isFinite(editingId) && editingId > 0;
  const { token, user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canSave = permissions.includes(isEditing ? "categories:update" : "categories:create");
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [parentId, setParentId] = useState("");
  const [parentName, setParentName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingParent, setCreatingParent] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await adminService.listCategories(token);
      setCategories(response.data);
      const current = response.data.find((item) => item.id === editingId);
      if (current) {
        setName(current.name);
        setImageUrl(current.imageUrl ?? "");
        setParentId(current.parentId ? String(current.parentId) : "");
        setDescription(current.description ?? "");
        setActive(current.status === "active");
      }
    } catch (nextError: any) {
      Alert.alert("Loi", nextError.message);
    } finally {
      setLoading(false);
    }
  }, [editingId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const parentOptions = useMemo(
    () => categories.filter((item) => item.id !== editingId && item.status === "active"),
    [categories, editingId],
  );

  const handleSave = async () => {
    if (!token || !canSave) return;
    if (!name.trim()) {
      Alert.alert("Thieu thong tin", "Vui long nhap ten danh muc.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        imageUrl: imageUrl.trim() || null,
        parentId: parentId ? Number(parentId) : null,
        description: description.trim() || null,
        status: active ? ("active" as const) : ("inactive" as const),
      };
      if (isEditing) {
        await adminService.updateCategory(token, editingId, payload);
      } else {
        await adminService.createCategory(token, payload);
      }
      Alert.alert("Thanh cong", "Da luu danh muc.", [
        { text: "OK", onPress: () => router.replace("/admin/categories" as Href) },
      ]);
    } catch (nextError: any) {
      Alert.alert("Loi", nextError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateParent = async () => {
    if (!token || !permissions.includes("categories:create")) return;
    if (!parentName.trim()) {
      Alert.alert("Thieu thong tin", "Vui long nhap ten danh muc cha.");
      return;
    }

    setCreatingParent(true);
    try {
      const response = await adminService.createCategory(token, {
        name: parentName.trim(),
        imageUrl: null,
        parentId: null,
        description: null,
        status: "active",
      });
      setCategories((current) => [response.data, ...current.filter((item) => item.id !== response.data.id)]);
      setParentId(String(response.data.id));
      setParentName("");
      Alert.alert("Thanh cong", "Da tao va chon danh muc cha.");
    } catch (nextError: any) {
      Alert.alert("Loi", nextError.message);
    } finally {
      setCreatingParent(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <View className="flex-row items-center justify-between bg-white px-4 py-3">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
          <Feather name="arrow-left" size={20} color="#0F6CBD" />
        </Pressable>
        <Text className="text-[18px] font-extrabold text-[#0F6CBD]">
          {isEditing ? "Sua Danh muc" : "Them Danh muc"}
        </Text>
        <View className="h-10 w-10" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0F6CBD" />
        </View>
      ) : (
        <ScrollView contentContainerClassName="p-5 pb-28">
          <View className="rounded-[18px] bg-white p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[14px] font-bold text-[#30343A]">Anh bia Danh muc</Text>
              <Text className="text-[12px] text-[#607080]">Khuyen nghi: 120x80px</Text>
            </View>
            <View className="items-center rounded-[14px] bg-[#F3F5F8] p-5">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
                <Feather name="image" size={22} color="#0F6CBD" />
              </View>
              <Text className="mt-3 text-[14px] font-extrabold text-[#0F6CBD]">Nhap URL anh ben duoi</Text>
              <TextInput
                className="mt-4 h-12 w-full rounded-[12px] bg-white px-4 text-[14px] text-[#191C1F]"
                placeholder="https://..."
                placeholderTextColor="#97A0AB"
                value={imageUrl}
                onChangeText={setImageUrl}
              />
            </View>
          </View>

          <View className="mt-4 rounded-[18px] bg-white p-4">
            <Text className="text-[13px] font-bold text-[#30343A]">Ten Danh muc</Text>
            <TextInput
              className="mt-2 h-12 rounded-[12px] bg-[#F3F5F8] px-4 text-[14px] text-[#191C1F]"
              placeholder="Vi du: Bo suu tap he 2024"
              placeholderTextColor="#A3AAB3"
              value={name}
              onChangeText={setName}
            />

            <Text className="mt-4 text-[13px] font-bold text-[#30343A]">Danh muc Cha</Text>
            <View className="mt-2 rounded-[14px] bg-[#F7FAFD] p-3">
              <Text className="text-[12px] font-bold text-[#607080]">Tao nhanh danh muc cha</Text>
              <View className="mt-2 flex-row gap-2">
                <TextInput
                  className="h-11 flex-1 rounded-[10px] bg-white px-3 text-[14px] text-[#191C1F]"
                  placeholder="VD: Thoi trang"
                  placeholderTextColor="#A3AAB3"
                  value={parentName}
                  onChangeText={setParentName}
                  autoCorrect={false}
                  textContentType="none"
                />
                <Pressable
                  disabled={creatingParent || !permissions.includes("categories:create")}
                  onPress={handleCreateParent}
                  className="items-center justify-center rounded-[10px] bg-[#0F84C8] px-4 disabled:opacity-50"
                >
                  <Text className="text-[12px] font-bold text-white">{creatingParent ? "Dang tao" : "Tao"}</Text>
                </Pressable>
              </View>
            </View>
            <View className="mt-2 gap-2">
              <Pressable
                onPress={() => setParentId("")}
                className={`rounded-[12px] px-4 py-3 ${!parentId ? "bg-[#EAF4FF]" : "bg-[#F3F5F8]"}`}
              >
                <Text className="text-[13px] font-semibold text-[#30343A]">Khong co danh muc cha</Text>
              </Pressable>
              {parentOptions.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setParentId(String(category.id))}
                  className={`rounded-[12px] px-4 py-3 ${
                    parentId === String(category.id) ? "bg-[#EAF4FF]" : "bg-[#F3F5F8]"
                  }`}
                >
                  <Text className="text-[13px] font-semibold text-[#30343A]">{category.name}</Text>
                </Pressable>
              ))}
            </View>

            <Text className="mt-4 text-[13px] font-bold text-[#30343A]">Mo ta</Text>
            <TextInput
              className="mt-2 min-h-[110px] rounded-[12px] bg-[#F3F5F8] px-4 py-3 text-[14px] text-[#191C1F]"
              placeholder="Mo ta phong cach va loai san pham trong danh muc nay..."
              placeholderTextColor="#A3AAB3"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View className="mt-4 flex-row items-center justify-between rounded-[18px] bg-white p-4">
            <View className="flex-1">
              <Text className="text-[14px] font-bold text-[#30343A]">Trang thai hoat dong</Text>
              <Text className="mt-1 text-[12px] text-[#607080]">Danh muc an se khong xuat hien trong cua hang.</Text>
            </View>
            <Switch value={active} onValueChange={setActive} trackColor={{ true: "#0F84C8" }} />
          </View>
        </ScrollView>
      )}

      <View className="absolute bottom-0 left-0 right-0 bg-white px-5 pb-8 pt-4">
        <Pressable
          disabled={!canSave || saving}
          onPress={handleSave}
          className={`items-center justify-center rounded-[14px] py-4 ${canSave ? "bg-[#0F84C8]" : "bg-[#CBD7E1]"}`}
        >
          <Text className="text-[15px] font-extrabold text-white">{saving ? "Dang luu..." : "Luu Danh muc"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
