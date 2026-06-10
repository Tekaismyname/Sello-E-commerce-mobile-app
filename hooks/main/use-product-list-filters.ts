import { useEffect, useMemo, useState } from "react";
import type { FilterChipItem } from "@/components/product/list/filter-chip-group";
import { ProductCard } from "@/types/main";
import { mainService } from "@/services/main.service";

export type PriceFilterValue = "all" | "lt500" | "500to1000" | "1000to2000" | "gt2000";
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

const getPriceLabel = (value: PriceFilterValue) => {
  if (value === "lt500") return "Price: < 500k";
  if (value === "500to1000") return "Price: 500k-1M";
  if (value === "1000to2000") return "Price: 1M-2M";
  if (value === "gt2000") return "Price: > 2M";
  return "Price";
};

const getRatingLabel = (value: RatingFilterValue) => {
  if (value === "4up") return "Rating: 4★+";
  if (value === "45up") return "Rating: 4.5★+";
  return "Rating";
};

export function useProductListFilters(searchKeyword: string, initialCategoryId?: number) {
  const [openChipId, setOpenChipId] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceFilterValue>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilterValue>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  
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

      let queryCategoryId: number | undefined = initialCategoryId;
      let querySearch: string | undefined = searchKeyword;

      if (!queryCategoryId && metadata && searchKeyword) {
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
      setError(err.message ?? "Unable to load the product list.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reload products when filters/keywords change
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [initialCategoryId, searchKeyword, priceFilter, ratingFilter, brandFilter, metadata]);

  const brandOptions = useMemo(() => {
    if (!metadata) return [{ label: "All", value: "all" }];
    return [
      { label: "All", value: "all" },
      ...metadata.brands.map((b) => ({ label: b.name, value: String(b.id) })),
    ];
  }, [metadata]);

  const chips = useMemo<FilterChipItem[]>(() => {
    let brandName = "Brand";
    if (brandFilter !== "all" && metadata) {
      const found = metadata.brands.find((b) => String(b.id) === brandFilter);
      if (found) {
        brandName = `Brand: ${found.name}`;
      }
    }
    return [
      { id: "price", label: getPriceLabel(priceFilter), active: priceFilter !== "all" },
      { id: "rating", label: getRatingLabel(ratingFilter), active: ratingFilter !== "all" },
      { id: "brand", label: brandName, active: brandFilter !== "all" },
    ];
  }, [brandFilter, priceFilter, ratingFilter, metadata]);

  const dropdownOptions = useMemo<DropdownOption[]>(() => {
    if (openChipId === "price") {
      return [
        { label: "All", value: "all" },
        { label: "Under 500,000d", value: "lt500" },
        { label: "500,000d - 1,000,000d", value: "500to1000" },
        { label: "1,000,000d - 2,000,000d", value: "1000to2000" },
        { label: "Over 2,000,000d", value: "gt2000" },
      ];
    }

    if (openChipId === "rating") {
      return [
        { label: "All", value: "all" },
        { label: "4★ and up", value: "4up" },
        { label: "4.5★ and up", value: "45up" },
      ];
    }

    if (openChipId === "brand") {
      return brandOptions;
    }

    return [];
  }, [brandOptions, openChipId]);

  const applyDropdownOption = (value: string) => {
    if (openChipId === "price") setPriceFilter(value as PriceFilterValue);
    if (openChipId === "rating") setRatingFilter(value as RatingFilterValue);
    if (openChipId === "brand") setBrandFilter(value);
    setOpenChipId(null);
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
  };
}
