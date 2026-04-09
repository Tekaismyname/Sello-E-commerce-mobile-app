import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import {
  BackendHomeResponse,
  CategoriesData,
  HomeData,
  ProductCard,
  ProductListData,
  QuickCategory,
  SearchData,
} from "@/types/main";

const quickCategoryIcons = [
  "smartphone",
  "shirt",
  "home",
  "book-open",
  "monitor",
  "watch",
  "headphones",
] as const;

const quickCategoryColors = [
  "#eaf5ff",
  "#f2ecff",
  "#edfff3",
  "#eef5ff",
  "#f5f6ff",
  "#fff3e8",
  "#ecfbff",
] as const;

const fallbackImages = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80",
];

const countdownValues = ["02", "45", "12"];

let cachedHomePromise: Promise<BackendHomeResponse> | null = null;
let cachedHomeData: BackendHomeResponse | null = null;

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}d`;

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
  index: number,
  withBadge = false,
): ProductCard => {
  const basePrice = Number(product.basePrice) || 0;
  const oldPrice = basePrice > 0 ? Math.round(basePrice * 1.15) : 0;
  const badgeValues = ["-18%", "-33%", "-20%", "-60%"];

  return {
    id: `be-${product.id}-${index}`,
    title: product.name,
    subtitle: product.brand?.name ?? "Sản phẩm nổi bật",
    price: formatPrice(basePrice),
    oldPrice: oldPrice > 0 ? formatPrice(oldPrice) : undefined,
    badge: withBadge ? badgeValues[index % badgeValues.length] : undefined,
    imageUrl: product.primaryImageUrl ?? fallbackImages[index % fallbackImages.length],
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
  const mappedProducts = payload.featuredProducts.map((product, index) =>
    mapBackendProductToCard(product, index),
  );
  const flashSaleProducts = payload.featuredProducts
    .slice(0, 4)
    .map((product, index) => mapBackendProductToCard(product, index, true));
  const suggestedProducts = mappedProducts.slice(0, 4);

  return {
    quickCategories: mapQuickCategories(payload),
    countdownValues,
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
  popularBrands: uniqueList(
    payload.brands.map((brand) => brand.name),
    6,
  ),
});

const mapSearchData = (payload: BackendHomeResponse): SearchData => ({
  searchHistory: uniqueList(
    payload.featuredProducts.map((product) => product.name),
    4,
  ),
  popularSearches: uniqueList(
    [
      ...payload.categories.map((category) => category.name),
      ...payload.brands.map((brand) => `${brand.name} khuyến mãi`),
    ],
    5,
  ),
  recommendedKeywords: uniqueList(
    payload.featuredProducts.map((product) => `${product.name} giá tốt`),
    4,
  ),
});

const mapProductListData = (payload: BackendHomeResponse): ProductListData => ({
  filterChips: ["Giá", "Đánh giá", "Thương hiệu"],
  sortTabs: ["Phổ biến", "Bán chạy", "Giá thấp > cao"],
  productListItems: payload.featuredProducts
    .map((product, index) => mapBackendProductToCard(product, index, index % 2 === 1))
    .slice(0, 8),
});

async function requestMain<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    throw new Error("Không thể kết nối backend cho dữ liệu main.");
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
    const message =
      typeof payload.message === "string" ? payload.message : "Tải dữ liệu main thất bại";
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

export const mainService = {
  async getHomeData(): Promise<HomeData> {
    return mapHomeData(await getBackendHomeData());
  },

  async getCategoriesData(): Promise<CategoriesData> {
    return mapCategoriesData(await getBackendHomeData());
  },

  async getSearchData(): Promise<SearchData> {
    return mapSearchData(await getBackendHomeData());
  },

  async getProductListData(): Promise<ProductListData> {
    return mapProductListData(await getBackendHomeData());
  },
};
