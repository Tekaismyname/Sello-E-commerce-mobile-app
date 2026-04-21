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
  ContactAdminPayload,
  CreateAddressPayload,
  CreateOrderResult,
  CreateOrderPayload,
  CreateReviewPayload,
  MockPaymentCallbackPayload,
  Notification,
  OrderDetail,
  OrderSummary,
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

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const ensureArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toOptionalNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toText = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const toOptionalText = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

const normalizeOrderStatus = (value: unknown): OrderSummary["status"] => {
  switch (value) {
    case "pending":
    case "confirmed":
    case "packed":
    case "shipping":
    case "delivered":
    case "cancelled":
    case "returned":
      return value;
    default:
      return "pending";
  }
};

const mapCart = (payload: unknown): Cart => {
  const data = asRecord(payload);
  const summary = asRecord(data.summary);
  const items = ensureArray<Record<string, unknown>>(data.items).map((item) => {
    const product = asRecord(item.product);
    const variant = asRecord(item.variant);
    const color = toOptionalText(variant.color);
    const size = toOptionalText(variant.size);
    const variantLabel = [color, size].filter(Boolean).join(" / ");

    return {
      id: toNumber(item.id),
      cartId: toOptionalNumber(item.cartId ?? item.cart_id),
      productId: toNumber(item.productId ?? item.product_id),
      variantId:
        item.variantId === null || item.variant_id === null
          ? null
          : toOptionalNumber(item.variantId ?? item.variant_id) ?? null,
      productName: toText(item.productName ?? product.name, "San pham"),
      productImage: toText(item.productImage ?? product.primaryImageUrl),
      price: toNumber(item.price ?? item.unitPrice ?? item.unit_price ?? product.basePrice),
      quantity: toNumber(item.quantity, 1),
      selected: Boolean(item.selected),
      variantLabel: variantLabel || undefined,
      availableStock: toOptionalNumber(variant.stockQty ?? variant.stock_qty),
    };
  });

  return {
    cartId: toOptionalNumber(data.cartId ?? data.cart_id),
    items,
    totalItems: toNumber(summary.itemsCount ?? summary.totalItems ?? data.totalItems, items.length),
    selectedItems: toNumber(
      summary.selectedItemsCount ?? summary.selectedItems ?? data.selectedItems,
      items.filter((item) => item.selected).length,
    ),
    subtotal: toNumber(summary.subtotal),
    total: toNumber(summary.totalAmount ?? summary.total ?? summary.subtotal),
  };
};

const mapOrderItem = (payload: Record<string, unknown>) => ({
  id: toNumber(payload.id),
  productId: toNumber(payload.productId ?? payload.product_id),
  variantId:
    payload.variantId === null || payload.variant_id === null
      ? null
      : toOptionalNumber(payload.variantId ?? payload.variant_id) ?? null,
  productName: toText(payload.productName ?? payload.product_name_snapshot, "San pham"),
  productImage: toOptionalText(payload.productImage ?? payload.product_image),
  variantLabel: toOptionalText(payload.variantLabel ?? payload.variantSnapshot ?? payload.variant_snapshot) ?? null,
  quantity: toNumber(payload.quantity, 1),
  price: toNumber(payload.price ?? payload.unitPrice ?? payload.unit_price),
  lineTotal: toOptionalNumber(payload.lineTotal ?? payload.line_total),
});

const mapOrderSummary = (payload: Record<string, unknown>): OrderSummary => ({
  id: toNumber(payload.id),
  orderCode: toText(payload.orderCode ?? payload.order_code, `ORD-${toNumber(payload.id)}`),
  status: normalizeOrderStatus(payload.status ?? payload.orderStatus ?? payload.order_status),
  totalAmount: toNumber(payload.totalAmount ?? payload.total_amount),
  subtotal: toOptionalNumber(payload.subtotal),
  shippingFee: toOptionalNumber(payload.shippingFee ?? payload.shipping_fee),
  discount: toOptionalNumber(payload.discount ?? payload.product_discount),
  paymentStatus: toOptionalText(payload.paymentStatus ?? payload.payment_status),
  createdAt: toText(payload.createdAt ?? payload.placedAt ?? payload.placed_at, new Date().toISOString()),
});

const mapOrderDetail = (payload: unknown): OrderDetail => {
  const data = asRecord(payload);
  const payment = asRecord(data.payment);
  const shipment = asRecord(data.shipment);

  return {
    ...mapOrderSummary(data),
    note: toOptionalText(data.note) ?? null,
    items: ensureArray<Record<string, unknown>>(data.items).map(mapOrderItem),
    payment:
      Object.keys(payment).length > 0
        ? {
            id: toNumber(payment.id),
            paymentMethodId: toNumber(payment.paymentMethodId ?? payment.payment_method_id),
            amount: toNumber(payment.amount),
            transactionCode: toOptionalText(payment.transactionCode ?? payment.transaction_code) ?? null,
            paymentStatus: toText(payment.paymentStatus ?? payment.payment_status, "pending"),
            paidAt: toOptionalText(payment.paidAt ?? payment.paid_at) ?? null,
            failReason: toOptionalText(payment.failReason ?? payment.fail_reason) ?? null,
          }
        : null,
    shipment:
      Object.keys(shipment).length > 0
        ? {
            id: toNumber(shipment.id),
            carrierName: toOptionalText(shipment.carrierName ?? shipment.carrier_name) ?? null,
            trackingCode: toOptionalText(shipment.trackingCode ?? shipment.tracking_code) ?? null,
            shippingType: toOptionalText(shipment.shippingType ?? shipment.shipping_type) ?? null,
            shipmentStatus: toOptionalText(shipment.shipmentStatus ?? shipment.shipment_status) ?? null,
            shippedAt: toOptionalText(shipment.shippedAt ?? shipment.shipped_at) ?? null,
            deliveredAt: toOptionalText(shipment.deliveredAt ?? shipment.delivered_at) ?? null,
          }
        : null,
    statusHistory: ensureArray<Record<string, unknown>>(data.statusHistory).map((event) => ({
      id: toOptionalNumber(event.id ?? event.history_id),
      status: toText(event.status, "pending"),
      description: toText(event.description),
      updatedBy: toOptionalNumber(event.updatedBy ?? event.updated_by) ?? null,
      timestamp: toText(event.timestamp ?? event.createdAt ?? event.created_at, new Date().toISOString()),
    })),
  };
};

const mapOrderTracking = (payload: unknown): OrderTracking => {
  const data = asRecord(payload);
  const shipment = asRecord(data.shipment);

  return {
    shipment:
      Object.keys(shipment).length > 0
        ? {
            id: toNumber(shipment.id),
            carrierName: toOptionalText(shipment.carrierName ?? shipment.carrier_name) ?? null,
            trackingCode: toOptionalText(shipment.trackingCode ?? shipment.tracking_code) ?? null,
            shippingType: toOptionalText(shipment.shippingType ?? shipment.shipping_type) ?? null,
            shipmentStatus: toOptionalText(shipment.shipmentStatus ?? shipment.shipment_status) ?? null,
            estimatedDeliveryAt:
              toOptionalText(shipment.estimatedDeliveryAt ?? shipment.estimated_delivery_at) ?? null,
            shippedAt: toOptionalText(shipment.shippedAt ?? shipment.shipped_at) ?? null,
            deliveredAt: toOptionalText(shipment.deliveredAt ?? shipment.delivered_at) ?? null,
          }
        : null,
    timeline: ensureArray<Record<string, unknown>>(data.timeline ?? data.events).map((event) => ({
      id: toOptionalNumber(event.id ?? event.history_id),
      status: toText(event.status, "pending"),
      description: toText(event.description),
      updatedBy: toOptionalNumber(event.updatedBy ?? event.updated_by) ?? null,
      timestamp: toText(event.timestamp ?? event.createdAt ?? event.created_at, new Date().toISOString()),
    })),
  };
};

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

  contactAdmin(token: string, payload: ContactAdminPayload) {
    return requestAuth<ApiResponse<{ insertedCount: number; targetScope: string }>>(
      API_ENDPOINTS.customer.contactAdmin,
      token,
      { method: "POST", body: JSON.stringify(payload) },
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
  async getCart(token: string) {
    const response = await requestAuth<ApiResponse<unknown>>(API_ENDPOINTS.cart.get, token);
    return { ...response, data: mapCart(response.data) };
  },

  async addCartItem(token: string, payload: AddCartItemPayload) {
    const response = await requestAuth<ApiResponse<unknown>>(API_ENDPOINTS.cart.addItem, token, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ...response, data: mapCart(response.data) };
  },

  async updateCartItem(token: string, cartItemId: number, payload: UpdateCartItemPayload) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.cart.updateItem(cartItemId),
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );
    return { ...response, data: mapCart(response.data) };
  },

  async selectCartItem(token: string, cartItemId: number, payload: SelectCartItemPayload) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.cart.selectItem(cartItemId),
      token,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
    return { ...response, data: mapCart(response.data) };
  },

  deleteCartItem(token: string, cartItemId: number) {
    return requestAuth<{ message: string }>(
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
    return requestAuth<ApiResponse<CreateOrderResult>>(
      API_ENDPOINTS.checkout.createOrder,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },
};

// ─── Orders ───────────────────────────────────────────────

export const orderService = {
  async getMyOrders(token: string) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.orders.myOrders,
      token,
    );
    return {
      ...response,
      data: ensureArray<Record<string, unknown>>(response.data).map(mapOrderSummary),
    };
  },

  async getOrderDetail(token: string, orderId: number) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.orders.detail(orderId),
      token,
    );
    return { ...response, data: mapOrderDetail(response.data) };
  },

  async cancelOrder(token: string, orderId: number) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.orders.cancel(orderId),
      token,
      { method: "POST" },
    );
    return { ...response, data: mapOrderDetail(response.data) };
  },

  async getOrderTracking(token: string, orderId: number) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.orders.tracking(orderId),
      token,
    );
    return { ...response, data: mapOrderTracking(response.data) };
  },

  mockPaymentCallback(paymentId: number, payload: MockPaymentCallbackPayload) {
    return requestPublic<ApiResponse<unknown>>(
      API_ENDPOINTS.orders.mockPaymentCallback(paymentId),
    );
  },
};
