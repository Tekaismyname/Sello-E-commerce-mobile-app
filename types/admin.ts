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
  orderStatus:
    | "pending"
    | "confirmed"
    | "packed"
    | "shipping"
    | "delivered"
    | "cancelled"
    | "returned";
  paymentStatus: string;
  placedAt: string;
  shippingAddress?: string;
  items?: Array<{
    id?: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
  statusHistory?: AdminOrderStatusHistory[];
}

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
