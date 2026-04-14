import { API_BASE_URL_CANDIDATES, API_ENDPOINTS } from "@/constants/api";
import { AdminDashboardData, AdminProductsData, AdminProduct, AdminRecentOrder } from "@/types/admin";

async function requestAdmin<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  let response: Response | null = null;
  const triedBaseUrls: string[] = [];

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    triedBaseUrls.push(baseUrl);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          ...headers,
          ...(init?.headers as Record<string, string> ?? {}),
        },
      });
      break;
    } catch {
      continue;
    }
  }

  if (!response) {
    throw new Error(`Không thể kết nối backend cho dữ liệu admin. Đã thử: ${triedBaseUrls.join(", ")}.`);
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
      typeof payload.message === "string" ? payload.message : "Tải dữ liệu admin thất bại";
    throw new Error(message);
  }

  return payload as T;
}

export const adminService = {
  // ─── Dashboard ────────────────────────────────────────────
  async getDashboardData(token?: string): Promise<AdminDashboardData> {
    try {
      const response = await requestAdmin<any>(API_ENDPOINTS.admin.dashboard, token);
      const data = response?.data || {};

      return {
        stats: {
          totalRevenue: data.totalRevenue ? `${new Intl.NumberFormat("vi-VN").format(data.totalRevenue)} ₫` : "0 ₫",
          revenueIncrease: "+0%",
          newOrders: data.orders ? `${data.orders} Đơn` : "0 Đơn",
          outOfStockProducts: data.outOfStock ? `${data.outOfStock} Mã` : "0 Mã",
        },
        recentOrders: (data.recentOrders || []).map((order: any, index: number): AdminRecentOrder => {
          return {
            id: order.id || `ORD-00${index}`,
            name: order.name || `Đơn hàng #${index}`,
            time: order.createdAt || "Vừa xong",
            price: order.total ? `${new Intl.NumberFormat("vi-VN").format(order.total)} ₫` : "0 ₫",
            status: order.status || "Chờ xử lý",
            statusColor: "bg-[#F3E8FF]",
            statusText: "text-[#873DA6]",
            image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=150&q=80", 
          }
        }),
      };
    } catch (e) {
      console.warn("Lỗi tải dashboard admin, có thể thiếu Token xác thực", e);
      return {
        stats: {
          totalRevenue: "0 ₫",
          revenueIncrease: "0%",
          newOrders: "0 Đơn",
          outOfStockProducts: "0 Mã"
        },
        recentOrders: []
      }
    }
  },

  // ─── System Config ────────────────────────────────────────
  async updateSystemConfig(token: string, payload: {
    categoryStatuses?: Array<{ categoryId: number; status: "active" | "inactive" }>;
    paymentMethodStatuses?: Array<{ paymentMethodId: number; status: "active" | "inactive" }>;
    voucherStatuses?: Array<{ voucherId: number; isActive: boolean }>;
  }) {
    return requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateConfig,
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },

  // ─── User Management ─────────────────────────────────────
  async listUsers(token: string) {
    return requestAdmin<{ message: string; data: any[] }>(
      API_ENDPOINTS.admin.users,
      token,
    );
  },

  async getUserDetail(token: string, userId: number) {
    return requestAdmin<{ message: string; data: any }>(
      API_ENDPOINTS.admin.userDetail(userId),
      token,
    );
  },

  async updateUserStatus(token: string, userId: number, status: "active" | "blocked") {
    return requestAdmin<{ message: string; data: any }>(
      API_ENDPOINTS.admin.updateUserStatus(userId),
      token,
      { method: "PATCH", body: JSON.stringify({ status }) },
    );
  },

  async updateUserRole(token: string, userId: number, role: string, adminLevel?: number | null) {
    return requestAdmin<{ message: string; data: any }>(
      API_ENDPOINTS.admin.updateUserRole(userId),
      token,
      { method: "PATCH", body: JSON.stringify({ role, adminLevel }) },
    );
  },

  // ─── Order Management ────────────────────────────────────
  async listOrders(token: string) {
    return requestAdmin<{ message: string; data: any[] }>(
      API_ENDPOINTS.admin.orders,
      token,
    );
  },

  async getOrderDetail(token: string, orderId: number) {
    return requestAdmin<{ message: string; data: any }>(
      API_ENDPOINTS.admin.orderDetail(orderId),
      token,
    );
  },

  async updateOrderStatus(token: string, orderId: number, status: string, description?: string) {
    return requestAdmin<{ message: string; data: any }>(
      API_ENDPOINTS.admin.updateOrderStatus(orderId),
      token,
      { method: "PATCH", body: JSON.stringify({ status, description }) },
    );
  },

  // ─── Product Management ──────────────────────────────────
  async getProductsData(token?: string): Promise<AdminProductsData> {
    try {
      const response = await requestAdmin<any>(API_ENDPOINTS.admin.products, token);
      const data = response?.data || {};
      const list = Array.isArray(data) ? data : (data.items || []);

      return {
        totalCount: data.total || list.length,
        products: list.map((p: any, index: number): AdminProduct => ({
          id: p.id || `P-${index}`,
          name: p.name || `Sản phẩm ${index}`,
          category: p.categoryName || "Danh mục",
          stock: p.stock || "0",
          image: p.primaryImageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80",
        }))
      };
    } catch (e) {
      console.warn("Lỗi tải sản phẩm admin", e);
      return { totalCount: 0, products: [] };
    }
  },

  async createProduct(token: string, payload: {
    categoryId: number;
    brandId?: number | null;
    name: string;
    slug?: string;
    sku?: string;
    shortDescription?: string;
    description?: string;
    basePrice: number;
    comparePrice?: number | null;
    warrantyMonths?: number;
    status?: "draft" | "active" | "out_of_stock" | "inactive";
    images?: Array<{ imageUrl: string; isPrimary?: boolean; sortOrder?: number }>;
    variants?: Array<{
      skuVariant?: string;
      color?: string;
      size?: string;
      price: number;
      stockQty?: number;
      weight?: number | null;
      imageUrl?: string;
      status?: "active" | "inactive";
    }>;
  }) {
    return requestAdmin<{ message: string; data: any }>(
      API_ENDPOINTS.admin.createProduct,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  async updateProduct(token: string, productId: number, payload: {
    categoryId?: number;
    brandId?: number | null;
    name?: string;
    slug?: string;
    sku?: string;
    shortDescription?: string;
    description?: string;
    basePrice?: number;
    comparePrice?: number | null;
    warrantyMonths?: number;
    status?: "draft" | "active" | "out_of_stock" | "inactive";
    images?: Array<{ imageUrl: string; isPrimary?: boolean; sortOrder?: number }>;
    variants?: Array<{
      skuVariant?: string;
      color?: string;
      size?: string;
      price: number;
      stockQty?: number;
      weight?: number | null;
      imageUrl?: string;
      status?: "active" | "inactive";
    }>;
  }) {
    return requestAdmin<{ message: string; data: any }>(
      API_ENDPOINTS.admin.updateProduct(productId),
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },

  async updateProductStatus(token: string, productId: number, status: "draft" | "active" | "out_of_stock" | "inactive") {
    return requestAdmin<{ message: string; data: any }>(
      API_ENDPOINTS.admin.updateProductStatus(productId),
      token,
      { method: "PATCH", body: JSON.stringify({ status }) },
    );
  },

  // ─── Reports ──────────────────────────────────────────────
  async getReportOverview(token: string) {
    return requestAdmin<{ message: string; data: any }>(
      API_ENDPOINTS.admin.reportsOverview,
      token,
    );
  },

  async exportReport(token: string, reportType: "overview", format: "csv" | "json") {
    return requestAdmin<{ message: string; data: { fileName: string; filePath: string; mimeType: string } }>(
      API_ENDPOINTS.admin.exportReport,
      token,
      { method: "POST", body: JSON.stringify({ reportType, format }) },
    );
  },
};

