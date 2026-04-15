import { AdminFab } from "@/components/admin/shared/admin-fab";
import { AdminHeader } from "@/components/admin/shared/admin-header";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminProduct, AdminProductsData } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRODUCT_STATUS_OPTIONS = [
  "all",
  "active",
  "draft",
  "out_of_stock",
  "inactive",
] as const;

type ProductStatusFilter = (typeof PRODUCT_STATUS_OPTIONS)[number];

export default function AdminProductsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("all");
  const [data, setData] = useState<AdminProductsData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Vui long dang nhap tai khoan admin.");
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

  const filteredProducts = useMemo(() => {
    const products = data?.products ?? [];
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        String(product.id).toLowerCase().includes(normalizedQuery) ||
        (product.sku ?? "").toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" || (product.status ?? "active") === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [data?.products, searchQuery, statusFilter]);

  const lowStockCount = useMemo(
    () => filteredProducts.filter((product) => Number(product.stockQty ?? product.stock) <= 5).length,
    [filteredProducts],
  );

  const handleAddProduct = () => {
    router.push("/admin/add-product");
  };

  const handleEditProduct = (product: AdminProduct) => {
    const params = new URLSearchParams({
      productId: String(product.productId ?? product.id),
      name: product.name,
      categoryId: String(product.categoryId ?? 1),
      basePrice: String(product.basePrice ?? 0),
      comparePrice: String(product.comparePrice ?? ""),
      stockQty: String(product.stockQty ?? product.stock ?? 0),
      description: product.description ?? "",
    });

    router.push(`/admin/add-product?${params.toString()}`);
  };

  const handleUpdateStatus = async (
    product: AdminProduct,
    nextStatus: "draft" | "active" | "out_of_stock" | "inactive",
  ) => {
    if (!token || !product.productId) {
      Alert.alert("Khong the cap nhat", "Thieu product id hop le.");
      return;
    }

    try {
      setUpdating(true);
      await adminService.updateProductStatus(token, product.productId, nextStatus);
      await fetchProducts();
      setSelectedProduct((current) =>
        current ? { ...current, status: nextStatus } : current,
      );
    } catch (err: any) {
      Alert.alert("Loi", err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <AdminHeader title="San pham" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="relative flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="p-4 pb-24"
        >
          <Text className="text-[22px] font-extrabold text-[#191C1F]">Quan ly san pham</Text>
          <Text className="mt-1 text-[14px] leading-[22px] text-[#5b6470]">
            Tim kiem, loc theo trang thai, xem nhanh va dieu chinh thong tin/trang thai san pham.
          </Text>

          <View className="mt-4 rounded-[16px] bg-white p-4 shadow-sm">
            <View className="h-12 flex-row items-center rounded-[12px] bg-[#F4F6F8] px-4">
              <Feather name="search" size={18} color="#6b7682" />
              <TextInput
                className="ml-3 flex-1 text-[14px] text-[#191C1F]"
                placeholder="Tim theo ten, SKU, danh muc..."
                placeholderTextColor="#97a0aa"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Text className="mt-4 text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
              Trang thai
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
              {PRODUCT_STATUS_OPTIONS.map((status) => {
                const isSelected = statusFilter === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => setStatusFilter(status)}
                    className={`mr-2 rounded-full px-4 py-2 ${
                      isSelected ? "bg-[#006397]" : "bg-[#E8EDF2]"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-bold ${
                        isSelected ? "text-white" : "text-[#44515F]"
                      }`}
                    >
                      {status.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {loading && (
            <View className="mt-10 flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#006397" />
            </View>
          )}

          {!loading && error && (
            <View className="mt-4 rounded-[12px] bg-white p-4">
              <Text className="text-[14px] font-medium text-[#b3261e]">{error}</Text>
            </View>
          )}

          {!loading && !error && (
            <>
              <View className="mt-4 flex-row gap-3">
                <View className="flex-1 rounded-[16px] bg-white p-4">
                  <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                    Tong san pham
                  </Text>
                  <Text className="mt-2 text-[22px] font-extrabold text-[#191C1F]">
                    {data?.totalCount ?? 0}
                  </Text>
                </View>
                <View className="flex-1 rounded-[16px] bg-white p-4">
                  <Text className="text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                    Ton kho thap
                  </Text>
                  <Text className="mt-2 text-[22px] font-extrabold text-[#C66400]">
                    {lowStockCount}
                  </Text>
                </View>
              </View>

              <View className="mt-4 gap-3">
                {filteredProducts.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => setSelectedProduct(product)}
                    className="rounded-[14px] bg-white p-4"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-4">
                        <Text className="text-[15px] font-bold text-[#191C1F]">{product.name}</Text>
                        <Text className="mt-1 text-[12px] text-[#5b6470]">
                          {product.category} - SKU: {product.sku ?? product.id}
                        </Text>
                      </View>
                      <View className="rounded-full bg-[#EEF5FA] px-3 py-1">
                        <Text className="text-[11px] font-bold text-[#006397]">
                          {product.status ?? "active"}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-3 flex-row items-center justify-between">
                      <Text className="text-[12px] text-[#5b6470]">
                        Gia: {new Intl.NumberFormat("vi-VN").format(product.basePrice ?? 0)} d
                      </Text>
                      <Text className="text-[12px] font-bold text-[#191C1F]">
                        Kho: {product.stockQty ?? product.stock}
                      </Text>
                    </View>
                  </Pressable>
                ))}

                {filteredProducts.length === 0 && (
                  <View className="items-center rounded-[14px] bg-white p-6">
                    <Text className="text-[14px] text-[#5b6470]">
                      Khong co san pham phu hop voi bo loc hien tai.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
        <AdminFab onPress={handleAddProduct} />
      </KeyboardAvoidingView>

      <Modal visible={!!selectedProduct} animationType="slide" transparent onRequestClose={() => setSelectedProduct(null)}>
        <View className="flex-1 justify-end bg-black/30">
          <View className="max-h-[86%] rounded-t-[24px] bg-white px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[18px] font-extrabold text-[#191C1F]">Chi tiet san pham</Text>
              <Pressable onPress={() => setSelectedProduct(null)} className="h-10 w-10 items-center justify-center">
                <Feather name="x" size={20} color="#1a232d" />
              </Pressable>
            </View>

            {selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="rounded-[16px] bg-[#F8F9FB] p-4">
                  <Text className="text-[17px] font-bold text-[#191C1F]">{selectedProduct.name}</Text>
                  <Text className="mt-1 text-[13px] text-[#5b6470]">{selectedProduct.category}</Text>
                  <View className="mt-4 gap-2">
                    <Text className="text-[13px] text-[#3f4850]">
                      Product ID: <Text className="font-bold">{selectedProduct.productId ?? selectedProduct.id}</Text>
                    </Text>
                    <Text className="text-[13px] text-[#3f4850]">
                      Gia co ban:{" "}
                      <Text className="font-bold">
                        {new Intl.NumberFormat("vi-VN").format(selectedProduct.basePrice ?? 0)} d
                      </Text>
                    </Text>
                    <Text className="text-[13px] text-[#3f4850]">
                      Ton kho: <Text className="font-bold">{selectedProduct.stockQty ?? selectedProduct.stock}</Text>
                    </Text>
                    <Text className="text-[13px] text-[#3f4850]">
                      Trang thai: <Text className="font-bold">{selectedProduct.status ?? "active"}</Text>
                    </Text>
                  </View>
                </View>

                <View className="mt-5 flex-row gap-3">
                  <Pressable
                    onPress={() => handleEditProduct(selectedProduct)}
                    className="flex-1 items-center justify-center rounded-[12px] bg-[#006397] py-3"
                  >
                    <Text className="text-[13px] font-bold text-white">Sua thong tin</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      handleUpdateStatus(
                        selectedProduct,
                        selectedProduct.status === "inactive" ? "active" : "inactive",
                      )
                    }
                    disabled={updating}
                    className="flex-1 items-center justify-center rounded-[12px] border border-[#D5DCE5] py-3"
                  >
                    <Text className="text-[13px] font-bold text-[#344252]">
                      {selectedProduct.status === "inactive" ? "Mo khoa" : "Tam khoa"}
                    </Text>
                  </Pressable>
                </View>

                <Text className="mt-5 text-[12px] font-bold uppercase tracking-[0.6px] text-[#6b7682]">
                  Chuyen trang thai
                </Text>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {PRODUCT_STATUS_OPTIONS.filter((status) => status !== "all").map((status) => {
                    const typedStatus = status as Exclude<ProductStatusFilter, "all">;
                    const isActive = selectedProduct.status === typedStatus;
                    return (
                      <Pressable
                        key={typedStatus}
                        disabled={updating || isActive}
                        onPress={() => handleUpdateStatus(selectedProduct, typedStatus)}
                        className={`rounded-full px-4 py-2 ${
                          isActive ? "bg-[#006397]" : "bg-[#E8EDF2]"
                        }`}
                      >
                        <Text
                          className={`text-[12px] font-bold ${
                            isActive ? "text-white" : "text-[#44515F]"
                          }`}
                        >
                          {typedStatus}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
