import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MySqlDatabaseService } from '../auth/services/mysql-database.service';
import {
  CreateProductDto,
  CreateAdminNotificationDto,
  CreateCategoryDto,
  CreateVoucherDto,
  ExportReportDto,
  ModerateReviewDto,
  UpdateOrderStatusDto,
  UpdateCategoryDto,
  UpdateCategoryStatusDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  UpdateSystemConfigDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UpdateVoucherDto,
  UpdateVoucherStatusDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly database: MySqlDatabaseService) {}

  async getSystemDashboard() {
    return {
      message: 'System dashboard fetched successfully',
      data: await this.database.getAdminDashboard(),
    };
  }

  async getSystemConfigOptions() {
    return {
      message: 'System config options fetched successfully',
      data: await this.database.getAdminSystemConfigOptions(),
    };
  }

  async updateSystemConfig(payload: UpdateSystemConfigDto) {
    return {
      message: 'System configuration updated successfully',
      data: await this.database.updateSystemConfig(payload),
    };
  }

  async listCategories() {
    return {
      message: 'Categories fetched successfully',
      data: await this.database.listAdminCategories(),
    };
  }

  async createCategory(payload: CreateCategoryDto) {
    const category = await this.database.createAdminCategory(payload);

    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  async updateCategory(categoryId: number, payload: UpdateCategoryDto) {
    const category = await this.database.updateAdminCategory(categoryId, payload);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category updated successfully',
      data: category,
    };
  }

  async updateCategoryStatus(
    categoryId: number,
    payload: UpdateCategoryStatusDto,
  ) {
    const category = await this.database.updateAdminCategoryStatus(
      categoryId,
      payload.status,
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category status updated successfully',
      data: category,
    };
  }

  async deleteCategory(categoryId: number) {
    const category = await this.database.updateAdminCategoryStatus(
      categoryId,
      'inactive',
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category deleted successfully',
      data: category,
    };
  }

  async listVouchers() {
    return {
      message: 'Vouchers fetched successfully',
      data: await this.database.listAdminVouchers(),
    };
  }

  async createVoucher(payload: CreateVoucherDto) {
    const voucher = await this.database.createAdminVoucher(payload);

    return {
      message: 'Voucher created successfully',
      data: voucher,
    };
  }

  async updateVoucher(voucherId: number, payload: UpdateVoucherDto) {
    const voucher = await this.database.updateAdminVoucher(voucherId, payload);

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    return {
      message: 'Voucher updated successfully',
      data: voucher,
    };
  }

  async updateVoucherStatus(
    voucherId: number,
    payload: UpdateVoucherStatusDto,
  ) {
    const voucher = await this.database.updateAdminVoucherStatus(
      voucherId,
      payload.isActive,
    );

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    return {
      message: 'Voucher status updated successfully',
      data: voucher,
    };
  }

  async deleteVoucher(voucherId: number) {
    const voucher = await this.database.updateAdminVoucherStatus(voucherId, false);

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    return {
      message: 'Voucher deleted successfully',
      data: voucher,
    };
  }

  async listNotifications() {
    return {
      message: 'Notifications fetched successfully',
      data: await this.database.listAdminNotifications(),
    };
  }

  async createNotification(payload: CreateAdminNotificationDto) {
    const result = await this.database.createAdminNotification(payload);

    return {
      message: 'Notification sent successfully',
      data: result,
    };
  }

  async listReviews() {
    return {
      message: 'Reviews fetched successfully',
      data: await this.database.listAdminReviews(),
    };
  }

  async moderateReview(
    reviewId: number,
    payload: ModerateReviewDto,
    adminUserId: number,
  ) {
    const review = await this.database.moderateAdminReview(
      reviewId,
      payload,
      adminUserId,
    );

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return {
      message: 'Review moderation updated successfully',
      data: review,
    };
  }

  async listUsers() {
    return {
      message: 'Users fetched successfully',
      data: await this.database.listAdminUsers(),
    };
  }

  async getUserDetail(userId: number) {
    const user = await this.database.getAdminUserDetail(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User detail fetched successfully',
      data: user,
    };
  }

  async updateUserStatus(userId: number, payload: UpdateUserStatusDto) {
    const user = await this.database.updateAdminUserStatus(userId, payload.status);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User status updated successfully',
      data: user,
    };
  }

  async updateUserRole(userId: number, payload: UpdateUserRoleDto) {
    if (payload.role === 'admin' && !payload.adminLevel) {
      throw new BadRequestException('adminLevel is required for admin role');
    }

    const user = await this.database.updateAdminUserRole(
      userId,
      payload.role,
      payload.adminLevel ?? null,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User role updated successfully',
      data: user,
    };
  }

  async listOrders() {
    return {
      message: 'Orders fetched successfully',
      data: await this.database.listAdminOrders(),
    };
  }

  async getOrderDetail(orderId: number) {
    const order = await this.database.getAdminOrderDetail(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order detail fetched successfully',
      data: order,
    };
  }

  async updateOrderStatus(
    orderId: number,
    payload: UpdateOrderStatusDto,
    adminUserId: number,
  ) {
    const order = await this.database.updateAdminOrderStatus(
      orderId,
      payload.status,
      adminUserId,
      payload.description,
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order status updated successfully',
      data: order,
    };
  }

  async listProducts() {
    return {
      message: 'Products fetched successfully',
      data: await this.database.listAdminProducts(),
    };
  }

  async getProductDetail(productId: number) {
    const product = await this.database.getAdminProductDetail(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product detail fetched successfully',
      data: product,
    };
  }

  async createProduct(payload: CreateProductDto) {
    const productId = await this.database.createAdminProduct(payload);
    const product = await this.database.getAdminProductDetail(productId);

    return {
      message: 'Product created successfully',
      data: product,
    };
  }

  async updateProduct(productId: number, payload: UpdateProductDto) {
    const product = await this.database.updateAdminProduct(productId, payload);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product updated successfully',
      data: product,
    };
  }

  async updateProductStatus(
    productId: number,
    payload: UpdateProductStatusDto,
  ) {
    const product = await this.database.updateAdminProductStatus(
      productId,
      payload.status,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product status updated successfully',
      data: product,
    };
  }

  async getReportOverview() {
    return {
      message: 'Report overview fetched successfully',
      data: await this.database.getReportOverview(),
    };
  }

  async exportReport(payload: ExportReportDto) {
    if (payload.reportType !== 'overview') {
      throw new BadRequestException('Unsupported report type');
    }

    const reportData = await this.database.getReportOverview();
    const exportsDirectory = join(process.cwd(), 'exports');

    await mkdir(exportsDirectory, { recursive: true });

    if (payload.format === 'json') {
      const fileName = `report-overview-${Date.now()}.json`;
      const filePath = join(exportsDirectory, fileName);
      const content = JSON.stringify(reportData, null, 2);

      await writeFile(filePath, content, 'utf8');

      return {
        message: 'Report exported successfully',
        data: {
          fileName,
          filePath,
          mimeType: 'application/json',
        },
      };
    }

    const csvLines = [
      'section,key,value',
      `summary,users,${reportData.users}`,
      `summary,orders,${reportData.orders}`,
      ...reportData.revenueByPeriod.map(
        (row) => `revenue,${row.period},${row.revenue}`,
      ),
      ...reportData.topSellingProducts.map(
        (row) => `top_selling,${row.name},${row.totalSold}`,
      ),
      ...reportData.orderStatusDistribution.map(
        (row) => `order_status,${row.status},${row.total}`,
      ),
    ];
    const fileName = `report-overview-${Date.now()}.csv`;
    const filePath = join(exportsDirectory, fileName);

    await writeFile(filePath, csvLines.join('\n'), 'utf8');

    return {
      message: 'Report exported successfully',
      data: {
        fileName,
        filePath,
        mimeType: 'text/csv',
      },
    };
  }
}
