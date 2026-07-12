import { useEffect, useMemo, useState } from "react";
import type { FilterChipItem } from "@/components/product/list/filter-chip-group";
import { ProductCard } from "@/types/main";
import { mainService } from "@/services/main.service";
import { useSettings } from "@/contexts/settings-context";

export type PriceFilterValue = "all" | "lt500" | "500to1000" | "1000to2000" | "gt2000" | "custom";

export type CustomPriceRange = { min: number | null; max: number | null };

// Compact VND label: 300000 -> "300k", 1500000 -> "1.5M".
const formatPriceShort = (value: number) => {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  return `${Math.round(value / 1000)}k`;
};
export type RatingFilterValue = "all" | "4up" | "45up";

export type DropdownOption = {
  label: string;
  value: string;
};

const PAGE_SIZE = 8;

const syntheticRating = (product: ProductCard) => {
  if (typeof product.ratingValue === "number") {
    return product.ratingValue;
  }

  const numericId = Number(product.id.replace(/[^0-9]/g, ""));
  const seed = Number.isFinite(numericId) && numericId > 0 ? numericId : product.title.length;
  return 3.5 + (seed % 16) / 10;
};

const getPriceLabel = (
  value: PriceFilterValue,
  customRange: CustomPriceRange | null,
  t: (key: string, def?: string) => string,
) => {
  if (value === "lt500") return t("price_lt500", "Price: < 500k");
  if (value === "500to1000") return t("price_500to1000", "Price: 500k-1M");
  if (value === "1000to2000") return t("price_1000to2000", "Price: 1M-2M");
  if (value === "gt2000") return t("price_gt2000", "Price: > 2M");
  if (value === "custom" && customRange) {
    const prefix = t("price_filter", "Price");
    if (customRange.min != null && customRange.max != null) {
      return `${prefix}: ${formatPriceShort(customRange.min)}-${formatPriceShort(customRange.max)}`;
    }
    if (customRange.min != null) {
      return `${prefix}: > ${formatPriceShort(customRange.min)}`;
    }
    if (customRange.max != null) {
      return `${prefix}: < ${formatPriceShort(customRange.max)}`;
    }
  }
  return t("price_filter", "Price");
};

const getRatingLabel = (value: RatingFilterValue, t: (key: string, def?: string) => string) => {
  if (value === "4up") return t("rating_4up", "Rating: from 4★");
  if (value === "45up") return t("rating_45up", "Rating: from 4.5★");
  return t("rating_filter", "Rating");
};

export function useProductListFilters(searchKeyword: string, categoryIdString?: string) {
  const { t } = useSettings();
  const [openChipId, setOpenChipId] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceFilterValue>("all");
  const [customPriceRange, setCustomPriceRange] = useState<CustomPriceRange | null>(null);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<RatingFilterValue>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>(categoryIdString ?? "all");
  
  const [metadata, setMetadata] = useState<{ categories: any[]; brands: any[] } | null>(null);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories and brands metadata for filters
  useEffect(() => {
    mainService.getFilterMetadata()
      .then(setMetadata)
      .catch(() => {});
  }, []);

  // Fetch helper
  const fetchProducts = async (currentPage: number, isLoadMore: boolean) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let queryCategoryId: number | undefined;
      let querySearch: string | undefined = searchKeyword;

      if (categoryFilter !== "all") {
        queryCategoryId = Number(categoryFilter);
        querySearch = undefined;
      } else if (categoryIdString) {
        queryCategoryId = Number(categoryIdString);
        querySearch = undefined;
      } else if (metadata && searchKeyword) {
        const matchedCat = metadata.categories.find(
          (c) => c.name.trim().toLowerCase() === searchKeyword.toLowerCase()
        );
        if (matchedCat) {
          queryCategoryId = matchedCat.id;
          querySearch = undefined;
        }
      }

      let minPrice: number | undefined;
      let maxPrice: number | undefined;
      if (priceFilter === "lt500") {
        maxPrice = 500000;
      } else if (priceFilter === "500to1000") {
        minPrice = 500000;
        maxPrice = 1000000;
      } else if (priceFilter === "1000to2000") {
        minPrice = 1000000;
        maxPrice = 2000000;
      } else if (priceFilter === "gt2000") {
        minPrice = 2000000;
      } else if (priceFilter === "custom" && customPriceRange) {
        minPrice = customPriceRange.min ?? undefined;
        maxPrice = customPriceRange.max ?? undefined;
      }

      const queryBrandId = brandFilter !== "all" ? Number(brandFilter) : undefined;

      const response = await mainService.getProducts({
        search: querySearch,
        categoryId: queryCategoryId,
        brandId: queryBrandId,
        minPrice,
        maxPrice,
        page: currentPage,
        limit: PAGE_SIZE,
      });

      let fetchedItems: ProductCard[] = [];
      let totalPages = 1;

      const rawData = response.data;
      if (rawData && typeof rawData === "object" && "items" in rawData && Array.isArray(rawData.items)) {
        fetchedItems = rawData.items;
        if (rawData.meta) {
          totalPages = Number(rawData.meta.totalPages || 1);
        }
      } else if (Array.isArray(rawData)) {
        fetchedItems = rawData;
      }

      // Apply rating in memory
      let filteredItems = fetchedItems;
      if (ratingFilter !== "all") {
        filteredItems = fetchedItems.filter((product) => {
          const rating = syntheticRating(product);
          return (
            (ratingFilter === "4up" && rating >= 4) ||
            (ratingFilter === "45up" && rating >= 4.5)
          );
        });
      }

      if (isLoadMore) {
        setProducts((prev) => [...prev, ...filteredItems]);
      } else {
        setProducts(filteredItems);
      }

      setHasMore(currentPage < totalPages);
    } catch (err: any) {
      setError(err.message ?? t("error_loading_products", "Cannot load products list."));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reload products when filters/keywords change
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [searchKeyword, categoryIdString, priceFilter, customPriceRange, ratingFilter, brandFilter, categoryFilter, metadata]);

  const brandOptions = useMemo(() => {
    if (!metadata) return [{ label: t("all", "All"), value: "all" }];
    return [
      { label: t("all", "All"), value: "all" },
      ...metadata.brands.map((b) => ({ label: b.name, value: String(b.id) })),
    ];
  }, [metadata, t]);

  const categoryOptions = useMemo(() => {
    if (!metadata) return [{ label: t("all", "All"), value: "all" }];
    return [
      { label: t("all", "All"), value: "all" },
      ...metadata.categories.map((c) => ({ label: c.name, value: String(c.id) })),
    ];
  }, [metadata, t]);

  const chips = useMemo<FilterChipItem[]>(() => {
    let brandName = t("brand_filter", "Brand");
    if (brandFilter !== "all" && metadata) {
      const found = metadata.brands.find((b) => String(b.id) === brandFilter);
      if (found) {
        brandName = `${t("brand_filter", "Brand")}: ${found.name}`;
      }
    }
    let categoryName = t("category_filter", "Category");
    if (categoryFilter !== "all" && metadata) {
      const foundCat = metadata.categories.find((c) => String(c.id) === categoryFilter);
      if (foundCat) {
        categoryName = `${t("category_filter", "Category")}: ${foundCat.name}`;
      }
    }
    return [
      { id: "category", label: categoryName, active: categoryFilter !== "all" },
      { id: "price", label: getPriceLabel(priceFilter, customPriceRange, t), active: priceFilter !== "all" },
      { id: "rating", label: getRatingLabel(ratingFilter, t), active: ratingFilter !== "all" },
      { id: "brand", label: brandName, active: brandFilter !== "all" },
    ];
  }, [brandFilter, categoryFilter, priceFilter, customPriceRange, ratingFilter, metadata, t]);

  const dropdownOptions = useMemo<DropdownOption[]>(() => {
    if (openChipId === "price") {
      return [
        { label: t("all", "All"), value: "all" },
        { label: t("price_option_lt500", "Under 500k"), value: "lt500" },
        { label: t("price_option_500to1000", "500k - 1M"), value: "500to1000" },
        { label: t("price_option_1000to2000", "1M - 2M"), value: "1000to2000" },
        { label: t("price_option_gt2000", "Over 2M"), value: "gt2000" },
        { label: t("price_option_custom", "Custom range..."), value: "custom" },
      ];
    }

    if (openChipId === "rating") {
      return [
        { label: t("all", "All"), value: "all" },
        { label: t("rating_option_4up", "From 4★"), value: "4up" },
        { label: t("rating_option_45up", "From 4.5★"), value: "45up" },
      ];
    }

    if (openChipId === "brand") {
      return brandOptions;
    }

    if (openChipId === "category") {
      return categoryOptions;
    }

    return [];
  }, [brandOptions, categoryOptions, openChipId, t]);

  const applyDropdownOption = (value: string) => {
    if (openChipId === "price") {
      if (value === "custom") {
        // Open the min-max input modal instead of applying immediately.
        setPriceModalVisible(true);
      } else {
        setCustomPriceRange(null);
        setPriceFilter(value as PriceFilterValue);
      }
    }
    if (openChipId === "rating") setRatingFilter(value as RatingFilterValue);
    if (openChipId === "brand") setBrandFilter(value);
    if (openChipId === "category") setCategoryFilter(value);
    setOpenChipId(null);
  };

  const applyCustomPriceRange = (min: number | null, max: number | null) => {
    setCustomPriceRange({ min, max });
    setPriceFilter("custom");
    setPriceModalVisible(false);
  };

  const closePriceModal = () => {
    setPriceModalVisible(false);
  };

  const handleOpenChip = (chipId: string) => {
    setOpenChipId((prev) => (prev === chipId ? null : chipId));
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  return {
    chips,
    dropdownOptions,
    openChipId,
    filteredProducts: products, // exposes current accumulated products
    visibleProducts: products,  // mapped items are directly displayed
    hasMore,
    loadingMore,
    applyDropdownOption,
    handleOpenChip,
    handleLoadMore,
    loading,
    error,
    priceModalVisible,
    customPriceRange,
    applyCustomPriceRange,
    closePriceModal,
  };
}

