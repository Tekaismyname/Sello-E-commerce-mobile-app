import { ProductBasicForm } from "@/components/admin/add-product/product-basic-form";
import { ProductDescription } from "@/components/admin/add-product/product-description";
import { ProductFeatures } from "@/components/admin/add-product/product-features";
import { ProductImagePicker } from "@/components/admin/add-product/product-image-picker";
import { ProductPriceStock } from "@/components/admin/add-product/product-price-stock";
import { ProductSpecs } from "@/components/admin/add-product/product-specs";
import { ProductVariants } from "@/components/admin/add-product/product-variants";
import { useAuth } from "@/contexts/auth-context";
import { adminService } from "@/services/admin.service";
import { AdminProductImage, AdminProductVariant } from "@/types/admin";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

const createEmptyVariant = (basePrice = 0, stockQty = 0): AdminProductVariant => ({
  skuVariant: "",
  color: "",
  size: "",
  price: basePrice,
  stockQty,
  status: "active",
});

const createDefaultImage = (): AdminProductImage => ({
  imageUrl: "",
  isPrimary: true,
  sortOrder: 0,
});

const parseFeatures = (value?: string) =>
  (value ?? "")
    .split(/\r?\n|•/g)
    .map((item) => item.trim())
    .filter(Boolean);

export default function AddProductScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const params = useLocalSearchParams<{ productId?: string }>();
  const editingProductId = useMemo(() => {
    const productId = Number(params.productId);
    return Number.isFinite(productId) && productId > 0 ? productId : null;
  }, [params.productId]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("1");
  const [basePrice, setBasePrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stockQty, setStockQty] = useState("0");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [brandId, setBrandId] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("");
  const [categories, setCategories] = useState<Array<{ id: number; name: string; status?: string }>>(
    [],
  );
  const [images, setImages] = useState<AdminProductImage[]>([createDefaultImage()]);
  const [features, setFeatures] = useState<string[]>([]);
  const [variants, setVariants] = useState<AdminProductVariant[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await adminService.getSystemConfigOptions(token);
        setCategories(response.data.categories ?? []);
      } catch (error) {
        console.warn("Khong the tai categories cho form san pham", error);
      }
    };

    fetchCategories();
  }, [token]);

  useEffect(() => {
    const hydrateProduct = async () => {
      if (!editingProductId || !token) {
        return;
      }

      try {
        setLoadingDetail(true);
        const response = await adminService.getProductDetail(token, editingProductId);
        const product = response.data;
        const detailVariants =
          product.variants?.length && product.variants.some((variant) => Number(variant.price) > 0)
            ? product.variants
            : [];
        const fallbackStock = product.stockQty ?? detailVariants[0]?.stockQty ?? 0;

        setName(product.name ?? "");
        setCategoryId(String(product.categoryId ?? 1));
        setBasePrice(product.basePrice !== undefined ? String(product.basePrice) : "");
        setComparePrice(
          product.comparePrice !== null && product.comparePrice !== undefined
            ? String(product.comparePrice)
            : "",
        );
        setStockQty(String(fallbackStock));
        setDescription(product.description ?? "");
        setSku(product.sku ?? "");
        setBrandId(
          product.brandId !== null && product.brandId !== undefined ? String(product.brandId) : "",
        );
        setWarrantyMonths(
          product.warrantyMonths !== null && product.warrantyMonths !== undefined
            ? String(product.warrantyMonths)
            : "",
        );
        setImages(
          product.images?.length
            ? product.images.map((image, index) => ({
                id: image.id,
                imageUrl: image.imageUrl ?? "",
                isPrimary: index === 0 ? true : Boolean(image.isPrimary),
                sortOrder: image.sortOrder ?? index,
              }))
            : [createDefaultImage()],
        );
        setFeatures(parseFeatures(product.shortDescription));
        setVariants(
          detailVariants.map((variant) => ({
            id: variant.id,
            skuVariant: variant.skuVariant ?? "",
            color: variant.color ?? "",
            size: variant.size ?? "",
            price: Number(variant.price ?? product.basePrice ?? 0),
            stockQty: Number(variant.stockQty ?? fallbackStock),
            weight: variant.weight ?? null,
            imageUrl: variant.imageUrl ?? "",
            status: variant.status ?? "active",
          })),
        );
      } catch (error: any) {
        Alert.alert("Khong the tai san pham", error?.message ?? "Da co loi xay ra.");
      } finally {
        setLoadingDetail(false);
      }
    };

    hydrateProduct();
  }, [editingProductId, token]);

  const handleSave = async () => {
    if (!token) {
      Alert.alert("Thong bao", "Vui long dang nhap tai khoan admin.");
      return;
    }

    const categoryIdNumber = Number(categoryId);
    const basePriceNumber = Number(basePrice);
    const comparePriceNumber =
      comparePrice.trim().length > 0 ? Number(comparePrice) : undefined;
    const stockQtyNumber = Number(stockQty || "0");
    const brandIdNumber = brandId.trim().length > 0 ? Number(brandId) : undefined;
    const warrantyMonthsNumber =
      warrantyMonths.trim().length > 0 ? Number(warrantyMonths) : undefined;

    if (!name.trim()) {
      Alert.alert("Thieu du lieu", "Vui long nhap ten san pham.");
      return;
    }

    if (!Number.isInteger(categoryIdNumber) || categoryIdNumber <= 0) {
      Alert.alert("Thieu du lieu", "Category ID phai la so nguyen duong.");
      return;
    }

    if (!Number.isFinite(basePriceNumber) || basePriceNumber <= 0) {
      Alert.alert("Thieu du lieu", "Gia ban phai lon hon 0.");
      return;
    }

    const sanitizedImages = images
      .map((image, index) => ({
        imageUrl: image.imageUrl.trim(),
        isPrimary: Boolean(image.isPrimary),
        sortOrder: index,
      }))
      .filter((image) => image.imageUrl.length > 0);

    const normalizedImages =
      sanitizedImages.length > 0 && !sanitizedImages.some((image) => image.isPrimary)
        ? sanitizedImages.map((image, index) => ({
            ...image,
            isPrimary: index === 0,
          }))
        : sanitizedImages;

    const normalizedFeatures = features.map((item) => item.trim()).filter(Boolean);
    const normalizedVariants = variants
      .map((variant) => ({
        skuVariant: variant.skuVariant?.trim() || undefined,
        color: variant.color?.trim() || undefined,
        size: variant.size?.trim() || undefined,
        price:
          variant.price !== undefined && variant.price !== null
            ? Number(variant.price)
            : basePriceNumber,
        stockQty:
          variant.stockQty !== undefined && variant.stockQty !== null
            ? Number(variant.stockQty)
            : stockQtyNumber,
        weight:
          variant.weight !== undefined && variant.weight !== null ? Number(variant.weight) : null,
        imageUrl: variant.imageUrl?.trim() || undefined,
        status: variant.status ?? "active",
      }))
      .filter((variant) => Number.isFinite(variant.price) && variant.price > 0);

    const payload = {
      categoryId: categoryIdNumber,
      brandId: brandIdNumber !== undefined && Number.isFinite(brandIdNumber) ? brandIdNumber : null,
      name: name.trim(),
      sku: sku.trim() || undefined,
      shortDescription: normalizedFeatures.length > 0 ? normalizedFeatures.join("\n") : undefined,
      description: description.trim() || undefined,
      basePrice: basePriceNumber,
      comparePrice:
        comparePriceNumber !== undefined && Number.isFinite(comparePriceNumber)
          ? comparePriceNumber
          : null,
      warrantyMonths:
        warrantyMonthsNumber !== undefined && Number.isFinite(warrantyMonthsNumber)
          ? warrantyMonthsNumber
          : undefined,
      status: "active" as const,
      images: normalizedImages,
      variants:
        normalizedVariants.length > 0
          ? normalizedVariants
          : [createEmptyVariant(basePriceNumber, stockQtyNumber)],
    };

    try {
      setSubmitting(true);

      if (editingProductId) {
        await adminService.updateProduct(token, editingProductId, payload);
      } else {
        await adminService.createProduct(token, payload);
      }

      Alert.alert(
        "Thanh cong",
        editingProductId ? "Da cap nhat san pham." : "Da tao san pham moi.",
      );
      router.back();
    } catch (error: any) {
      Alert.alert("Khong the luu", error?.message ?? "Da co loi xay ra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={["top", "bottom"]}>
      <View className="flex-row items-center border-b border-[#F2F3F7] bg-white px-4 py-3">
        <Pressable
          className="-ml-2 h-10 w-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#006397" />
        </Pressable>
        <Text className="ml-2 text-[16px] font-bold text-[#191C1F]">
          {editingProductId ? "Chinh sua san pham" : "Them san pham moi"}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="relative flex-1"
      >
        {loadingDetail ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#006397" />
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="p-4 pb-28"
          >
            <ProductImagePicker images={images} onChange={setImages} />
            <ProductBasicForm
              name={name}
              categoryId={categoryId}
              categories={categories}
              onNameChange={setName}
              onCategoryIdChange={setCategoryId}
            />
            <ProductPriceStock
              basePrice={basePrice}
              comparePrice={comparePrice}
              stockQty={stockQty}
              onBasePriceChange={(value) => setBasePrice(onlyDigits(value))}
              onComparePriceChange={(value) => setComparePrice(onlyDigits(value))}
              onStockQtyChange={(value) => setStockQty(onlyDigits(value))}
            />
            <ProductSpecs
              sku={sku}
              brandId={brandId}
              warrantyMonths={warrantyMonths}
              onSkuChange={setSku}
              onBrandIdChange={(value) => setBrandId(onlyDigits(value))}
              onWarrantyMonthsChange={(value) => setWarrantyMonths(onlyDigits(value))}
            />
            <ProductFeatures features={features} onChange={setFeatures} />
            <ProductVariants variants={variants} onChange={setVariants} />
            <ProductDescription description={description} onDescriptionChange={setDescription} />
          </ScrollView>
        )}

        <View className="absolute bottom-0 left-0 right-0 border-t border-[#F2F3F7] bg-white p-4">
          <Pressable
            className="h-12 w-full flex-row items-center justify-center gap-2 rounded-[12px] bg-[#006397] shadow-sm disabled:opacity-60"
            onPress={handleSave}
            disabled={submitting || loadingDetail}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Feather name="save" size={18} color="white" />
            )}
            <Text className="text-[16px] font-bold text-white">
              {editingProductId ? "Luu cap nhat" : "Luu san pham"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
