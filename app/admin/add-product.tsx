import { ProductBasicForm } from "@/components/admin/add-product/product-basic-form";
import { ProductDescription } from "@/components/admin/add-product/product-description";
import { ProductFeatures } from "@/components/admin/add-product/product-features";
import { ProductImagePicker } from "@/components/admin/add-product/product-image-picker";
import { ProductPriceStock } from "@/components/admin/add-product/product-price-stock";
import { ProductSpecs } from "@/components/admin/add-product/product-specs";
import { ProductVariants } from "@/components/admin/add-product/product-variants";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const onlyDigits = (value: string) => value.replace(/[^0-9]/g, "");

export default function AddProductScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("1");
  const [basePrice, setBasePrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stockQty, setStockQty] = useState("0");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!token) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập tài khoản admin.");
      return;
    }

    const categoryIdNumber = Number(categoryId);
    const basePriceNumber = Number(basePrice);
    const comparePriceNumber = comparePrice ? Number(comparePrice) : undefined;
    const stockQtyNumber = Number(stockQty || "0");

    if (!name.trim()) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!Number.isInteger(categoryIdNumber) || categoryIdNumber <= 0) {
      Alert.alert("Thiếu dữ liệu", "Category ID phải là số nguyên dương.");
      return;
    }

    if (!Number.isFinite(basePriceNumber) || basePriceNumber <= 0) {
      Alert.alert("Thiếu dữ liệu", "Giá bán phải lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(stockQtyNumber) || stockQtyNumber < 0) {
      Alert.alert("Thiếu dữ liệu", "Số lượng kho không hợp lệ.");
      return;
    }

    try {
      setSubmitting(true);

      await adminService.createProduct(token, {
        categoryId: categoryIdNumber,
        name: name.trim(),
        basePrice: basePriceNumber,
        comparePrice:
          comparePriceNumber !== undefined && Number.isFinite(comparePriceNumber)
            ? comparePriceNumber
            : undefined,
        description: description.trim() || undefined,
        status: "active",
        variants: [
          {
            price: basePriceNumber,
            stockQty: stockQtyNumber,
            status: "active",
          },
        ],
      });

      Alert.alert("Thành công", "Đã lưu sản phẩm.");
      router.back();
    } catch (error: any) {
      Alert.alert("Không thể lưu", error?.message ?? "Đã có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <View className="flex-row items-center border-b border-[#F2F3F7] bg-white px-4 py-3">
        <Pressable className="-ml-2 h-10 w-10 items-center justify-center" onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#006397" />
        </Pressable>
        <Text className="ml-2 text-[16px] font-bold text-[#191C1F]">Thêm sản phẩm mới</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="relative flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="p-4 pb-28"
        >
          <ProductImagePicker />
          <ProductBasicForm
            name={name}
            categoryId={categoryId}
            onNameChange={setName}
            onCategoryIdChange={(value) => setCategoryId(onlyDigits(value))}
          />
          <ProductPriceStock
            basePrice={basePrice}
            comparePrice={comparePrice}
            stockQty={stockQty}
            onBasePriceChange={(value) => setBasePrice(onlyDigits(value))}
            onComparePriceChange={(value) => setComparePrice(onlyDigits(value))}
            onStockQtyChange={(value) => setStockQty(onlyDigits(value))}
          />
          <ProductSpecs />
          <ProductFeatures />
          <ProductVariants />
          <ProductDescription description={description} onDescriptionChange={setDescription} />
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 border-t border-[#F2F3F7] bg-white p-4">
          <Pressable
            className="h-12 w-full flex-row items-center justify-center gap-2 rounded-[12px] bg-[#006397] shadow-sm disabled:opacity-60"
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Feather name="save" size={18} color="white" />
            )}
            <Text className="text-[16px] font-bold text-white">Lưu sản phẩm</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
