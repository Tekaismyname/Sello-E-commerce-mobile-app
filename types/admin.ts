export interface AdminStatOverview {
  totalRevenue: string; // e.g. "1.284.000.000 ₫"
  revenueIncrease: string; // e.g. "+12.5%"
  newOrders: string; // e.g. "148 Đơn"
  outOfStockProducts: string; // e.g. "23 Mã"
}

export interface AdminRecentOrder {
  id: string; // "ORD-9902"
  name: string;
  time: string; // "2 phút trước"
  price: string;
  status: string;
  statusColor: string;
  statusText: string;
  image: string;
}

export interface AdminDashboardData {
  stats: AdminStatOverview;
  recentOrders: AdminRecentOrder[];
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  stock: string;
  image: string;
}

export interface AdminProductsData {
  products: AdminProduct[];
  totalCount: number;
}
