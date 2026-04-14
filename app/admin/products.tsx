import { AdminProductList } from "@/components/admin/products/admin-product-list";
import { AdminSearchFilter } from "@/components/admin/products/admin-search-filter";
import { AdminStockSummary } from "@/components/admin/products/admin-stock-summary";
import { AdminFab } from "@/components/admin/shared/admin-fab";
import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminProductsData } from "@/types/admin";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminProductsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<AdminProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui lòng đăng nhập tài khoản admin.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.getProductsData(token);
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts]),
  );

  const handleAddProduct = () => {
    router.push("/admin/add-product");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader title="Sản phẩm" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="relative flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="p-4 pb-24">
          <AdminSearchFilter searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />

          {loading && (
            <View className="mt-10 flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#006397" />
            </View>
          )}

          {!loading && error && (
            <View className="rounded-[12px] bg-white p-4">
              <Text className="text-[14px] font-medium text-[#b3261e]">{error}</Text>
            </View>
          )}

          {!loading && !error && data && (
            <>
              <AdminStockSummary />
              <AdminProductList products={data.products} totalCount={data.totalCount} />
            </>
          )}
        </ScrollView>
        <AdminFab onPress={handleAddProduct} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
