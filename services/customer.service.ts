import { API_BASE_URL_CANDIDATES, API_ENDPOINTS } from "@/constants/api";
import {
  AddCartItemPayload,
  Address,
  ApiResponse,
  ApplyVoucherPayload,
  Cart,
  CartSummary,
  CheckoutPreview,
  CheckoutPreviewPayload,
  CreateAddressPayload,
  CreateOrderPayload,
  CreateReviewPayload,
  MockPaymentCallbackPayload,
  Notification,
  Order,
  OrderTracking,
  ProductDetail,
  SelectCartItemPayload,
  UpdateAddressPayload,
  UpdateCartItemPayload,
  UpdatePasswordPayload,
  UpdateProfilePayload,
  UserProfile,
  WishlistItem,
} from "@/types/customer";

// ─── Generic authenticated request helper ─────────────────

async function requestAuth<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response | null = null;
  const triedBaseUrls: string[] = [];

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    triedBaseUrls.push(baseUrl);

    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init?.headers ?? {}),
        },
      });
      break;
    } catch {
      continue;
    }
  }

  if (!response) {
    throw new Error(
      `Không thể kết nối backend. Đã thử: ${triedBaseUrls.join(", ")}.`,
    );
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
      typeof payload.message === "string"
        ? payload.message
        : "Yêu cầu thất bại";
    throw new Error(message);
  }

  return payload as T;
}

// ─── Public request helper (no token required) ────────────

async function requestPublic<T>(path: string): Promise<T> {
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
    throw new Error(
      `Không thể kết nối backend. Đã thử: ${triedBaseUrls.join(", ")}.`,
    );
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
      typeof payload.message === "string"
        ? payload.message
        : "Yêu cầu thất bại";
    throw new Error(message);
  }

  return payload as T;
}

// ─── Product (Public) ─────────────────────────────────────

export const productService = {
  getProductDetail(productId: number) {
    return requestPublic<ApiResponse<ProductDetail>>(
      API_ENDPOINTS.products.detail(productId),
    );
  },
};

// ─── Profile / Account ───────────────────────────────────

export const profileService = {
  getProfile(token: string) {
    return requestAuth<ApiResponse<UserProfile>>(
      API_ENDPOINTS.customer.profile,
      token,
    );
  },

  updateProfile(token: string, payload: UpdateProfilePayload) {
    return requestAuth<ApiResponse<UserProfile>>(
      API_ENDPOINTS.customer.updateProfile,
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },

  updatePassword(token: string, payload: UpdatePasswordPayload) {
    return requestAuth<{ message: string }>(
      API_ENDPOINTS.customer.updatePassword,
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },
};

// ─── Addresses ────────────────────────────────────────────

export const addressService = {
  listAddresses(token: string) {
    return requestAuth<ApiResponse<Address[]>>(
      API_ENDPOINTS.customer.addresses,
      token,
    );
  },

  createAddress(token: string, payload: CreateAddressPayload) {
    return requestAuth<ApiResponse<Address>>(
      API_ENDPOINTS.customer.createAddress,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  updateAddress(token: string, addressId: number, payload: UpdateAddressPayload) {
    return requestAuth<ApiResponse<Address>>(
      API_ENDPOINTS.customer.updateAddress(addressId),
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },

  setDefaultAddress(token: string, addressId: number, isDefault: boolean) {
    return requestAuth<ApiResponse<Address>>(
      API_ENDPOINTS.customer.setDefaultAddress(addressId),
      token,
      { method: "PATCH", body: JSON.stringify({ isDefault }) },
    );
  },

  deleteAddress(token: string, addressId: number) {
    return requestAuth<{ message: string }>(
      API_ENDPOINTS.customer.deleteAddress(addressId),
      token,
      { method: "DELETE" },
    );
  },
};

// ─── Notifications ────────────────────────────────────────

export const notificationService = {
  getNotifications(token: string) {
    return requestAuth<ApiResponse<Notification[]>>(
      API_ENDPOINTS.customer.notifications,
      token,
    );
  },

  markNotificationRead(token: string, notificationId: number) {
    return requestAuth<ApiResponse<Notification>>(
      API_ENDPOINTS.customer.markNotificationRead(notificationId),
      token,
      { method: "PATCH" },
    );
  },

  markAllNotificationsRead(token: string) {
    return requestAuth<{ message: string }>(
      API_ENDPOINTS.customer.markAllNotificationsRead,
      token,
      { method: "PATCH" },
    );
  },
};

// ─── Wishlist ─────────────────────────────────────────────

export const wishlistService = {
  getWishlist(token: string) {
    return requestAuth<ApiResponse<WishlistItem[]>>(
      API_ENDPOINTS.customer.wishlist,
      token,
    );
  },

  addWishlistItem(token: string, productId: number) {
    return requestAuth<ApiResponse<WishlistItem>>(
      API_ENDPOINTS.customer.addWishlistItem,
      token,
      { method: "POST", body: JSON.stringify({ productId }) },
    );
  },

  deleteWishlistItem(token: string, wishlistItemId: number) {
    return requestAuth<{ message: string }>(
      API_ENDPOINTS.customer.deleteWishlistItem(wishlistItemId),
      token,
      { method: "DELETE" },
    );
  },
};

// ─── Reviews ──────────────────────────────────────────────

export const reviewService = {
  createReview(token: string, payload: CreateReviewPayload) {
    return requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.customer.createReview,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },
};

// ─── Cart ─────────────────────────────────────────────────

export const cartService = {
  getCart(token: string) {
    return requestAuth<ApiResponse<Cart>>(API_ENDPOINTS.cart.get, token);
  },

  addCartItem(token: string, payload: AddCartItemPayload) {
    return requestAuth<ApiResponse<Cart>>(API_ENDPOINTS.cart.addItem, token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateCartItem(token: string, cartItemId: number, payload: UpdateCartItemPayload) {
    return requestAuth<ApiResponse<Cart>>(
      API_ENDPOINTS.cart.updateItem(cartItemId),
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },

  selectCartItem(token: string, cartItemId: number, payload: SelectCartItemPayload) {
    return requestAuth<ApiResponse<Cart>>(
      API_ENDPOINTS.cart.selectItem(cartItemId),
      token,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
  },

  deleteCartItem(token: string, cartItemId: number) {
    return requestAuth<ApiResponse<Cart>>(
      API_ENDPOINTS.cart.deleteItem(cartItemId),
      token,
      { method: "DELETE" },
    );
  },

  getCartSummary(token: string) {
    return requestAuth<ApiResponse<CartSummary>>(
      API_ENDPOINTS.cart.summary,
      token,
    );
  },
};

// ─── Checkout ─────────────────────────────────────────────

export const checkoutService = {
  previewCheckout(token: string, payload?: CheckoutPreviewPayload) {
    return requestAuth<ApiResponse<CheckoutPreview>>(
      API_ENDPOINTS.checkout.preview,
      token,
      { method: "POST", body: JSON.stringify(payload ?? {}) },
    );
  },

  applyVoucher(token: string, payload: ApplyVoucherPayload) {
    return requestAuth<ApiResponse<CheckoutPreview>>(
      API_ENDPOINTS.checkout.applyVoucher,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  createOrder(token: string, payload: CreateOrderPayload) {
    return requestAuth<ApiResponse<Order>>(
      API_ENDPOINTS.checkout.createOrder,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },
};

// ─── Orders ───────────────────────────────────────────────

export const orderService = {
  getMyOrders(token: string) {
    return requestAuth<ApiResponse<Order[]>>(
      API_ENDPOINTS.orders.myOrders,
      token,
    );
  },

  getOrderDetail(token: string, orderId: number) {
    return requestAuth<ApiResponse<Order>>(
      API_ENDPOINTS.orders.detail(orderId),
      token,
    );
  },

  cancelOrder(token: string, orderId: number) {
    return requestAuth<ApiResponse<Order>>(
      API_ENDPOINTS.orders.cancel(orderId),
      token,
      { method: "POST" },
    );
  },

  getOrderTracking(token: string, orderId: number) {
    return requestAuth<ApiResponse<OrderTracking>>(
      API_ENDPOINTS.orders.tracking(orderId),
      token,
    );
  },

  mockPaymentCallback(paymentId: number, payload: MockPaymentCallbackPayload) {
    return requestPublic<ApiResponse<unknown>>(
      API_ENDPOINTS.orders.mockPaymentCallback(paymentId),
    );
  },
};
