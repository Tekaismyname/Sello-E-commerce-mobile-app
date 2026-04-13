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
  ExportReportDto,
  UpdateOrderStatusDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  UpdateSystemConfigDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
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

  async updateSystemConfig(payload: UpdateSystemConfigDto) {
    return {
      message: 'System configuration updated successfully',
      data: await this.database.updateSystemConfig(payload),
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
