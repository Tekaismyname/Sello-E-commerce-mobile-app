import { AdminCategoryForm } from "@/components/admin/categories/admin-category-form";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/auth/use-permissions";
import { useAdminCategoriesView } from "@/hooks/admin/use-admin-categories-view";
import { Feather } from "@expo/vector-icons";
import { Href, useRouter, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminCategoryFormScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { hasPermission } = usePermissions();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const { categories, loading, saving, createCategory, updateCategory } = useAdminCategoriesView(token);

  const editingId = Number(categoryId);
  const initialValue = Number.isFinite(editingId) ? categories.find((item) => item.id === editingId) ?? null : null;
  const canCreate = hasPermission("categories:create");
  const canUpdate = hasPermission("categories:update");
  const canSubmit = initialValue ? canUpdate : canCreate;

  const handleBack = () => {
    router.replace("/admin/categories" as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F5FA]" edges={["top", "bottom"]}>
      <View className="h-[56px] flex-row items-center bg-white px-4">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={handleBack}>
          <Feather name="arrow-left" size={20} color="#0369A1" />
        </Pressable>
        <Text className="ml-2 text-[18px] font-extrabold text-[#0F4C6B]">{initialValue ? "Edit Category" : "Add Category"}</Text>
      </View>
      {!canSubmit ? (
        <View className="px-4 pt-3">
          <Text className="text-[12px] text-[#9A6400]">You do not have permission to save categories.</Text>
        </View>
      ) : null}

      <AdminCategoryForm
        initialValue={initialValue}
        categories={categories}
        loading={saving || loading || !canSubmit}
        onSubmit={async (payload) => {
          if (!canSubmit) {
            Alert.alert("No Permission", "You do not have permission to save categories.");
            return;
          }
          try {
            if (initialValue) {
              await updateCategory(initialValue.id, payload);
            } else {
              await createCategory(payload);
            }
            Alert.alert("Success", "Category saved.");
            router.replace("/admin/categories" as Href);
          } catch (error: any) {
            Alert.alert("Error", error?.message ?? "Cannot save category.");
          }
        }}
      />
    </SafeAreaView>
  );
}
