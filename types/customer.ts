// ─── Profile ──────────────────────────────────────────────
export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  gender?: "male" | "female" | "other" | null;
  birthDate?: string | null;
  emailOptIn?: boolean;
  role: string;
  adminLevel: number | null;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  avatarUrl?: string;
  gender?: "male" | "female" | "other";
  birthDate?: string;
  emailOptIn?: boolean;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ─── Address ──────────────────────────────────────────────
export interface Address {
  id: number;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  addressType?: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface CreateAddressPayload {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  addressType?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface UpdateAddressPayload {
  recipientName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  detailAddress?: string;
  addressType?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

// ─── Notification ─────────────────────────────────────────
export interface Notification {
  id: number;
  title: string;
  content: string;
  message?: string;
  notificationType?: "promotion" | "order" | "system";
  imageUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

// ─── Wishlist ─────────────────────────────────────────────
export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string | null;
  productPrice: number;
  createdAt?: string;
}

// ─── Review ───────────────────────────────────────────────
export interface CreateReviewPayload {
  productId: number;
  rating: number;
  title?: string;
  comment?: string;
  media?: Array<{ mediaUrl: string; mediaType?: "image" | "video" }>;
}

// ─── Cart ─────────────────────────────────────────────────
export interface CartItem {
  id: number;
  productId: number;
  variantId?: number | null;
  productName: string;
  productImage: string;
  variantLabel?: string | null;
  price: number;
  quantity: number;
  selected: boolean;
  availableStock?: number | null;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
}

export interface CartSummary {
  cartId?: number;
  totalItems?: number;
  selectedItems?: number;
  selectedItemsCount?: number;
  subtotal: number;
  discount?: number;
  total?: number;
  totalAmount?: number;
}

export interface AddCartItemPayload {
  productId: number;
  variantId?: number | null;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface SelectCartItemPayload {
  selected: boolean;
}

// ─── Checkout ─────────────────────────────────────────────
export interface CheckoutPreview {
  items: CartItem[];
  addresses: Address[];
  paymentMethods: Array<{
    id: number;
    code: string;
    name: string;
    status: string;
  }>;
  voucher?: { code: string; name?: string; discount: number } | null;
  pricing: {
    subtotal: number;
    shippingFee: number;
    discount: number;
    totalAmount: number;
  };
}

export interface CheckoutPreviewPayload {
  voucherCode?: string;
}

export interface ApplyVoucherPayload {
  code: string;
}

export interface CreateOrderPayload {
  addressId: number;
  paymentMethodId: number;
  voucherCode?: string;
  note?: string;
}

// ─── Order ────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "returned"
  | "return_requested";

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  variantId?: number | null;
  variantLabel?: string | null;
  variantSnapshot?: string | null;
  quantity: number;
  price: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface OrderStatusEvent {
  id: number;
  status: string;
  description: string | null;
  reasonCode?: string | null;
  updatedBy?: number | null;
  createdAt: string;
  timestamp: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  orderCode?: string;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  paymentStatus?: string;
  note?: string | null;
  shippingAddress?: string;
  payment?: {
    id: number;
    paymentMethodId: number;
    methodCode?: string | null;
    methodName?: string | null;
    amount: number;
    transactionCode: string | null;
    paymentStatus: string;
    paidAt: string | null;
    failReason: string | null;
    paymentUrl?: string;
    qrPayload?: string;
    qrCodeUrl?: string;
  } | null;
  shipment?: {
    id: number;
    carrierName: string | null;
    trackingCode: string | null;
    shippingType: string | null;
    driverName?: string | null;
    driverPhone?: string | null;
    vehicleNumber?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    shipmentStatus: string;
    shippedAt: string | null;
    deliveredAt: string | null;
  } | null;
  statusHistory?: OrderStatusEvent[];
  items: OrderItem[];
}

export interface OrderDetail extends Order {}

export interface OrderTracking {
  shipment: {
    id: number;
    carrierName: string | null;
    trackingCode: string | null;
    shippingType: string | null;
    driverName?: string | null;
    driverPhone?: string | null;
    vehicleNumber?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    shipmentStatus: string;
    estimatedDeliveryAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  } | null;
  destination?: {
    recipientName?: string | null;
    phone?: string | null;
    address: string;
    latitude: number;
    longitude: number;
    source?: string | null;
  } | null;
  map?: {
    origin: {
      label?: string;
      latitude: number;
      longitude: number;
    };
    destination: {
      label?: string;
      recipientName?: string | null;
      phone?: string | null;
      address: string;
      latitude: number;
      longitude: number;
      source?: string | null;
    };
    route: {
      provider: string;
      status: string;
      distanceMeters: number | null;
      durationSeconds: number | null;
      geometry?: {
        type: "LineString";
        coordinates: number[][];
      } | null;
    };
    attribution?: string;
  } | null;
  timeline: OrderStatusEvent[];
}

export interface MockPaymentCallbackPayload {
  result: "success" | "failed";
}

export interface MockPaymentStatus {
  paymentId: number;
  orderId: number;
  orderCode: string;
  amount: number;
  paymentStatus: string;
  orderStatus: string;
  orderPaymentStatus: string;
  paidAt: string | null;
  failReason: string | null;
  expiresAt: string | null;
}

// ─── Product Detail (Public) ──────────────────────────────
export interface ProductVariant {
  id: number;
  skuVariant?: string;
  color?: string;
  size?: string;
  price: number;
  stockQty: number;
  imageUrl?: string;
  status: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description?: string;
  basePrice: number;
  comparePrice?: number | null;
  warrantyMonths?: number;
  status: string;
  categoryId: number;
  categoryName?: string;
  brand?: { id: number; name: string } | null;
  images: ProductImage[];
  variants: ProductVariant[];
  primaryImageUrl?: string | null;
  averageRating?: number;
  totalReviews?: number;
}

// ─── Generic API Response ─────────────────────────────────
export interface ApiResponse<T> {
  message: string;
  data: T;
}
