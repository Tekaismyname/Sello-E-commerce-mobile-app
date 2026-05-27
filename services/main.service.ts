import { API_BASE_URL_CANDIDATES, API_ENDPOINTS } from "@/constants/api";
import {
  BackendHomeResponse,
  CategoriesData,
  HomeData,
  ProductCard,
  ProductListData,
  QuickCategory,
  SearchData,
} from "@/types/main";

const quickCategoryIcons = ["smartphone", "shopping-bag", "home", "book-open", "monitor", "watch", "headphones"] as const;

const quickCategoryColors = ["#eaf5ff", "#f2ecff", "#edfff3", "#eef5ff", "#f5f6ff", "#fff3e8", "#ecfbff"] as const;

const fallbackImages = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80",
];

const countdownValues = ["00", "00", "00"];

let cachedHomePromise: Promise<BackendHomeResponse> | null = null;
let cachedHomeData: BackendHomeResponse | null = null;

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
const pad2 = (value: number) => String(Math.max(0, value)).padStart(2, "0");

const getNextFlashSaleEndAt = (now = new Date()) => {
  const current = new Date(now);
  const hour = current.getHours();
  const nextBoundaryHour = Math.floor(hour / 4) * 4 + 4;

  if (nextBoundaryHour >= 24) {
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
    return current;
  }

  current.setHours(nextBoundaryHour, 0, 0, 0);
  return current;
};

const getCountdownValues = (flashSaleEndAt: string, now = new Date()) => {
  const end = new Date(flashSaleEndAt).getTime();
  const diffMs = Math.max(0, end - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [pad2(hours), pad2(minutes), pad2(seconds)];
};

const uniqueList = (items: string[], max: number) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = item.trim();

    if (!normalized || seen.has(normalized.toLowerCase())) {
      continue;
    }

    seen.add(normalized.toLowerCase());
    result.push(normalized);

    if (result.length >= max) {
      break;
    }
  }

  return result;
};

const mapBackendProductToCard = (
  product: BackendHomeResponse["featuredProducts"][number],
  categoryName: string,
  index: number,
  withBadge = false,
): ProductCard => {
  const basePrice = Number(product.basePrice) || 0;
  const oldPrice = basePrice > 0 ? Math.round(basePrice * 1.15) : 0;
  const badgeValues = ["-18%", "-33%", "-20%", "-60%"];
  const brandName = product.brand?.name ?? "Sello";
  const ratingValue = 3.8 + (index % 13) / 10;

  return {
    id: String(product.id),
    title: product.name,
    subtitle: brandName,
    brandName,
    categoryName,
    searchKeywords: [product.name, brandName, categoryName],
    priceValue: basePrice,
    ratingValue,
    price: formatPrice(basePrice),
    oldPrice: oldPrice > 0 ? formatPrice(oldPrice) : undefined,
    badge: withBadge ? badgeValues[index % badgeValues.length] : undefined,
    imageUrl: product.primaryImageUrl ?? fallbackImages[index % fallbackImages.length],
  };
};

const mapCategoryPlaceholderToCard = (categoryName: string, index: number): ProductCard => {
  const basePrice = 390000 + (index % 8) * 110000;
  const oldPrice = Math.round(basePrice * 1.14);

  return {
    id: `placeholder-${index}-${categoryName}`,
    title: `${categoryName} noi bat`,
    subtitle: "Sello",
    brandName: "Sello",
    categoryName,
    searchKeywords: [categoryName, `${categoryName} gia re`, `${categoryName} ban chay`],
    priceValue: basePrice,
    ratingValue: 4 + (index % 8) / 10,
    price: formatPrice(basePrice),
    oldPrice: formatPrice(oldPrice),
    badge: index % 2 === 0 ? "-15%" : undefined,
    imageUrl: fallbackImages[index % fallbackImages.length],
    isPlaceholder: true,
  };
};

const mapQuickCategories = (payload: BackendHomeResponse): QuickCategory[] =>
  payload.categories.slice(0, 5).map((category, index) => ({
    id: `cat-${category.id}`,
    label: category.name,
    icon: quickCategoryIcons[index % quickCategoryIcons.length],
    color: quickCategoryColors[index % quickCategoryColors.length],
  }));

const mapHomeData = (payload: BackendHomeResponse): HomeData => {
  const categoryMap = new Map<number, string>(payload.categories.map((c) => [c.id, c.name]));
  const now = new Date();
  const flashSaleEndAt = getNextFlashSaleEndAt(now).toISOString();
  const categoryCounts = new Map<number, number>();

  for (const item of payload.featuredProducts) {
    categoryCounts.set(item.categoryId, (categoryCounts.get(item.categoryId) ?? 0) + 1);
  }

  const mappedProducts = payload.featuredProducts.map((product, index) =>
    mapBackendProductToCard(product, categoryMap.get(product.categoryId) ?? "Sản phẩm", index),
  );

  const sortedForFlashSale = payload.featuredProducts
    .filter((product) => (product.status ?? "").toLowerCase() === "active")
    .map((product, index) => {
      const idValue = Number(product.id) || 0;
      const ageScore = idValue > 0 ? 1 / idValue : 0;
      const priceScore = (Number(product.basePrice) || 0) / 1_000_000;
      const categoryPressure = categoryCounts.get(product.categoryId) ?? 0;
      const score = ageScore * 1000 + priceScore + categoryPressure * 0.2;

      return { product, index, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const fallbackFlashSale = payload.featuredProducts.slice(0, 4).map((product, index) => ({
    product,
    index,
  }));

  const flashSaleProducts = (sortedForFlashSale.length ? sortedForFlashSale : fallbackFlashSale).map(({ product, index }) =>
    mapBackendProductToCard(product, categoryMap.get(product.categoryId) ?? "Sản phẩm", index, true),
  );

  const suggestedProducts = mappedProducts;

  return {
    quickCategories: mapQuickCategories(payload),
    flashSaleEndsAt: flashSaleEndAt,
    countdownValues: getCountdownValues(flashSaleEndAt, now),
    flashSaleProducts,
    suggestedProducts,
  };
};

const mapCategoriesData = (payload: BackendHomeResponse): CategoriesData => ({
  categoryTiles: payload.categories.slice(0, 7).map((category, index) => ({
    id: `tile-${category.id}`,
    title: category.name,
    subtitle: undefined,
    imageUrl: fallbackImages[index % fallbackImages.length],
  })),
  popularBrands: uniqueList(payload.brands.map((brand) => brand.name), 6),
});

const mapSearchData = (payload: BackendHomeResponse): SearchData => ({
  searchHistory: uniqueList(payload.featuredProducts.map((product) => product.name), 4),
  popularSearches: uniqueList(
    [...payload.categories.map((category) => category.name), ...payload.brands.map((brand) => `${brand.name} khuyến mãi`)],
    5,
  ),
  recommendedKeywords: uniqueList(payload.featuredProducts.map((product) => `${product.name} giá tốt`), 4),
});

const mapProductListData = (payload: BackendHomeResponse): ProductListData => {
  const categoryMap = new Map<number, string>(payload.categories.map((c) => [c.id, c.name]));
  const mappedProducts = payload.featuredProducts.map((product, index) =>
    mapBackendProductToCard(product, categoryMap.get(product.categoryId) ?? "Sản phẩm", index, index % 2 === 1),
  );
  const categorySeeds = ["Áo", "Quần", "Giày", "Phụ kiện"];
  const allCategoryNames = Array.from(new Set([...payload.categories.map((category) => category.name), ...categorySeeds]));
  const categoryNamesInProducts = new Set(
    mappedProducts.map((item) => (item.categoryName ?? "").trim().toLowerCase()).filter(Boolean),
  );
  const missingCategoryProducts = allCategoryNames
    .filter((categoryName) => !categoryNamesInProducts.has(categoryName.trim().toLowerCase()))
    .map((categoryName, index) => mapCategoryPlaceholderToCard(categoryName, mappedProducts.length + index));

  return {
    filterChips: ["Giá", "Đánh giá", "Thương hiệu"],
    sortTabs: ["Phổ biến", "Bán chạy", "Giá thấp > cao"],
    productListItems: [...mappedProducts, ...missingCategoryProducts],
  };
};

const mapPublicProductToCard = (
  product: any,
  index: number,
): ProductCard => {
  const basePrice = Number(product.basePrice) || 0;
  const oldPrice = basePrice > 0 ? Math.round(basePrice * 1.15) : 0;
  const ratingValue = 3.8 + (index % 13) / 10;
  const brandName = product.brand?.name ?? "Sello";
  const categoryName = product.category?.name ?? "Sản phẩm";
  
  return {
    id: String(product.id),
    title: product.name,
    subtitle: brandName,
    brandName,
    categoryName,
    searchKeywords: [product.name, brandName, categoryName],
    priceValue: basePrice,
    ratingValue,
    price: formatPrice(basePrice),
    oldPrice: oldPrice > 0 ? formatPrice(oldPrice) : undefined,
    imageUrl: product.primaryImageUrl ?? fallbackImages[index % fallbackImages.length],
  };
};
async function requestMain<T>(path: string): Promise<T> {
  let response: Response | null = null;
  const triedBaseUrls: string[] = [];

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    triedBaseUrls.push(baseUrl);

    try {
      response = await fetch(`${baseUrl}${path}`);
      break;
    } catch {
      continue;
    }
  }

  if (!response) {
    throw new Error(`Không thể kết nối backend cho dữ liệu main. Đã thử: ${triedBaseUrls.join(", ")}.`);
  }

  const raw = await response.text();
  let payload: Record<string, unknown> = {};

  if (raw) {
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const message = typeof payload.message === "string" ? payload.message : "Tải dữ liệu main thất bại";
    throw new Error(message);
  }

  return payload as T;
}

async function getBackendHomeData(): Promise<BackendHomeResponse> {
  if (cachedHomeData) {
    return cachedHomeData;
  }

  if (cachedHomePromise) {
    return cachedHomePromise;
  }

  cachedHomePromise = requestMain<BackendHomeResponse>(API_ENDPOINTS.main.home).then((payload) => {
    cachedHomeData = payload;
    cachedHomePromise = null;
    return payload;
  });

  return cachedHomePromise;
}

async function getFreshBackendHomeData(): Promise<BackendHomeResponse> {
  cachedHomeData = null;
  cachedHomePromise = null;

  return getBackendHomeData();
}

export const mainService = {
  clearHomeCache() {
    cachedHomeData = null;
    cachedHomePromise = null;
  },

  async getHomeData(options?: { forceRefresh?: boolean }): Promise<HomeData> {
    return mapHomeData(
      options?.forceRefresh ? await getFreshBackendHomeData() : await getBackendHomeData(),
    );
  },

  async getCategoriesData(options?: { forceRefresh?: boolean }): Promise<CategoriesData> {
    return mapCategoriesData(
      options?.forceRefresh ? await getFreshBackendHomeData() : await getBackendHomeData(),
    );
  },

  async getSearchData(options?: { forceRefresh?: boolean }): Promise<SearchData> {
    return mapSearchData(
      options?.forceRefresh ? await getFreshBackendHomeData() : await getBackendHomeData(),
    );
  },

  async getProductListData(options?: { forceRefresh?: boolean }): Promise<ProductListData> {
    return mapProductListData(
      options?.forceRefresh ? await getFreshBackendHomeData() : await getBackendHomeData(),
    );
  },

  async getFilterMetadata() {
    const homeData = await getBackendHomeData();
    return {
      categories: homeData.categories,
      brands: homeData.brands,
    };
  },

  async getProducts(params: {
    search?: string;
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParts: string[] = [];
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.categoryId) queryParts.push(`categoryId=${params.categoryId}`);
    if (params.brandId) queryParts.push(`brandId=${params.brandId}`);
    if (params.minPrice !== undefined) queryParts.push(`minPrice=${params.minPrice}`);
    if (params.maxPrice !== undefined) queryParts.push(`maxPrice=${params.maxPrice}`);
    if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    
    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const response = await requestMain<{ message: string; data: any }>(
      `${API_ENDPOINTS.products.list}${queryString}`
    );
    
    const rawData = response.data;
    if (rawData && typeof rawData === "object" && "items" in rawData && Array.isArray(rawData.items)) {
      const mappedItems = rawData.items.map((item: any, index: number) =>
        mapPublicProductToCard(item, index)
      );
      return {
        ...response,
        data: {
          items: mappedItems,
          meta: rawData.meta,
        },
      };
    } else if (Array.isArray(rawData)) {
      const mappedItems = rawData.map((item: any, index: number) =>
        mapPublicProductToCard(item, index)
      );
      return {
        ...response,
        data: mappedItems,
      };
    }
    
    return {
      ...response,
      data: [],
    };
  },
};

