import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  CreateAdminNotificationDto,
  CreateBrandDto,
  CreateCategoryDto,
  CreateVoucherDto,
  ExportReportDto,
  ModerateReviewDto,
  UpdateOrderStatusDto,
  UpdateBrandDto,
  UpdateBrandStatusDto,
  UpdateCategoryDto,
  UpdateCategoryStatusDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  UpdateSystemConfigDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UpdateVoucherDto,
  UpdateVoucherStatusDto,
  ProcessReturnDto,
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

  @Post('upload')
  @Permissions('products:create')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `product-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      status: 'success',
      url: `/uploads/${file.filename}`,
    };
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

  @Get('categories')
  @Permissions('categories:read')
  listCategories() {
    return this.adminService.listCategories();
  }

  @Post('categories')
  @Permissions('categories:create')
  createCategory(@Body() payload: CreateCategoryDto) {
    return this.adminService.createCategory(payload);
  }

  @Put('categories/:categoryId')
  @Permissions('categories:update')
  updateCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() payload: UpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(categoryId, payload);
  }

  @Patch('categories/:categoryId/status')
  @Permissions('categories:update')
  updateCategoryStatus(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() payload: UpdateCategoryStatusDto,
  ) {
    return this.adminService.updateCategoryStatus(categoryId, payload);
  }

  @Delete('categories/:categoryId')
  @Permissions('categories:delete')
  deleteCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.adminService.deleteCategory(categoryId);
  }

  @Get('brands')
  @Permissions('brands:read')
  listBrands() {
    return this.adminService.listBrands();
  }

  @Post('brands')
  @Permissions('brands:create')
  createBrand(@Body() payload: CreateBrandDto) {
    return this.adminService.createBrand(payload);
  }

  @Put('brands/:brandId')
  @Permissions('brands:update')
  updateBrand(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Body() payload: UpdateBrandDto,
  ) {
    return this.adminService.updateBrand(brandId, payload);
  }

  @Patch('brands/:brandId/status')
  @Permissions('brands:update')
  updateBrandStatus(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Body() payload: UpdateBrandStatusDto,
  ) {
    return this.adminService.updateBrandStatus(brandId, payload);
  }

  @Get('vouchers')
  @Permissions('vouchers:read')
  listVouchers() {
    return this.adminService.listVouchers();
  }

  @Post('vouchers')
  @Permissions('vouchers:create')
  createVoucher(@Body() payload: CreateVoucherDto) {
    return this.adminService.createVoucher(payload);
  }

  @Put('vouchers/:voucherId')
  @Permissions('vouchers:update')
  updateVoucher(
    @Param('voucherId', ParseIntPipe) voucherId: number,
    @Body() payload: UpdateVoucherDto,
  ) {
    return this.adminService.updateVoucher(voucherId, payload);
  }

  @Patch('vouchers/:voucherId/status')
  @Permissions('vouchers:update')
  updateVoucherStatus(
    @Param('voucherId', ParseIntPipe) voucherId: number,
    @Body() payload: UpdateVoucherStatusDto,
  ) {
    return this.adminService.updateVoucherStatus(voucherId, payload);
  }

  @Delete('vouchers/:voucherId')
  @Permissions('vouchers:delete')
  deleteVoucher(@Param('voucherId', ParseIntPipe) voucherId: number) {
    return this.adminService.deleteVoucher(voucherId);
  }

  @Get('notifications')
  @Permissions('notifications:read')
  listNotifications() {
    return this.adminService.listNotifications();
  }

  @Post('notifications')
  @Permissions('notifications:create')
  createNotification(@Body() payload: CreateAdminNotificationDto) {
    return this.adminService.createNotification(payload);
  }

  @Get('reviews')
  @Permissions('reviews:read')
  listReviews() {
    return this.adminService.listReviews();
  }

  @Patch('reviews/:reviewId/moderation')
  @Permissions('reviews:moderate')
  moderateReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() payload: ModerateReviewDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.moderateReview(
      reviewId,
      payload,
      request.user!.sub,
    );
  }

  @Get('users')
  @Permissions('users:read')
  listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listUsers(page, limit);
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
  listOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listOrders(page, limit);
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
  listProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listProducts(page, limit);
  }

  @Patch('orders/:orderId/return-status')
  @Permissions('orders:update')
  processOrderReturn(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() payload: ProcessReturnDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.adminService.processOrderReturn(
      orderId,
      payload,
      request.user!.sub,
    );
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
