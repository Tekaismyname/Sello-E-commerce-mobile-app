import { AdminCategoryCard } from "@/components/admin/categories/admin-category-card";
import { AdminCategoryToolbar } from "@/components/admin/categories/admin-category-toolbar";
import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAdminCategoriesView } from "@/hooks/admin/use-admin-categories-view";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useAuth } from "@/contexts/auth-context";
import { AdminCategory } from "@/types/admin";
import { Href, router } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminCategoriesScreen() {
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const canRead = hasPermission("categories:read");
  const canCreate = hasPermission("categories:create");
  const canUpdate = hasPermission("categories:update");
  const canDelete = hasPermission("categories:delete");
  const canHide = canDelete || canUpdate;

  const {
    filteredCategories,
    loading,
    saving,
    error,
    search,
    setSearch,
    updateCategoryStatus,
    deleteCategory,
  } = useAdminCategoriesView(token);

  const openCreate = () => {
    if (!canCreate) return;
    router.push("/admin/category-form" as Href);
  };

  const openEdit = (item: AdminCategory) => {
    if (!canUpdate) return;
    router.push((`/admin/category-form?categoryId=${item.id}` as unknown) as Href);
  };

  const hideCategory = (category: AdminCategory) => {
    Alert.alert("An danh muc", `An danh muc ${category.name}?`, [
      { text: "Huy", style: "cancel" },
      {
        text: "An",
        style: "destructive",
        onPress: () => {
          const action = canDelete
            ? deleteCategory(category.id)
            : updateCategoryStatus(category.id, "inactive");

          action.catch((err: any) => {
            Alert.alert("Loi", err?.message ?? "Khong the an danh muc.");
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <AdminHeader title="Quan ly Danh muc" />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
        <AdminCategoryToolbar value={search} onChange={setSearch} onOpenCreate={openCreate} canCreate={canCreate} />
        {!canCreate ? (
          <Text className="mt-2 text-[12px] text-[#9A6400]">Ban khong co quyen tao danh muc.</Text>
        ) : null}

        {!canRead ? (
          <View className="mt-4 rounded-[14px] bg-white p-4">
            <Text className="text-[14px] font-semibold text-[#B91C1C]">
              Ban khong co quyen xem danh sach danh muc.
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
          <View className="mt-3 gap-3">
            {filteredCategories.map((item) => (
              <AdminCategoryCard
                key={item.id}
                category={item}
                onEdit={canUpdate ? openEdit : undefined}
                onToggleStatus={canUpdate ? (category) => {
                  updateCategoryStatus(category.id, category.status === "active" ? "inactive" : "active").catch((err: any) => {
                    Alert.alert("Loi", err?.message ?? "Khong the cap nhat trang thai.");
                  });
                } : undefined}
                onDelete={canHide ? hideCategory : undefined}
              />
            ))}

            {!filteredCategories.length && (
              <View className="items-center rounded-[14px] bg-white p-6">
                <Text className="text-[14px] text-[#6B7280]">Khong tim thay danh muc phu hop.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {saving ? (
        <View className="absolute bottom-5 right-5 rounded-full bg-[#111827] px-4 py-2">
          <Text className="text-[12px] font-semibold text-white">Dang cap nhat...</Text>
        </View>
      ) : null}

      {canCreate ? (
        <Pressable
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-[#2F95D2]"
          onPress={openCreate}
        >
          <Text className="text-[24px] font-bold text-white">+</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}
