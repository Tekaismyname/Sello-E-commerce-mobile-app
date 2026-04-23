import { API_BASE_URL_CANDIDATES, API_ENDPOINTS } from "@/constants/api";
import {
  AdminCategory,
  AdminDashboardData,
  AdminExportedReport,
  AdminNotification,
  AdminOrder,
  AdminOrderStatus,
  AdminProduct,
  AdminProductImage,
  AdminProductsData,
  AdminRecentOrder,
  AdminReview,
  AdminReviewModerationStatus,
  AdminReportOverview,
  AdminUser,
  AdminVoucher,
  CreateAdminCategoryPayload,
  CreateAdminNotificationPayload,
  CreateAdminVoucherPayload,
  UpdateAdminCategoryPayload,
  UpdateAdminVoucherPayload,
} from "@/types/admin";

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
        headers.Authorization = `Bearer ${token}`;
      }

      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          ...headers,
          ...((init?.headers as Record<string, string> | undefined) ?? {}),
        },
      });
      break;
    } catch {
      continue;
    }
  }

  if (!response) {
    throw new Error(
      `Khong the ket noi backend cho du lieu admin. Da thu: ${triedBaseUrls.join(", ")}.`,
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
      typeof payload.message === "string" ? payload.message : "Tai du lieu admin that bai";
    throw new Error(message);
  }

  return payload as T;
}

const ensureArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapRecentOrder = (order: Record<string, unknown>, index: number): AdminRecentOrder => ({
  id: String(order.id ?? `ORD-00${index}`),
  name: String(order.name ?? order.orderCode ?? `Don hang #${index + 1}`),
  time: String(order.createdAt ?? order.placedAt ?? "Vua xong"),
  price: `${new Intl.NumberFormat("vi-VN").format(toNumber(order.total ?? order.totalAmount))} d`,
  status: String(order.status ?? order.orderStatus ?? "Cho xu ly"),
  statusColor: "bg-[#F3E8FF]",
  statusText: "text-[#873DA6]",
  image:
    String(order.image ?? "") ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80",
});

const mapProduct = (product: Record<string, unknown>, index: number): AdminProduct => {
  const variants = ensureArray<Record<string, unknown>>(product.variants).map((variant) => {
    const status: "active" | "inactive" | undefined =
      variant.status === "inactive" || variant.status === "active"
        ? variant.status
        : undefined;

    return {
      id: toNullableNumber(variant.id) ?? undefined,
      skuVariant: typeof variant.skuVariant === "string" ? variant.skuVariant : undefined,
      color: typeof variant.color === "string" ? variant.color : undefined,
      size: typeof variant.size === "string" ? variant.size : undefined,
      price: toNumber(variant.price),
      stockQty: toNullableNumber(variant.stockQty) ?? undefined,
      weight: toNullableNumber(variant.weight),
      imageUrl: typeof variant.imageUrl === "string" ? variant.imageUrl : undefined,
      status,
    };
  });

  return {
    id: String(product.id ?? `P-${index}`),
    productId: toNullableNumber(product.id) ?? undefined,
    name: String(product.name ?? `San pham ${index + 1}`),
    category: String(product.categoryName ?? product.category ?? "Danh muc"),
    categoryId: toNullableNumber(product.categoryId),
    brandName: typeof product.brandName === "string" ? product.brandName : null,
    stock: String(product.stockQty ?? product.stock ?? variants[0]?.stockQty ?? 0),
    stockQty: toNullableNumber(product.stockQty ?? product.stock) ?? undefined,
    image:
      String(product.primaryImageUrl ?? product.image ?? "") ||
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80",
    status:
      product.status === "draft" ||
      product.status === "active" ||
      product.status === "out_of_stock" ||
      product.status === "inactive"
        ? product.status
        : undefined,
    basePrice: toNullableNumber(product.basePrice) ?? undefined,
    comparePrice: toNullableNumber(product.comparePrice),
    description: typeof product.description === "string" ? product.description : undefined,
    brandId: toNullableNumber(product.brandId),
    sku: typeof product.sku === "string" ? product.sku : undefined,
    slug: typeof product.slug === "string" ? product.slug : null,
    shortDescription:
      typeof product.shortDescription === "string" ? product.shortDescription : undefined,
    warrantyMonths: toNullableNumber(product.warrantyMonths),
    images: ensureArray<Record<string, unknown>>(product.images).map(
      (image, index): AdminProductImage => ({
        id: toNullableNumber(image.id) ?? undefined,
        imageUrl: String(image.imageUrl ?? ""),
        isPrimary: Boolean(image.isPrimary),
        sortOrder: toNullableNumber(image.sortOrder) ?? index,
      }),
    ),
    variants,
  };
};

const mapUser = (user: Record<string, unknown>): AdminUser => ({
  id: toNumber(user.id),
  fullName: String(user.fullName ?? "Unknown User"),
  email: String(user.email ?? ""),
  phone: typeof user.phone === "string" ? user.phone : null,
  role: String(user.role ?? "customer"),
  adminLevel: toNullableNumber(user.adminLevel),
  status:
    user.status === "blocked" || user.status === "inactive" ? user.status : "active",
  isVerified: Boolean(user.isVerified),
  createdAt: typeof user.createdAt === "string" ? user.createdAt : undefined,
  updatedAt: typeof user.updatedAt === "string" ? user.updatedAt : undefined,
});

const mapOrder = (order: Record<string, unknown>): AdminOrder => ({
  id: toNumber(order.id),
  orderCode: String(order.orderCode ?? order.id ?? "N/A"),
  user: {
    id: toNumber(asRecord(order.user).id),
    fullName: String(asRecord(order.user).fullName ?? "Khach hang"),
    email: String(asRecord(order.user).email ?? ""),
  },
  paymentMethodName: String(order.paymentMethodName ?? "Khong ro"),
  totalAmount: toNumber(order.totalAmount ?? order.total),
  orderStatus:
    order.orderStatus === "confirmed" ||
    order.orderStatus === "packed" ||
    order.orderStatus === "shipping" ||
    order.orderStatus === "delivered" ||
    order.orderStatus === "cancelled" ||
    order.orderStatus === "returned"
      ? order.orderStatus
      : "pending",
  paymentStatus: String(order.paymentStatus ?? "pending"),
  placedAt: String(order.placedAt ?? order.createdAt ?? new Date().toISOString()),
  shippingAddress:
    typeof order.shippingAddress === "string" ? order.shippingAddress : undefined,
  items: ensureArray<Record<string, unknown>>(order.items).map((item) => ({
    id: toNullableNumber(item.id) ?? undefined,
    productName: String(item.productName ?? item.name ?? "San pham"),
    quantity: toNumber(item.quantity, 1),
    price: toNumber(item.price),
  })),
  statusHistory: ensureArray<Record<string, unknown>>(order.statusHistory).map((history) => ({
    status: String(history.status ?? "pending"),
    changedAt:
      typeof history.changedAt === "string" ? history.changedAt : undefined,
    description:
      typeof history.description === "string" ? history.description : undefined,
  })),
});

const mapCategory = (category: Record<string, unknown>): AdminCategory => ({
  id: toNumber(category.id ?? category.categoryId),
  name: String(category.name ?? ""),
  slug:
    typeof category.slug === "string"
      ? category.slug
      : typeof category.categorySlug === "string"
        ? category.categorySlug
        : null,
  imageUrl:
    typeof category.imageUrl === "string"
      ? category.imageUrl
      : typeof category.image_url === "string"
        ? category.image_url
        : null,
  parentId: toNullableNumber(category.parentId ?? category.parent_id),
  parentName:
    typeof category.parentName === "string"
      ? category.parentName
      : typeof category.parent_name === "string"
        ? category.parent_name
        : null,
  description: typeof category.description === "string" ? category.description : null,
  status: (category.status ?? category.categoryStatus) === "inactive" ? "inactive" : "active",
});

const mapVoucher = (voucher: Record<string, unknown>): AdminVoucher => ({
  id: toNumber(voucher.id ?? voucher.voucherId),
  code: String(voucher.code ?? ""),
  name: String(voucher.name ?? ""),
  description: typeof voucher.description === "string" ? voucher.description : null,
  voucherType:
    voucher.voucherType === "shipping" ||
    voucher.voucherType === "cashback" ||
    voucher.voucher_type === "shipping" ||
    voucher.voucher_type === "cashback"
      ? String(voucher.voucherType ?? voucher.voucher_type) as "shipping" | "cashback"
      : "product",
  discountType:
    (voucher.discountType ?? voucher.discount_type) === "percent" ? "percent" : "fixed",
  discountValue: toNumber(voucher.discountValue ?? voucher.discount_value),
  maxDiscountValue: toNullableNumber(voucher.maxDiscountValue ?? voucher.max_discount_value),
  minOrderValue: toNumber(voucher.minOrderValue ?? voucher.min_order_value),
  usageLimit: toNumber(voucher.usageLimit ?? voucher.usage_limit),
  usedCount: toNumber(voucher.usedCount ?? voucher.used_count),
  startAt:
    typeof voucher.startAt === "string"
      ? voucher.startAt
      : typeof voucher.start_at === "string"
        ? voucher.start_at
        : null,
  endAt:
    typeof voucher.endAt === "string"
      ? voucher.endAt
      : typeof voucher.end_at === "string"
        ? voucher.end_at
        : null,
  isActive: Boolean(voucher.isActive ?? voucher.is_active),
});

const mapNotification = (notification: Record<string, unknown>): AdminNotification => ({
  id: toNumber(notification.id ?? notification.notificationId),
  userId: toNullableNumber(notification.userId ?? notification.user_id),
  userName:
    typeof notification.userName === "string"
      ? notification.userName
      : typeof notification.user_name === "string"
        ? notification.user_name
        : null,
  title: String(notification.title ?? ""),
  content: String(notification.content ?? ""),
  notificationType:
    notification.notificationType === "promotion" ||
    notification.notificationType === "order" ||
    notification.notification_type === "promotion" ||
    notification.notification_type === "order"
      ? (String(
          notification.notificationType ?? notification.notification_type,
        ) as "promotion" | "order")
      : "system",
  imageUrl:
    typeof notification.imageUrl === "string"
      ? notification.imageUrl
      : typeof notification.image_url === "string"
        ? notification.image_url
        : null,
  createdAt:
    typeof notification.createdAt === "string"
      ? notification.createdAt
      : typeof notification.created_at === "string"
        ? notification.created_at
        : undefined,
});

const mapReview = (review: Record<string, unknown>): AdminReview => ({
  id: toNumber(review.id ?? review.reviewId),
  productId: toNumber(review.productId),
  productName: String(review.productName ?? "San pham"),
  userId: toNumber(review.userId),
  userName: String(review.userName ?? "Khach hang"),
  userEmail: String(review.userEmail ?? ""),
  rating: toNumber(review.rating),
  title: typeof review.title === "string" ? review.title : null,
  comment: typeof review.comment === "string" ? review.comment : null,
  isVerifiedPurchase: Boolean(review.isVerifiedPurchase),
  moderationStatus:
    review.moderationStatus === "hidden" || review.moderationStatus === "deleted"
      ? review.moderationStatus
      : "visible",
  moderationNote:
    typeof review.moderationNote === "string" ? review.moderationNote : null,
  moderatedBy: toNullableNumber(review.moderatedBy),
  moderatedAt:
    typeof review.moderatedAt === "string"
      ? review.moderatedAt
      : review.moderatedAt instanceof Date
        ? review.moderatedAt.toISOString()
        : null,
  mediaUrls: ensureArray<string>(review.mediaUrls),
  createdAt:
    typeof review.createdAt === "string"
      ? review.createdAt
      : review.createdAt instanceof Date
        ? review.createdAt.toISOString()
        : new Date().toISOString(),
});

export const adminService = {
  async getDashboardData(token?: string): Promise<AdminDashboardData> {
    const response = await requestAdmin<{ data?: Record<string, unknown> }>(
      API_ENDPOINTS.admin.dashboard,
      token,
    );
    const data = asRecord(response?.data);

    return {
      stats: {
        totalRevenue: `${new Intl.NumberFormat("vi-VN").format(toNumber(data.totalRevenue))} d`,
        revenueIncrease: String(data.revenueIncrease ?? "+0%"),
        newOrders: `${toNumber(data.orders)} Don`,
        outOfStockProducts: `${toNumber(data.outOfStock)} Ma`,
      },
      recentOrders: ensureArray<Record<string, unknown>>(data.recentOrders).map(mapRecentOrder),
      systemSummary: {
        users: toNumber(data.users),
        products: toNumber(data.products),
        ordersByStatus: asRecord(data.ordersByStatus) as Record<string, number>,
        revenue: toNumber(data.totalRevenue),
        vouchers: toNumber(data.vouchers),
        paymentMethods: toNumber(data.paymentMethods),
        notifications: toNumber(data.notifications),
      },
    };
  },

  async updateSystemConfig(
    token: string,
    payload: {
      categoryStatuses?: Array<{ categoryId: number; status: "active" | "inactive" }>;
      paymentMethodStatuses?: Array<{
        paymentMethodId: number;
        status: "active" | "inactive";
      }>;
      voucherStatuses?: Array<{ voucherId: number; isActive: boolean }>;
    },
  ) {
    return requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateConfig,
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },

  async getSystemConfigOptions(token: string) {
    return requestAdmin<{
      message: string;
      data: {
        categories: Array<{ id: number; name: string; status: string }>;
        paymentMethods: Array<{ id: number; code: string; name: string; status: string }>;
        vouchers: Array<{
          id: number;
          code: string;
          name: string;
          discountType: string;
          discountValue: number;
          minOrderValue: number;
          isActive: boolean;
        }>;
      };
    }>(API_ENDPOINTS.admin.systemConfigOptions, token);
  },

  async listCategories(token: string) {
    const response = await requestAdmin<{ message: string; data: unknown[] }>(
      API_ENDPOINTS.admin.categories,
      token,
    );

    return {
      ...response,
      data: ensureArray<Record<string, unknown>>(response.data).map(mapCategory),
    };
  },

  async createCategory(token: string, payload: CreateAdminCategoryPayload) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.createCategory,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );

    return {
      ...response,
      data: mapCategory(asRecord(response.data)),
    };
  },

  async updateCategory(token: string, categoryId: number, payload: UpdateAdminCategoryPayload) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateCategory(categoryId),
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );

    return {
      ...response,
      data: mapCategory(asRecord(response.data)),
    };
  },

  async updateCategoryStatus(token: string, categoryId: number, status: "active" | "inactive") {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateCategoryStatus(categoryId),
      token,
      { method: "PATCH", body: JSON.stringify({ status }) },
    );

    return {
      ...response,
      data: mapCategory(asRecord(response.data)),
    };
  },

  async deleteCategory(token: string, categoryId: number) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.deleteCategory(categoryId),
      token,
      { method: "DELETE" },
    );

    return {
      ...response,
      data: mapCategory(asRecord(response.data)),
    };
  },

  async listVouchers(token: string) {
    const response = await requestAdmin<{ message: string; data: unknown[] }>(
      API_ENDPOINTS.admin.vouchers,
      token,
    );

    return {
      ...response,
      data: ensureArray<Record<string, unknown>>(response.data).map(mapVoucher),
    };
  },

  async createVoucher(token: string, payload: CreateAdminVoucherPayload) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.createVoucher,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );

    return {
      ...response,
      data: mapVoucher(asRecord(response.data)),
    };
  },

  async updateVoucher(token: string, voucherId: number, payload: UpdateAdminVoucherPayload) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateVoucher(voucherId),
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );

    return {
      ...response,
      data: mapVoucher(asRecord(response.data)),
    };
  },

  async updateVoucherStatus(token: string, voucherId: number, isActive: boolean) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateVoucherStatus(voucherId),
      token,
      { method: "PATCH", body: JSON.stringify({ isActive }) },
    );

    return {
      ...response,
      data: mapVoucher(asRecord(response.data)),
    };
  },

  async deleteVoucher(token: string, voucherId: number) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.deleteVoucher(voucherId),
      token,
      { method: "DELETE" },
    );

    return {
      ...response,
      data: mapVoucher(asRecord(response.data)),
    };
  },

  async listNotifications(token: string) {
    const response = await requestAdmin<{ message: string; data: unknown[] }>(
      API_ENDPOINTS.admin.notifications,
      token,
    );

    return {
      ...response,
      data: ensureArray<Record<string, unknown>>(response.data).map(mapNotification),
    };
  },

  async createNotification(token: string, payload: CreateAdminNotificationPayload) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.createNotification,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );

    return {
      ...response,
      data: mapNotification(asRecord(response.data)),
    };
  },

  async listReviews(token: string) {
    const response = await requestAdmin<{ message: string; data: unknown[] }>(
      API_ENDPOINTS.admin.reviews,
      token,
    );

    return {
      ...response,
      data: ensureArray<Record<string, unknown>>(response.data).map(mapReview),
    };
  },

  async moderateReview(
    token: string,
    reviewId: number,
    moderationStatus: AdminReviewModerationStatus,
    moderationNote?: string,
  ) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.moderateReview(reviewId),
      token,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: moderationStatus,
          note: moderationNote?.trim() ? moderationNote.trim() : undefined,
        }),
      },
    );

    return {
      ...response,
      data: mapReview(asRecord(response.data)),
    };
  },

  async listUsers(token: string) {
    const response = await requestAdmin<{ message: string; data: unknown[] }>(
      API_ENDPOINTS.admin.users,
      token,
    );

    return {
      ...response,
      data: ensureArray<Record<string, unknown>>(response.data).map(mapUser),
    };
  },

  async getUserDetail(token: string, userId: number) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.userDetail(userId),
      token,
    );

    return {
      ...response,
      data: mapUser(asRecord(response.data)),
    };
  },

  async updateUserStatus(token: string, userId: number, status: "active" | "blocked") {
    return requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateUserStatus(userId),
      token,
      { method: "PATCH", body: JSON.stringify({ status }) },
    );
  },

  async updateUserRole(token: string, userId: number, role: string, adminLevel?: number | null) {
    return requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateUserRole(userId),
      token,
      { method: "PATCH", body: JSON.stringify({ role, adminLevel }) },
    );
  },

  async listOrders(token: string) {
    const response = await requestAdmin<{ message: string; data: unknown[] }>(
      API_ENDPOINTS.admin.orders,
      token,
    );

    return {
      ...response,
      data: ensureArray<Record<string, unknown>>(response.data).map(mapOrder),
    };
  },

  async getOrderDetail(token: string, orderId: number) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.orderDetail(orderId),
      token,
    );

    return {
      ...response,
      data: mapOrder(asRecord(response.data)),
    };
  },

  async updateOrderStatus(
    token: string,
    orderId: number,
    status: AdminOrderStatus,
    description?: string,
  ) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateOrderStatus(orderId),
      token,
      {
        method: "PATCH",
        body: JSON.stringify({ status, description }),
      },
    );

    return {
      ...response,
      data: mapOrder(asRecord(response.data)),
    };
  },

  async getProductsData(token?: string): Promise<AdminProductsData> {
    const response = await requestAdmin<{ data?: unknown }>(API_ENDPOINTS.admin.products, token);
    const data = response?.data;
    const list = Array.isArray(data)
      ? data
      : ensureArray<Record<string, unknown>>(asRecord(data).items);
    const total = Array.isArray(data)
      ? list.length
      : toNumber(asRecord(data).total, list.length);

    return {
      totalCount: total,
      products: list.map((item, index) => mapProduct(asRecord(item), index)),
    };
  },

  async createProduct(
    token: string,
    payload: {
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
    },
  ) {
    return requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.createProduct,
      token,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  async updateProduct(
    token: string,
    productId: number,
    payload: {
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
    },
  ) {
    return requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateProduct(productId),
      token,
      { method: "PUT", body: JSON.stringify(payload) },
    );
  },

  async updateProductStatus(
    token: string,
    productId: number,
    status: "draft" | "active" | "out_of_stock" | "inactive",
  ) {
    return requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.updateProductStatus(productId),
      token,
      { method: "PATCH", body: JSON.stringify({ status }) },
    );
  },

  async getProductDetail(token: string, productId: number) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.productDetail(productId),
      token,
    );

    return {
      ...response,
      data: mapProduct(asRecord(response.data), 0),
    };
  },

  async getReportOverview(token: string) {
    const response = await requestAdmin<{ message: string; data: unknown }>(
      API_ENDPOINTS.admin.reportsOverview,
      token,
    );
    const data = asRecord(response.data);

    return {
      ...response,
      data: {
        users: toNumber(data.users),
        orders: toNumber(data.orders),
        revenueByPeriod: ensureArray<Record<string, unknown>>(data.revenueByPeriod).map((item) => ({
          period: String(item.period ?? "N/A"),
          revenue: toNumber(item.revenue),
        })),
        topSellingProducts: ensureArray<Record<string, unknown>>(data.topSellingProducts).map(
          (item) => ({
            productId: toNumber(item.productId),
            name: String(item.name ?? "San pham"),
            totalSold: toNumber(item.totalSold),
          }),
        ),
        orderStatusDistribution: ensureArray<Record<string, unknown>>(
          data.orderStatusDistribution,
        ).map((item) => ({
          status: String(item.status ?? "unknown"),
          total: toNumber(item.total),
        })),
      } satisfies AdminReportOverview,
    };
  },

  async exportReport(token: string, reportType: "overview", format: "csv" | "json") {
    const response = await requestAdmin<{
      message: string;
      data: Record<string, unknown>;
    }>(API_ENDPOINTS.admin.exportReport, token, {
      method: "POST",
      body: JSON.stringify({ reportType, format }),
    });

    return {
      ...response,
      data: {
        fileName: String(response.data.fileName ?? "report"),
        filePath: String(response.data.filePath ?? ""),
        mimeType: String(response.data.mimeType ?? "application/octet-stream"),
      } satisfies AdminExportedReport,
    };
  },
};
