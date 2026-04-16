// ─── Profile ──────────────────────────────────────────────
export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
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
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Wishlist ─────────────────────────────────────────────
export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
}

// ─── Review ───────────────────────────────────────────────
export interface CreateReviewPayload {
  productId: number;
  rating: number;
  title?: string;
  comment?: string;
  media?: { mediaUrl: string; mediaType?: "image" | "video" }[];
}

// ─── Cart ─────────────────────────────────────────────────
export interface CartItem {
  id: number;
  cartId?: number;
  productId: number;
  variantId: number | null;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selected: boolean;
  variantLabel?: string | null;
  availableStock?: number;
}

export interface Cart {
  cartId?: number;
  items: CartItem[];
  totalItems: number;
  selectedItems: number;
  subtotal: number;
  total: number;
}

export interface CartSummary {
  totalItems: number;
  selectedItems: number;
  subtotal: number;
  discount: number;
  total: number;
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
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  voucher?: { code: string; discountAmount: number } | null;
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

export interface CreateOrderResult {
  orderId: number;
  orderCode: string;
  paymentId: number;
  paymentType: "cod" | "online";
  paymentStatus: string;
  orderStatus: OrderStatus;
  paymentUrl?: string;
}

// ─── Order ────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderItem {
  id: number;
  productId: number;
  variantId?: number | null;
  productName: string;
  productImage?: string;
  variantLabel?: string | null;
  quantity: number;
  price: number;
  lineTotal?: number;
}

export interface OrderSummary {
  id: number;
  orderCode: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  paymentStatus?: string;
  createdAt: string;
}

export interface OrderTimelineEvent {
  id?: number;
  status: string;
  description: string;
  updatedBy?: number | null;
  timestamp: string;
}

export interface OrderTracking {
  shipment: {
    id: number;
    carrierName?: string | null;
    trackingCode?: string | null;
    shippingType?: string | null;
    shipmentStatus?: string | null;
    estimatedDeliveryAt?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
  } | null;
  timeline: OrderTimelineEvent[];
}

export interface OrderDetail extends OrderSummary {
  note?: string | null;
  items: OrderItem[];
  payment?: {
    id: number;
    paymentMethodId: number;
    amount: number;
    transactionCode?: string | null;
    paymentStatus: string;
    paidAt?: string | null;
    failReason?: string | null;
  } | null;
  shipment?: {
    id: number;
    carrierName?: string | null;
    trackingCode?: string | null;
    shippingType?: string | null;
    shipmentStatus?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
  } | null;
  statusHistory?: OrderTimelineEvent[];
}

export interface MockPaymentCallbackPayload {
  result: "success" | "failed";
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
