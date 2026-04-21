import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminCategory } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminCategoriesScreen() {
  const { token, user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canCreate = permissions.includes("categories:create");
  const canUpdate = permissions.includes("categories:update");
  const canDelete = permissions.includes("categories:delete");
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!token) {
      setError("Vui long dang nhap tai khoan admin.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await adminService.listCategories(token);
      setCategories(response.data);
    } catch (nextError: any) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((item) =>
      [item.name, item.slug ?? "", String(item.id)].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [categories, query]);

  const handleDisable = (category: AdminCategory) => {
    if (!token || !canDelete) return;

    Alert.alert("An danh muc", `Ban muon an danh muc "${category.name}"?`, [
      { text: "Huy", style: "cancel" },
      {
        text: "An danh muc",
        style: "destructive",
        onPress: async () => {
          try {
            await adminService.deleteCategory(token, category.id);
            await fetchCategories();
          } catch (nextError: any) {
            Alert.alert("Loi", nextError.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FC]" edges={["top", "bottom"]}>
      <AdminHeader title="Quan ly Danh muc" />
      <ScrollView contentContainerClassName="p-4 pb-28">
        <View className="rounded-[18px] bg-white p-4 shadow-sm">
          <View className="flex-row items-center gap-3 rounded-[12px] bg-[#F3F5F8] px-3">
            <Feather name="search" size={18} color="#607080" />
            <TextInput
              className="h-12 flex-1 text-[14px] text-[#191C1F]"
              placeholder="Tim kiem danh muc..."
              placeholderTextColor="#97A0AB"
              value={query}
              onChangeText={setQuery}
            />
          </View>
          <View className="mt-3 flex-row items-center justify-center gap-2 rounded-[10px] bg-[#E9EDF2] py-3">
            <Feather name="filter" size={15} color="#0F6CBD" />
            <Text className="text-[13px] font-bold text-[#0F6CBD]">Bo loc</Text>
          </View>
        </View>

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#0F6CBD" />
          </View>
        ) : null}

        {!loading && error ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#BA1A1A]">{error}</Text>
          </View>
        ) : null}

        {!loading && !error ? (
          <View className="mt-4 gap-4">
            {filteredCategories.map((category) => (
              <View key={category.id} className="rounded-[18px] bg-white p-4 shadow-sm">
                <View className="flex-row items-start gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-[14px] bg-[#F1F7FB]">
                    <Feather name="layers" size={20} color="#0F6CBD" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-extrabold text-[#30343A]">{category.name}</Text>
                    <Text className="mt-1 text-[13px] text-[#607080]">
                      {category.productCount.toLocaleString()} san pham
                    </Text>
                    <Text className="mt-2 text-[12px] font-semibold text-[#607080]">
                      Status: {category.status}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 h-px bg-[#EEF2F6]" />

                <View className="mt-3 flex-row justify-end gap-4">
                  {canUpdate ? (
                    <Pressable
                      onPress={() =>
                        router.push(`/admin/category-form?id=${category.id}` as Href)
                      }
                      className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F7FA]"
                    >
                      <Feather name="edit-2" size={16} color="#465362" />
                    </Pressable>
                  ) : null}
                  {canDelete ? (
                    <Pressable
                      onPress={() => handleDisable(category)}
                      className="h-9 w-9 items-center justify-center rounded-full bg-[#FFF1F1]"
                    >
                      <Feather name="trash-2" size={16} color="#BA1A1A" />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {canCreate ? (
        <Pressable
          onPress={() => router.push("/admin/category-form" as Href)}
          className="absolute bottom-24 right-5 h-14 w-14 items-center justify-center rounded-full bg-[#0F84C8] shadow-lg"
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}
