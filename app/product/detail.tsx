import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
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
  ProductQuantitySelector,
  ProductReviewOverview,
  ProductSizeSelector,
  ProductSpecs,
} from "@/components/product";
import { useAuth } from "@/contexts/auth-context";
import {
  addressService,
  cartService,
  checkoutService,
  productService,
} from "@/services/customer.service";
import { ProductDetail } from "@/types/customer";

const COD_PAYMENT_METHOD_ID = 1;

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  useEffect(() => {
    const rawId = Array.isArray(id) ? id[0] : id;
    const productId = Number(rawId);

    if (!productId || Number.isNaN(productId)) {
      setError("ID san pham khong hop le");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    productService
      .getProductDetail(productId)
      .then((res) => {
        const nextProduct = res.data;
        const activeVariants = (nextProduct.variants ?? []).filter((variant) => variant.status === "active");
        const firstVariant = activeVariants[0];

        setProduct(nextProduct);
        setSelectedSize(firstVariant?.size ?? "");
        setSelectedColor(firstVariant?.color ?? "");
        setQuantity(1);
      })
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, [id]);

  const activeVariants = useMemo(
    () => (product?.variants ?? []).filter((variant) => variant.status === "active"),
    [product],
  );

  const selectedVariant = useMemo(() => {
    if (!activeVariants.length) {
      return null;
    }

    return (
      activeVariants.find(
        (variant) =>
          (selectedColor ? variant.color === selectedColor : true) &&
          (selectedSize ? variant.size === selectedSize : true),
      ) ?? activeVariants[0]
    );
  }, [activeVariants, selectedColor, selectedSize]);

  const sizes = useMemo(
    () =>
      [...new Set(activeVariants.map((variant) => variant.size).filter(Boolean))] as string[],
    [activeVariants],
  );

  const colors = useMemo(
    () =>
      [...new Set(activeVariants.map((variant) => variant.color).filter(Boolean))].map((colorName) => {
        const variant = activeVariants.find((item) => item.color === colorName);
        return {
          name: colorName!,
          imageUrl:
            variant?.imageUrl ??
            product?.primaryImageUrl ??
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80",
        };
      }),
    [activeVariants, product?.primaryImageUrl],
  );

  const images = useMemo(() => {
    if (!product) {
      return [];
    }

    const galleryImages =
      product.images.length > 0
        ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder).map((image) => image.imageUrl)
        : product.primaryImageUrl
          ? [product.primaryImageUrl]
          : ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"];

    if (selectedVariant?.imageUrl && !galleryImages.includes(selectedVariant.imageUrl)) {
      return [selectedVariant.imageUrl, ...galleryImages];
    }

    return galleryImages;
  }, [product, selectedVariant?.imageUrl]);

  const displayPrice = selectedVariant?.price ?? product?.basePrice ?? 0;
  const comparePrice = product?.comparePrice ?? null;
  const discountPercent =
    comparePrice && comparePrice > displayPrice
      ? `-${Math.round(((comparePrice - displayPrice) / comparePrice) * 100)}%`
      : undefined;

  const stockQty = selectedVariant?.stockQty ?? undefined;
  const isOutOfStock = activeVariants.length > 0 ? (selectedVariant?.stockQty ?? 0) < 1 : false;

  const requireLogin = () => {
    if (token) {
      return true;
    }

    Alert.alert("Can dang nhap", "Ban can dang nhap de them gio hang va dat hang.", [
      { text: "De sau", style: "cancel" },
      {
        text: "Dang nhap",
        onPress: () => router.push("/auth/login" as Href),
      },
    ]);

    return false;
  };

  const getSelectedPayload = () => {
    if (!product) {
      throw new Error("Khong tim thay san pham");
    }

    if (activeVariants.length > 0 && !selectedVariant) {
      throw new Error("Vui long chon dung phan loai san pham");
    }

    if (isOutOfStock) {
      throw new Error("Phan loai dang chon da het hang");
    }

    if (stockQty && quantity > stockQty) {
      throw new Error(`So luong vuot qua ton kho hien tai (${stockQty})`);
    }

    return {
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      quantity,
    };
  };

  const getCheckoutAddressId = async () => {
    if (!token) {
      throw new Error("Phien dang nhap da het han");
    }

    const response = await addressService.listAddresses(token);
    const address = response.data.find((item) => item.isDefault) ?? response.data[0];

    if (!address) {
      throw new Error("Chua co dia chi mac dinh. Hay tao dia chi truoc khi dat hang.");
    }

    return address.id;
  };

  const handleSelectColor = (nextColor: string) => {
    setSelectedColor(nextColor);

    const matchedVariant =
      activeVariants.find((variant) => variant.color === nextColor && variant.size === selectedSize) ??
      activeVariants.find((variant) => variant.color === nextColor);

    if (matchedVariant?.size) {
      setSelectedSize(matchedVariant.size);
    }

    setQuantity(1);
  };

  const handleSelectSize = (nextSize: string) => {
    setSelectedSize(nextSize);

    const matchedVariant =
      activeVariants.find((variant) => variant.size === nextSize && variant.color === selectedColor) ??
      activeVariants.find((variant) => variant.size === nextSize);

    if (matchedVariant?.color) {
      setSelectedColor(matchedVariant.color);
    }

    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!requireLogin()) {
      return;
    }

    setAddToCartLoading(true);

    try {
      const payload = getSelectedPayload();
      await cartService.addCartItem(token, payload);
      Alert.alert("Them vao gio thanh cong", "San pham da duoc dua vao gio hang.");
    } catch (nextError: any) {
      Alert.alert("Khong the them gio", nextError.message ?? "Da co loi xay ra.");
    } finally {
      setAddToCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!requireLogin()) {
      return;
    }

    setBuyNowLoading(true);

    try {
      const payload = getSelectedPayload();
      const currentCart = await cartService.getCart(token);

      for (const item of currentCart.data.items.filter((cartItem) => cartItem.selected)) {
        await cartService.selectCartItem(token, item.id, { selected: false });
      }

      await cartService.addCartItem(token, payload);

      const addressId = await getCheckoutAddressId();
      const orderResponse = await checkoutService.createOrder(token, {
        addressId,
        paymentMethodId: COD_PAYMENT_METHOD_ID,
      });

      Alert.alert("Dat hang thanh cong", `Don ${orderResponse.data.orderCode} da duoc tao.`, [
        {
          text: "Xem don hang",
          onPress: () =>
            router.push(`/order/${orderResponse.data.orderId}` as Href),
        },
        {
          text: "Ve danh sach",
          onPress: () => router.push("/main/orders" as Href),
        },
      ]);
    } catch (nextError: any) {
      Alert.alert("Khong the mua ngay", nextError.message ?? "Da co loi xay ra.");
    } finally {
      setBuyNowLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={["top", "bottom"]}>
        <ActivityIndicator size="large" color="#006397" />
        <Text className="mt-3 text-[14px] text-[#7d8896]">Dang tai san pham...</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <ProductDetailHeader />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[16px] font-semibold text-[#BA1A1A]">
            {error || "Khong tim thay san pham"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stockText = isOutOfStock
    ? "Phan loai dang chon da het hang"
    : stockQty
      ? `Ton kho kha dung: ${stockQty}`
      : "San pham san sang dat hang";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ProductDetailHeader />

      <ScrollView className="flex-1 bg-[#F2F3F7]" showsVerticalScrollIndicator={false} bounces={false}>
        <ProductImageGallery images={images} />

        <ProductBasicInfo
          category={product.categoryName ?? "San pham"}
          title={product.name}
          price={formatPrice(displayPrice)}
          oldPrice={comparePrice ? formatPrice(comparePrice) : undefined}
          discount={discountPercent}
          rating={product.averageRating ?? 0}
          reviewsCount={product.totalReviews ?? 0}
        />

        {colors.length > 0 ? (
          <ProductColorSelector
            colors={colors}
            selectedColor={selectedColor}
            onSelectColor={handleSelectColor}
          />
        ) : null}

        {sizes.length > 0 ? (
          <ProductSizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSelectSize={handleSelectSize}
          />
        ) : null}

        <ProductQuantitySelector
          quantity={quantity}
          maxQuantity={stockQty}
          onChange={setQuantity}
        />

        <View className="h-2 w-full bg-[#f3f5f8]" />

        <ProductFeatures />

        <View className="h-2 w-full bg-[#f3f5f8]" />

        <ProductSpecs />

        <View className="h-2 w-full bg-[#f3f5f8]" />

        <ProductDescription description={product.description ?? product.shortDescription ?? ""} />

        <ProductBanner />

        <View className="h-2 w-full bg-[#f3f5f8]" />

        <ProductReviewOverview productId={String(product.id)} />

        <View className="h-[96px]" />
      </ScrollView>

      <ProductBottomActionBar
        stockText={stockText}
        disabled={isOutOfStock}
        addToCartLoading={addToCartLoading}
        buyNowLoading={buyNowLoading}
        onOpenCart={() => router.push("/main/cart" as Href)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </SafeAreaView>
  );
}
