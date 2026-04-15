import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { JwtPayload } from '../auth/types/auth.types';
import { AdminService } from './admin.service';
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

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('system/dashboard')
  @Permissions('system:dashboard:read')
  getSystemDashboard() {
    return this.adminService.getSystemDashboard();
  }

  @Get('system/config-options')
  @Permissions('system:dashboard:read')
  getSystemConfigOptions() {
    return this.adminService.getSystemConfigOptions();
  }

  @Put('system/config')
  @Permissions('system:config:update')
  updateSystemConfig(@Body() payload: UpdateSystemConfigDto) {
    return this.adminService.updateSystemConfig(payload);
  }

  @Get('users')
  @Permissions('users:read')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get('users/:userId')
  @Permissions('users:read')
  getUserDetail(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.getUserDetail(userId);
  }

  @Patch('users/:userId/status')
  @Permissions('users:status:update')
  updateUserStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() payload: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(userId, payload);
  }

  @Patch('users/:userId/role')
  @Permissions('users:role:update')
  updateUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() payload: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, payload);
  }

  @Get('orders')
  @Permissions('orders:read')
  listOrders() {
    return this.adminService.listOrders();
  }

  @Get('orders/:orderId')
  @Permissions('orders:read')
  getOrderDetail(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.adminService.getOrderDetail(orderId);
  }

  @Patch('orders/:orderId/status')
  @Permissions('orders:update')
  updateOrderStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() payload: UpdateOrderStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.updateOrderStatus(
      orderId,
      payload,
      request.user!.sub,
    );
  }

  @Get('products')
  @Permissions('products:read')
  listProducts() {
    return this.adminService.listProducts();
  }

  @Get('products/:productId')
  @Permissions('products:read')
  getProductDetail(@Param('productId', ParseIntPipe) productId: number) {
    return this.adminService.getProductDetail(productId);
  }

  @Post('products')
  @Permissions('products:create')
  createProduct(@Body() payload: CreateProductDto) {
    return this.adminService.createProduct(payload);
  }

  @Put('products/:productId')
  @Permissions('products:update')
  updateProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() payload: UpdateProductDto,
  ) {
    return this.adminService.updateProduct(productId, payload);
  }

  @Patch('products/:productId/status')
  @Permissions('products:status:update')
  updateProductStatus(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() payload: UpdateProductStatusDto,
  ) {
    return this.adminService.updateProductStatus(productId, payload);
  }

  @Get('reports/overview')
  @Permissions('reports:read')
  getReportOverview() {
    return this.adminService.getReportOverview();
  }

  @Post('reports/export')
  @Permissions('reports:export')
  exportReport(@Body() payload: ExportReportDto) {
    return this.adminService.exportReport(payload);
  }
}
