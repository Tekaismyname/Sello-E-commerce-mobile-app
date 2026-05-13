import Constants from "expo-constants";
import { Platform } from "react-native";

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

const isLocalhostUrl = (value: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(value);

const replaceHostKeepingPort = (url: string, host: string) => {
  try {
    const parsed = new URL(url);
    parsed.hostname = host;
    return trimTrailingSlash(parsed.toString());
  } catch {
    return trimTrailingSlash(url);
  }
};

const uniqueUrls = (urls: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const url of urls) {
    const normalized = trimTrailingSlash(url.trim());

    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result;
};

const resolveExpoDevHost = () => {
  const hostUriFromConfig = Constants.expoConfig?.hostUri;
  const maybeHostUri =
    typeof hostUriFromConfig === "string" && hostUriFromConfig
      ? hostUriFromConfig
      : undefined;

  if (!maybeHostUri) {
    return null;
  }

  const host = maybeHostUri.split(":")[0]?.trim();

  if (!host || host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  return host;
};

const resolveApiBaseUrls = () => {
  const candidates: string[] = [];
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (envBaseUrl) {
    if (Platform.OS === "android" && isLocalhostUrl(envBaseUrl)) {
      candidates.push(replaceHostKeepingPort(envBaseUrl, "10.0.2.2"));
    }
    candidates.push(envBaseUrl);
  }

  if (Platform.OS !== "web") {
    const expoDevHost = resolveExpoDevHost();

    if (expoDevHost) {
      candidates.push(`http://${expoDevHost}:3000`);
    }
  }

  if (Platform.OS === "android") {
    candidates.push("http://10.0.2.2:3000");
  }

  candidates.push("http://127.0.0.1:3000");

  return uniqueUrls(candidates);
};

export const API_BASE_URL_CANDIDATES = resolveApiBaseUrls();
export const API_BASE_URL = API_BASE_URL_CANDIDATES[0] ?? "http://127.0.0.1:3000";

export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
    verifyOtp: "/auth/verify-otp",
    resetPassword: "/auth/reset-password",
    logout: "/auth/logout",
    me: "/auth/me",
    google: "/auth/google",
    deleteUser: (userId: number) => `/auth/users/${userId}`,
  },
  main: {
    home: "/home",
  },
  products: {
    detail: (productId: number) => `/products/${productId}`,
  },
  customer: {
    profile: "/me",
    updateProfile: "/me",
    updatePassword: "/me/password",
    contactAdmin: "/me/contact-admin",
    addresses: "/addresses",
    createAddress: "/addresses",
    updateAddress: (addressId: number) => `/addresses/${addressId}`,
    setDefaultAddress: (addressId: number) => `/addresses/${addressId}/default`,
    deleteAddress: (addressId: number) => `/addresses/${addressId}`,
    notifications: "/notifications",
    markNotificationRead: (notificationId: number) => `/notifications/${notificationId}/read`,
    markAllNotificationsRead: "/notifications/read-all",
    wishlist: "/wishlist",
    addWishlistItem: "/wishlist/items",
    deleteWishlistItem: (wishlistItemId: number) => `/wishlist/items/${wishlistItemId}`,
    createReview: "/reviews",
  },
  cart: {
    get: "/cart",
    addItem: "/cart/items",
    updateItem: (cartItemId: number) => `/cart/items/${cartItemId}`,
    selectItem: (cartItemId: number) => `/cart/items/${cartItemId}/select`,
    deleteItem: (cartItemId: number) => `/cart/items/${cartItemId}`,
    summary: "/cart/summary",
  },
  checkout: {
    preview: "/checkout/preview",
    applyVoucher: "/checkout/apply-voucher",
    createOrder: "/orders",
  },
  orders: {
    myOrders: "/orders/me",
    detail: (orderId: number) => `/orders/${orderId}`,
    cancel: (orderId: number) => `/orders/${orderId}/cancel`,
    tracking: (orderId: number) => `/orders/${orderId}/tracking`,
    mockPaymentCallback: (paymentId: number) => `/payments/mock/${paymentId}/callback`,
    mockPaymentStatus: (paymentId: number) => `/payments/mock/${paymentId}/status`,
  },
  admin: {
    dashboard: "/admin/system/dashboard",
    systemConfigOptions: "/admin/system/config-options",
    updateConfig: "/admin/system/config",
    categories: "/admin/categories",
    categoryDetail: (categoryId: number) => `/admin/categories/${categoryId}`,
    createCategory: "/admin/categories",
    updateCategory: (categoryId: number) => `/admin/categories/${categoryId}`,
    updateCategoryStatus: (categoryId: number) => `/admin/categories/${categoryId}/status`,
    deleteCategory: (categoryId: number) => `/admin/categories/${categoryId}`,
    brands: "/admin/brands",
    createBrand: "/admin/brands",
    updateBrand: (brandId: number) => `/admin/brands/${brandId}`,
    updateBrandStatus: (brandId: number) => `/admin/brands/${brandId}/status`,
    vouchers: "/admin/vouchers",
    voucherDetail: (voucherId: number) => `/admin/vouchers/${voucherId}`,
    createVoucher: "/admin/vouchers",
    updateVoucher: (voucherId: number) => `/admin/vouchers/${voucherId}`,
    updateVoucherStatus: (voucherId: number) => `/admin/vouchers/${voucherId}/status`,
    deleteVoucher: (voucherId: number) => `/admin/vouchers/${voucherId}`,
    notifications: "/admin/notifications",
    createNotification: "/admin/notifications",
    reviews: "/admin/reviews",
    moderateReview: (reviewId: number) => `/admin/reviews/${reviewId}/moderation`,
    users: "/admin/users",
    userDetail: (userId: number) => `/admin/users/${userId}`,
    updateUserStatus: (userId: number) => `/admin/users/${userId}/status`,
    updateUserRole: (userId: number) => `/admin/users/${userId}/role`,
    orders: "/admin/orders",
    orderDetail: (orderId: number) => `/admin/orders/${orderId}`,
    updateOrderStatus: (orderId: number) => `/admin/orders/${orderId}/status`,
    products: "/admin/products",
    productDetail: (productId: number) => `/admin/products/${productId}`,
    createProduct: "/admin/products",
    updateProduct: (productId: number) => `/admin/products/${productId}`,
    updateProductStatus: (productId: number) => `/admin/products/${productId}/status`,
    deleteProduct: (productId: number) => `/admin/products/${productId}`,
    reportsOverview: "/admin/reports/overview",
    exportReport: "/admin/reports/export",
  },
} as const;
