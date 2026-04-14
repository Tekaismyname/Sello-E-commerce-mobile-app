export type ProductCard = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  imageUrl: string;
  brandName?: string;
  categoryName?: string;
  priceValue?: number;
  ratingValue?: number;
  searchKeywords?: string[];
  isPlaceholder?: boolean;
};

export type QuickCategory = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

export type CategoryTile = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
};

export type HomeData = {
  quickCategories: QuickCategory[];
  countdownValues: string[];
  flashSaleProducts: ProductCard[];
  suggestedProducts: ProductCard[];
};

export type CategoriesData = {
  categoryTiles: CategoryTile[];
  popularBrands: string[];
};

export type SearchData = {
  searchHistory: string[];
  popularSearches: string[];
  recommendedKeywords: string[];
};

export type ProductListData = {
  filterChips: string[];
  sortTabs: string[];
  productListItems: ProductCard[];
};

export type BackendHomeCategory = {
  id: number;
  name: string;
};

export type BackendHomeBrand = {
  id: number;
  name: string;
};

export type BackendHomeProduct = {
  id: number;
  name: string;
  basePrice: number;
  status: string;
  categoryId: number;
  brand: {
    id: number;
    name: string;
  } | null;
  primaryImageUrl: string | null;
};

export type BackendHomeResponse = {
  message: string;
  categories: BackendHomeCategory[];
  featuredProducts: BackendHomeProduct[];
  brands: BackendHomeBrand[];
};
