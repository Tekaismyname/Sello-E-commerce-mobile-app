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

async function requestPublic<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response | null = null;
  const triedBaseUrls: string[] = [];

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    triedBaseUrls.push(baseUrl);

    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
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

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toDateString = (value: unknown) => {
  if (typeof value !== "string") return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const mapOrderStatus = (value: unknown): Order["status"] => {
  if (
    value === "pending" ||
    value === "confirmed" ||
    value === "packed" ||
    value === "shipping" ||
    value === "delivered" ||
    value === "cancelled" ||
    value === "returned"
  ) {
    return value;
  }

  return "pending";
};

const mapOrderItem = (item: Record<string, unknown>): Order["items"][number] => ({
  id: toNumber(item.id ?? item.orderItemId),
  productId: toNumber(item.productId),
  productName: String(item.productName ?? "Sản phẩm"),
  variantId: item.variantId ? toNumber(item.variantId) : null,
  variantLabel:
    typeof item.variantLabel === "string"
      ? item.variantLabel
      : typeof item.variantSnapshot === "string"
        ? item.variantSnapshot
        : null,
  variantSnapshot: typeof item.variantSnapshot === "string" ? item.variantSnapshot : null,
  quantity: toNumber(item.quantity, 1),
  price: toNumber(item.price ?? item.unitPrice),
  unitPrice: toNumber(item.unitPrice ?? item.price),
  lineTotal: toNumber(item.lineTotal),
});

const mapOrder = (raw: Record<string, unknown>): Order => ({
  id: toNumber(raw.id),
  orderCode: typeof raw.orderCode === "string" ? raw.orderCode : undefined,
  status: mapOrderStatus(raw.orderStatus ?? raw.status),
  totalAmount: toNumber(raw.totalAmount),
  createdAt: toDateString(raw.placedAt ?? raw.createdAt),
  subtotal: toNumber(raw.subtotal),
  shippingFee: toNumber(raw.shippingFee),
  discount: toNumber(raw.discount),
  paymentStatus: typeof raw.paymentStatus === "string" ? raw.paymentStatus : undefined,
  note: typeof raw.note === "string" ? raw.note : null,
  shippingAddress:
    typeof raw.shippingAddress === "string" ? raw.shippingAddress : undefined,
  items: asArray<Record<string, unknown>>(raw.items).map(mapOrderItem),
  payment: raw.payment
    ? {
        id: toNumber(asRecord(raw.payment).id),
        paymentMethodId: toNumber(asRecord(raw.payment).paymentMethodId),
        methodCode:
          typeof asRecord(raw.payment).methodCode === "string"
            ? String(asRecord(raw.payment).methodCode)
            : null,
        methodName:
          typeof asRecord(raw.payment).methodName === "string"
            ? String(asRecord(raw.payment).methodName)
            : null,
        amount: toNumber(asRecord(raw.payment).amount),
        transactionCode:
          typeof asRecord(raw.payment).transactionCode === "string"
            ? String(asRecord(raw.payment).transactionCode)
            : null,
        paymentStatus: String(asRecord(raw.payment).paymentStatus ?? "pending"),
        paidAt:
          typeof asRecord(raw.payment).paidAt === "string"
            ? toDateString(asRecord(raw.payment).paidAt)
            : null,
        failReason:
          typeof asRecord(raw.payment).failReason === "string"
            ? String(asRecord(raw.payment).failReason)
            : null,
        paymentUrl:
          typeof asRecord(raw.payment).paymentUrl === "string"
            ? String(asRecord(raw.payment).paymentUrl)
            : undefined,
        qrPayload:
          typeof asRecord(raw.payment).qrPayload === "string"
            ? String(asRecord(raw.payment).qrPayload)
            : undefined,
        qrCodeUrl:
          typeof asRecord(raw.payment).qrCodeUrl === "string"
            ? String(asRecord(raw.payment).qrCodeUrl)
            : undefined,
      }
    : null,
  shipment: raw.shipment
    ? {
        id: toNumber(asRecord(raw.shipment).id),
        carrierName:
          typeof asRecord(raw.shipment).carrierName === "string"
            ? String(asRecord(raw.shipment).carrierName)
            : null,
        trackingCode:
          typeof asRecord(raw.shipment).trackingCode === "string"
            ? String(asRecord(raw.shipment).trackingCode)
            : null,
        shippingType:
          typeof asRecord(raw.shipment).shippingType === "string"
            ? String(asRecord(raw.shipment).shippingType)
            : null,
        driverName:
          typeof asRecord(raw.shipment).driverName === "string"
            ? String(asRecord(raw.shipment).driverName)
            : typeof asRecord(raw.shipment).driver_name === "string"
              ? String(asRecord(raw.shipment).driver_name)
            : null,
        driverPhone:
          typeof asRecord(raw.shipment).driverPhone === "string"
            ? String(asRecord(raw.shipment).driverPhone)
            : typeof asRecord(raw.shipment).driver_phone === "string"
              ? String(asRecord(raw.shipment).driver_phone)
            : null,
        vehicleNumber:
          typeof asRecord(raw.shipment).vehicleNumber === "string"
            ? String(asRecord(raw.shipment).vehicleNumber)
            : typeof asRecord(raw.shipment).vehicle_number === "string"
              ? String(asRecord(raw.shipment).vehicle_number)
            : null,
        latitude: toNullableNumber(asRecord(raw.shipment).latitude ?? asRecord(raw.shipment).locationLat),
        longitude: toNullableNumber(asRecord(raw.shipment).longitude ?? asRecord(raw.shipment).locationLng),
        shipmentStatus: String(asRecord(raw.shipment).shipmentStatus ?? "pending"),
        shippedAt:
          typeof asRecord(raw.shipment).shippedAt === "string"
            ? toDateString(asRecord(raw.shipment).shippedAt)
            : null,
        deliveredAt:
          typeof asRecord(raw.shipment).deliveredAt === "string"
            ? toDateString(asRecord(raw.shipment).deliveredAt)
            : null,
      }
    : null,
  statusHistory: asArray<Record<string, unknown>>(raw.statusHistory).map((history) => ({
    id: toNumber(history.id),
    status: String(history.status ?? "pending"),
    description: typeof history.description === "string" ? history.description : null,
    updatedBy: history.updatedBy ? toNumber(history.updatedBy) : null,
    createdAt: toDateString(history.createdAt),
    timestamp: toDateString(history.createdAt),
  })),
});

const mapCartFromBackend = (raw: Record<string, unknown>): Cart => {
  const items = asArray<Record<string, unknown>>(raw.items).map((item) => ({
    id: toNumber(item.id),
    productId: toNumber(item.productId),
    variantId: item.variantId ? toNumber(item.variantId) : null,
    productName: String(asRecord(item.product).name ?? "Sản phẩm"),
    productImage: String(asRecord(item.product).primaryImageUrl ?? ""),
    price: toNumber(item.unitPrice),
    quantity: toNumber(item.quantity, 1),
    selected: Boolean(item.selected),
  }));

  const summary = asRecord(raw.summary);

  return {
    items,
    totalItems: toNumber(summary.itemsCount, items.length),
  };
};

const mapCheckoutPreview = (raw: Record<string, unknown>): CheckoutPreview => ({
  items: asArray<Record<string, unknown>>(raw.items).map((item) => ({
    id: toNumber(item.id),
    productId: toNumber(item.productId),
    variantId: item.variantId ? toNumber(item.variantId) : null,
    productName: String(asRecord(item.product).name ?? "Sản phẩm"),
    productImage: String(asRecord(item.product).primaryImageUrl ?? ""),
    price: toNumber(item.unitPrice),
    quantity: toNumber(item.quantity, 1),
    selected: Boolean(item.selected),
  })),
  addresses: asArray<Record<string, unknown>>(raw.addresses).map((address) => ({
    id: toNumber(address.id),
    recipientName: String(address.recipientName ?? ""),
    phone: String(address.phone ?? ""),
    province: String(address.province ?? ""),
    district: String(address.district ?? ""),
    ward: String(address.ward ?? ""),
    detailAddress: String(address.detailAddress ?? ""),
    addressType: typeof address.addressType === "string" ? address.addressType : undefined,
    isDefault: Boolean(address.isDefault),
  })),
  paymentMethods: asArray<Record<string, unknown>>(raw.paymentMethods).map((method) => ({
    id: toNumber(method.id),
    code: String(method.methodCode ?? method.code ?? ""),
    name: String(method.methodName ?? method.name ?? ""),
    status: String(method.status ?? "active"),
  })),
  voucher: raw.voucher
    ? {
        code: String(asRecord(raw.voucher).code ?? ""),
        name: typeof asRecord(raw.voucher).name === "string" ? String(asRecord(raw.voucher).name) : undefined,
        discount: toNumber(asRecord(raw.voucher).discount),
      }
    : null,
  pricing: {
    subtotal: toNumber(asRecord(raw.pricing).subtotal),
    shippingFee: toNumber(asRecord(raw.pricing).shippingFee),
    discount: toNumber(asRecord(raw.pricing).discount),
    totalAmount: toNumber(asRecord(raw.pricing).totalAmount),
  },
});

const mapNotification = (raw: Record<string, unknown>): Notification => ({
  id: toNumber(raw.id),
  title: typeof raw.title === "string" ? raw.title : "Thong bao",
  content: typeof raw.content === "string" ? raw.content : String(raw.message ?? ""),
  message: typeof raw.content === "string" ? raw.content : String(raw.message ?? ""),
  notificationType:
    raw.notificationType === "promotion" ||
    raw.notificationType === "order" ||
    raw.notificationType === "system"
      ? raw.notificationType
      : "system",
  imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : null,
  isRead: Boolean(raw.isRead),
  createdAt: toDateString(raw.createdAt),
});

const mapWishlistItem = (raw: Record<string, unknown>): WishlistItem => ({
  id: toNumber(raw.id),
  productId: toNumber(raw.productId),
  productName: String(raw.productName ?? "Sản phẩm"),
  productImage: typeof raw.primaryImageUrl === "string" ? raw.primaryImageUrl : null,
  productPrice: toNumber(raw.basePrice ?? raw.productPrice),
  createdAt: raw.createdAt ? toDateString(raw.createdAt) : undefined,
});

const mapWishlistItems = (raw: unknown): WishlistItem[] => {
  if (Array.isArray(raw)) {
    return raw.map((item) => mapWishlistItem(asRecord(item)));
  }

  const root = asRecord(raw);
  return asArray<Record<string, unknown>>(root.items).map(mapWishlistItem);
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
  async getNotifications(token: string) {
    const response = await requestAuth<ApiResponse<unknown[]>>(
      API_ENDPOINTS.customer.notifications,
      token,
    );

    return {
      ...response,
      data: asArray<Record<string, unknown>>(response.data).map(mapNotification),
    };
  },

  async markNotificationRead(token: string, notificationId: number) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.customer.markNotificationRead(notificationId),
      token,
      { method: "PATCH" },
    );

    return {
      ...response,
      data: mapNotification(asRecord(response.data)),
    };
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
  async getWishlist(token: string) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.customer.wishlist,
      token,
    );

    return {
      ...response,
      data: mapWishlistItems(response.data),
    };
  },

  async addWishlistItem(token: string, productId: number) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.customer.addWishlistItem,
      token,
      { method: "POST", body: JSON.stringify({ productId }) },
    );

    return {
      ...response,
      data: mapWishlistItems(response.data),
    };
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

    return {
      ...response,
      data: mapCartFromBackend(asRecord(response.data)),
    };
  },

  async addCartItem(token: string, payload: AddCartItemPayload) {
    const response = await requestAuth<ApiResponse<unknown>>(API_ENDPOINTS.cart.addItem, token, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      ...response,
      data: mapCartFromBackend(asRecord(response.data)),
    };
  },

  async updateCartItem(token: string, cartItemId: number, payload: UpdateCartItemPayload) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.cart.updateItem(cartItemId),
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );

    return {
      ...response,
      data: mapCartFromBackend(asRecord(response.data)),
    };
  },

  async selectCartItem(token: string, cartItemId: number, payload: SelectCartItemPayload) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.cart.selectItem(cartItemId),
      token,
      { method: "PATCH", body: JSON.stringify(payload) },
    );

    return {
      ...response,
      data: mapCartFromBackend(asRecord(response.data)),
    };
  },

  deleteCartItem(token: string, cartItemId: number) {
    return requestAuth<ApiResponse<Cart>>(
      API_ENDPOINTS.cart.deleteItem(cartItemId),
      token,
      { method: "DELETE" },
    );
  },

  async getCartSummary(token: string) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.cart.summary,
      token,
    );

    const data = asRecord(response.data);
    return {
      ...response,
      data: {
        cartId: toNumber(data.cartId),
        selectedItemsCount: toNumber(data.selectedItemsCount),
        subtotal: toNumber(data.subtotal),
        totalAmount: toNumber(data.totalAmount),
      } satisfies CartSummary,
    };
  },
};

// ─── Checkout ─────────────────────────────────────────────

export const checkoutService = {
  async previewCheckout(token: string, payload?: CheckoutPreviewPayload) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.checkout.preview,
      token,
      { method: "POST", body: JSON.stringify(payload ?? {}) },
    );

    return {
      ...response,
      data: mapCheckoutPreview(asRecord(response.data)),
    };
  },

  async applyVoucher(token: string, payload: ApplyVoucherPayload) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.checkout.applyVoucher,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );

    return {
      ...response,
      data: mapCheckoutPreview(asRecord(response.data)),
    };
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
  async getMyOrders(token: string) {
    const response = await requestAuth<ApiResponse<unknown[]>>(
      API_ENDPOINTS.orders.myOrders,
      token,
    );

    return {
      ...response,
      data: asArray<Record<string, unknown>>(response.data).map(mapOrder),
    };
  },

  async getOrderDetail(token: string, orderId: number) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.orders.detail(orderId),
      token,
    );

    return {
      ...response,
      data: mapOrder(asRecord(response.data)),
    };
  },

  async cancelOrder(token: string, orderId: number) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.orders.cancel(orderId),
      token,
      { method: "POST" },
    );

    return {
      ...response,
      data: mapOrder(asRecord(response.data)),
    };
  },

  async getOrderTracking(token: string, orderId: number) {
    const response = await requestAuth<ApiResponse<unknown>>(
      API_ENDPOINTS.orders.tracking(orderId),
      token,
    );

    const data = asRecord(response.data);
    return {
      ...response,
      data: {
        shipment: data.shipment
          ? {
              id: toNumber(asRecord(data.shipment).id),
              carrierName:
                typeof asRecord(data.shipment).carrierName === "string"
                  ? String(asRecord(data.shipment).carrierName)
                  : null,
              trackingCode:
                typeof asRecord(data.shipment).trackingCode === "string"
                  ? String(asRecord(data.shipment).trackingCode)
                  : null,
              shippingType:
                typeof asRecord(data.shipment).shippingType === "string"
                  ? String(asRecord(data.shipment).shippingType)
                  : null,
              driverName:
                typeof asRecord(data.shipment).driverName === "string"
                  ? String(asRecord(data.shipment).driverName)
                  : typeof asRecord(data.shipment).driver_name === "string"
                    ? String(asRecord(data.shipment).driver_name)
                  : null,
              driverPhone:
                typeof asRecord(data.shipment).driverPhone === "string"
                  ? String(asRecord(data.shipment).driverPhone)
                  : typeof asRecord(data.shipment).driver_phone === "string"
                    ? String(asRecord(data.shipment).driver_phone)
                  : null,
              vehicleNumber:
                typeof asRecord(data.shipment).vehicleNumber === "string"
                  ? String(asRecord(data.shipment).vehicleNumber)
                  : typeof asRecord(data.shipment).vehicle_number === "string"
                    ? String(asRecord(data.shipment).vehicle_number)
                  : null,
              latitude: toNullableNumber(asRecord(data.shipment).latitude ?? asRecord(data.shipment).locationLat),
              longitude: toNullableNumber(asRecord(data.shipment).longitude ?? asRecord(data.shipment).locationLng),
              shipmentStatus: String(asRecord(data.shipment).shipmentStatus ?? "pending"),
              estimatedDeliveryAt:
                typeof asRecord(data.shipment).estimatedDeliveryAt === "string"
                  ? toDateString(asRecord(data.shipment).estimatedDeliveryAt)
                  : null,
              shippedAt:
                typeof asRecord(data.shipment).shippedAt === "string"
                  ? toDateString(asRecord(data.shipment).shippedAt)
                  : null,
              deliveredAt:
                typeof asRecord(data.shipment).deliveredAt === "string"
                  ? toDateString(asRecord(data.shipment).deliveredAt)
                  : null,
            }
          : null,
        destination: data.destination
          ? {
              recipientName:
                typeof asRecord(data.destination).recipientName === "string"
                  ? String(asRecord(data.destination).recipientName)
                  : null,
              phone:
                typeof asRecord(data.destination).phone === "string"
                  ? String(asRecord(data.destination).phone)
                  : null,
              address: String(asRecord(data.destination).address ?? ""),
              latitude: toNumber(asRecord(data.destination).latitude),
              longitude: toNumber(asRecord(data.destination).longitude),
            }
          : null,
        timeline: asArray<Record<string, unknown>>(data.timeline).map((item) => ({
          id: toNumber(item.id),
          status: String(item.status ?? "pending"),
          description: typeof item.description === "string" ? item.description : null,
          createdAt: toDateString(item.createdAt),
          timestamp: toDateString(item.createdAt),
        })),
      } satisfies OrderTracking,
    };
  },

  mockPaymentCallback(paymentId: number, payload: MockPaymentCallbackPayload) {
    return requestPublic<ApiResponse<unknown>>(
      API_ENDPOINTS.orders.mockPaymentCallback(paymentId),
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },
};
