import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ProductBanner,
  ProductBasicInfo,
  ProductBottomActionBar,
  ProductColorSelector,
  ProductDescription,
  ProductDetailHeader,
  ProductFeatures,
  ProductImageGallery,
  ProductReviewOverview,
  ProductSizeSelector,
  ProductSpecs,
} from "@/components/product";
import { productService } from "@/services/customer.service";
import { ProductDetail } from "@/types/customer";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rawId = Array.isArray(id) ? id[0] : id;
    const productId = Number(rawId);

    if (!productId || isNaN(productId)) {
      setError("ID sản phẩm không hợp lệ");
      setLoading(false);
      return;
    }

    productService
      .getProductDetail(productId)
      .then((res) => {
        setProduct(res.data);

        const variants = res.data.variants ?? [];
        const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
        const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];

        if (sizes.length > 0) setSelectedSize(sizes[0]!);
        if (colors.length > 0) setSelectedColor(colors[0]!);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color="#006397" />
        <Text className="mt-3 text-[14px] text-[#7d8896]">Đang tải sản phẩm...</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <ProductDetailHeader />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[16px] font-semibold text-[#BA1A1A]">
            {error || "Không tìm thấy sản phẩm"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

  const variants = product.variants ?? [];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))].map((colorName) => {
    const variant = variants.find((v) => v.color === colorName);
    return {
      name: colorName!,
      imageUrl:
        variant?.imageUrl ??
        product.primaryImageUrl ??
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80",
    };
  });

  const images =
    product.images.length > 0
      ? product.images.sort((a, b) => a.sortOrder - b.sortOrder).map((img) => img.imageUrl)
      : product.primaryImageUrl
        ? [product.primaryImageUrl]
        : ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"];

  const discountPercent =
    product.comparePrice && product.comparePrice > product.basePrice
      ? `-${Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)}%`
      : undefined;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ProductDetailHeader />

      <ScrollView className="flex-1 bg-[#F2F3F7]" showsVerticalScrollIndicator={false} bounces={false}>
        <ProductImageGallery images={images} />

        <ProductBasicInfo
          category={product.categoryName ?? "Sản phẩm"}
          title={product.name}
          price={formatPrice(product.basePrice)}
          oldPrice={product.comparePrice ? formatPrice(product.comparePrice) : undefined}
          discount={discountPercent}
          rating={product.averageRating ?? 0}
          reviewsCount={product.totalReviews ?? 0}
        />

        {colors.length > 0 && (
          <ProductColorSelector colors={colors} selectedColor={selectedColor} onSelectColor={setSelectedColor} />
        )}

        {sizes.length > 0 && (
          <ProductSizeSelector sizes={sizes} selectedSize={selectedSize} onSelectSize={setSelectedSize} />
        )}

        <View className="h-2 w-full bg-[#f3f5f8]" />

        <ProductFeatures />

        <View className="h-2 w-full bg-[#f3f5f8]" />

        <ProductSpecs />

        <View className="h-2 w-full bg-[#f3f5f8]" />

        <ProductDescription description={product.description ?? product.shortDescription ?? ""} />

        <ProductBanner />

        <View className="h-2 w-full bg-[#f3f5f8]" />

        <ProductReviewOverview productId={String(product.id)} />

        <View className="h-[80px]" />
      </ScrollView>

      <ProductBottomActionBar />
    </SafeAreaView>
  );
}
