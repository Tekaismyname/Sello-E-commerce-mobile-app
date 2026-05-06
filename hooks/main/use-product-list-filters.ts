import { useEffect, useMemo, useState } from "react";
import type { FilterChipItem } from "@/components/product/list/filter-chip-group";
import { ProductCard, ProductListData } from "@/types/main";
import { normalizeSearchText } from "@/utils/search-text";

export type PriceFilterValue = "all" | "lt500" | "500to1000" | "1000to2000" | "gt2000";
export type RatingFilterValue = "all" | "4up" | "45up";

export type DropdownOption = {
  label: string;
  value: string;
};

const PAGE_SIZE = 8;

const parsePriceNumber = (product: ProductCard) => {
  if (typeof product.priceValue === "number") {
    return product.priceValue;
  }

  const digits = product.price.replace(/[^0-9]/g, "");
  return Number(digits || "0");
};

const syntheticRating = (product: ProductCard) => {
  if (typeof product.ratingValue === "number") {
    return product.ratingValue;
  }

  const numericId = Number(product.id.replace(/[^0-9]/g, ""));
  const seed = Number.isFinite(numericId) && numericId > 0 ? numericId : product.title.length;
  return 3.5 + (seed % 16) / 10;
};

const getPriceLabel = (value: PriceFilterValue) => {
  if (value === "lt500") return "Giá: < 500k";
  if (value === "500to1000") return "Giá: 500k-1tr";
  if (value === "1000to2000") return "Giá: 1tr-2tr";
  if (value === "gt2000") return "Giá: > 2tr";
  return "Giá";
};

const getRatingLabel = (value: RatingFilterValue) => {
  if (value === "4up") return "Đánh giá: từ 4★";
  if (value === "45up") return "Đánh giá: từ 4.5★";
  return "Đánh giá";
};

const getKeywordAliases = (keyword: string) => {
  const normalized = normalizeSearchText(keyword);
  if (!normalized) return [] as string[];

  const aliases = new Set<string>([normalized]);

  if (normalized.includes("giay")) {
    ["giay", "shoe", "sneaker", "dep", "footwear"].forEach((value) => aliases.add(value));
  }

  if (normalized.includes("quan")) {
    ["quan", "pant", "pants", "jean", "trouser"].forEach((value) => aliases.add(value));
  }

  if (normalized.includes("ao")) {
    ["ao", "shirt", "tee", "t-shirt", "top"].forEach((value) => aliases.add(value));
  }

  if (normalized.includes("phu kien") || normalized.includes("phukien")) {
    ["phu kien", "accessory", "accessories"].forEach((value) => aliases.add(value));
  }

  return Array.from(aliases);
};

export function useProductListFilters(data: ProductListData | null, searchKeyword: string) {
  const [openChipId, setOpenChipId] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceFilterValue>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilterValue>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [searchKeyword, priceFilter, ratingFilter, brandFilter]);

  useEffect(() => {
    setOpenChipId(null);
    setPriceFilter("all");
    setRatingFilter("all");
    setBrandFilter("all");
  }, [searchKeyword]);

  const brandOptions = useMemo(() => {
    const source = data?.productListItems ?? [];
    const map = new Map<string, string>();

    for (const product of source) {
      const label = product.brandName?.trim() || product.subtitle?.trim();
      if (!label) continue;
      const key = normalizeSearchText(label);
      if (!map.has(key)) {
        map.set(key, label);
      }
    }

    return [
      { label: "Tất cả", value: "all" },
      ...Array.from(map.values()).map((item) => ({ label: item, value: item })),
    ];
  }, [data?.productListItems]);

  const chips = useMemo<FilterChipItem[]>(() => {
    const brandLabel = brandFilter === "all" ? "Thương hiệu" : `Thương hiệu: ${brandFilter}`;
    return [
      { id: "price", label: getPriceLabel(priceFilter), active: priceFilter !== "all" },
      { id: "rating", label: getRatingLabel(ratingFilter), active: ratingFilter !== "all" },
      { id: "brand", label: brandLabel, active: brandFilter !== "all" },
    ];
  }, [brandFilter, priceFilter, ratingFilter]);

  const dropdownOptions = useMemo<DropdownOption[]>(() => {
    if (openChipId === "price") {
      return [
        { label: "Tất cả", value: "all" },
        { label: "Dưới 500.000đ", value: "lt500" },
        { label: "500.000đ - 1.000.000đ", value: "500to1000" },
        { label: "1.000.000đ - 2.000.000đ", value: "1000to2000" },
        { label: "Trên 2.000.000đ", value: "gt2000" },
      ];
    }

    if (openChipId === "rating") {
      return [
        { label: "Tất cả", value: "all" },
        { label: "Từ 4★", value: "4up" },
        { label: "Từ 4.5★", value: "45up" },
      ];
    }

    if (openChipId === "brand") {
      return brandOptions;
    }

    return [];
  }, [brandOptions, openChipId]);

  const filteredProducts = useMemo(() => {
    const source = data?.productListItems ?? [];
    const aliases = getKeywordAliases(searchKeyword);

    const byConditions = source.filter((product) => {
      const price = parsePriceNumber(product);
      const rating = syntheticRating(product);
      const productSearchText = normalizeSearchText(
        [
          product.title,
          product.subtitle,
          product.brandName ?? "",
          product.categoryName ?? "",
          ...(product.searchKeywords ?? []),
        ].join(" "),
      );

      const passKeyword = aliases.length === 0 || aliases.some((alias) => productSearchText.includes(alias));
      const passPrice =
        priceFilter === "all" ||
        (priceFilter === "lt500" && price < 500_000) ||
        (priceFilter === "500to1000" && price >= 500_000 && price <= 1_000_000) ||
        (priceFilter === "1000to2000" && price > 1_000_000 && price <= 2_000_000) ||
        (priceFilter === "gt2000" && price > 2_000_000);
      const passRating =
        ratingFilter === "all" ||
        (ratingFilter === "4up" && rating >= 4) ||
        (ratingFilter === "45up" && rating >= 4.5);
      const productBrand = normalizeSearchText(product.brandName ?? product.subtitle ?? "");
      const passBrand = brandFilter === "all" || productBrand === normalizeSearchText(brandFilter);

      return passKeyword && passPrice && passRating && passBrand;
    });

    if (aliases.length > 0 && byConditions.length === 0) {
      return source.filter((product) => {
        const category = normalizeSearchText(product.categoryName ?? "");
        return aliases.some((alias) => category.includes(alias));
      });
    }

    return byConditions;
  }, [brandFilter, data?.productListItems, priceFilter, ratingFilter, searchKeyword]);

  const visibleProducts = filteredProducts.slice(0, displayCount);
  const hasMore = filteredProducts.length > visibleProducts.length;

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
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 450);
  };

  return {
    chips,
    dropdownOptions,
    openChipId,
    filteredProducts,
    visibleProducts,
    hasMore,
    loadingMore,
    applyDropdownOption,
    handleOpenChip,
    handleLoadMore,
  };
}
