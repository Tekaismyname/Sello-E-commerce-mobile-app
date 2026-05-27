export interface AdminStatOverview {
  totalRevenue: string;
  revenueIncrease: string;
  newOrders: string;
  outOfStockProducts: string;
}

export interface AdminRecentOrder {
  id: string;
  name: string;
  time: string;
  price: string;
  status: string;
  statusColor: string;
  statusText: string;
  image: string;
}

export interface AdminSystemSummary {
  users: number;
  products: number;
  ordersByStatus: Record<string, number>;
  revenue: number;
  vouchers: number;
  paymentMethods: number;
  notifications: number;
}

export interface AdminDashboardData {
  stats: AdminStatOverview;
  recentOrders: AdminRecentOrder[];
  systemSummary?: AdminSystemSummary;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
  parentId?: number | null;
  parentName?: string | null;
  description?: string | null;
  status: "active" | "inactive";
  productCount?: number;
  childCount?: number;
}

export interface AdminBrand {
  id: number;
  name: string;
  slug?: string | null;
  logoUrl?: string | null;
  status: "active" | "inactive";
}

export interface AdminVoucher {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  voucherType: "product" | "shipping" | "cashback";
  discountType: "percent" | "fixed";
  discountValue: number;
  maxDiscountValue?: number | null;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  startAt?: string | null;
  endAt?: string | null;
  isActive: boolean;
}

export interface AdminNotification {
  id: number;
  userId?: number | null;
  userName?: string | null;
  userEmail?: string | null;
  title: string;
  content: string;
  notificationType: "promotion" | "order" | "system";
  imageUrl?: string | null;
  isRead?: boolean;
  createdAt?: string;
}

export interface AdminReview {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  userEmail: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isVerifiedPurchase: boolean;
  moderationStatus: "visible" | "hidden" | "deleted";
  moderationNote?: string | null;
  moderatedBy?: number | null;
  moderatedAt?: string | null;
  mediaUrls: string[];
  createdAt: string;
}

export interface AdminProductVariant {
  id?: number;
  skuVariant?: string;
  color?: string;
  size?: string;
  price: number;
  stockQty?: number;
  weight?: number | null;
  imageUrl?: string;
  status?: "active" | "inactive";
}

export interface AdminProductImage {
  id?: number;
  imageUrl: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface AdminProduct {
  id: string;
  productId?: number;
  name: string;
  category: string;
  categoryId?: number | null;
  brandName?: string | null;
  stock: string;
  stockQty?: number;
  image: string;
  status?: "draft" | "active" | "out_of_stock" | "inactive";
  basePrice?: number;
  comparePrice?: number | null;
  description?: string;
  brandId?: number | null;
  sku?: string;
  slug?: string | null;
  shortDescription?: string;
  warrantyMonths?: number | null;
  images?: AdminProductImage[];
  variants?: AdminProductVariant[];
}

export interface AdminProductsData {
  products: AdminProduct[];
  totalCount: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  adminLevel?: number | null;
  status: "active" | "blocked" | "inactive";
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminOrderUser {
  id: number;
  fullName: string;
  email: string;
}

export interface AdminOrderStatusHistory {
  status: string;
  changedAt?: string;
  description?: string;
}

export interface AdminOrder {
  id: number;
  orderCode: string;
  user: AdminOrderUser;
  paymentMethodName: string;
  totalAmount: number;
  orderStatus: AdminOrderStatus;
  paymentStatus: string;
  placedAt: string;
  shippingAddress?: string;
  items?: {
    id?: number;
    productName: string;
    quantity: number;
    price: number;
    productImage?: string | null;
  }[];
  statusHistory?: AdminOrderStatusHistory[];
}

export type AdminOrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "returned"
  | "return_requested";

export type AdminReviewModerationStatus = "visible" | "hidden" | "deleted";

export interface AdminReportOverview {
  users: number;
  orders: number;
  revenueByPeriod: { period: string; revenue: number }[];
  topSellingProducts: { productId: number; name: string; totalSold: number }[];
  orderStatusDistribution: { status: string; total: number }[];
}

export interface AdminExportedReport {
  fileName: string;
  filePath: string;
  mimeType: string;
}

export interface CreateAdminCategoryPayload {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  parentId?: number | null;
  description?: string | null;
  status?: "active" | "inactive";
}

export interface UpdateAdminCategoryPayload {
  name?: string;
  slug?: string | null;
  imageUrl?: string | null;
  parentId?: number | null;
  description?: string | null;
  status?: "active" | "inactive";
}

export interface CreateAdminBrandPayload {
  name: string;
  slug?: string | null;
  logoUrl?: string | null;
  status?: "active" | "inactive";
}

export interface UpdateAdminBrandPayload {
  name?: string;
  slug?: string | null;
  logoUrl?: string | null;
  status?: "active" | "inactive";
}

export interface CreateAdminVoucherPayload {
  code: string;
  name: string;
  description?: string | null;
  voucherType: "product" | "shipping" | "cashback";
  discountType: "percent" | "fixed";
  discountValue: number;
  maxDiscountValue?: number | null;
  minOrderValue?: number;
  usageLimit?: number;
  startAt?: string | null;
  endAt?: string | null;
  isActive?: boolean;
}

export interface UpdateAdminVoucherPayload {
  code?: string;
  name?: string;
  description?: string | null;
  voucherType?: "product" | "shipping" | "cashback";
  discountType?: "percent" | "fixed";
  discountValue?: number;
  maxDiscountValue?: number | null;
  minOrderValue?: number;
  usageLimit?: number;
  startAt?: string | null;
  endAt?: string | null;
  isActive?: boolean;
}

export interface CreateAdminNotificationPayload {
  title: string;
  content: string;
  targetScope: "all_users" | "customer_only" | "admin_only";
  notificationType?: "promotion" | "order" | "system";
  imageUrl?: string | null;
}
