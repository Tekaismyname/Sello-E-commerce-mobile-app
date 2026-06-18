import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { MySqlDatabaseService } from '../auth/services/mysql-database.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryStatusDto,
  CreateVoucherDto,
  UpdateVoucherDto,
  UpdateVoucherStatusDto,
  ModerateReviewDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  UpdateOrderStatusDto,
  ProcessReturnDto,
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  ExportReportDto,
} from './dto/admin.dto';

// Mock node:fs/promises to avoid writing files to disk during tests
jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

const mockMySqlDatabaseService = {
  getAdminDashboard: jest.fn().mockResolvedValue({ revenue: 200000 }),
  getAdminSystemConfigOptions: jest.fn().mockResolvedValue({ categories: [] }),
  updateSystemConfig: jest.fn().mockImplementation((payload) => Promise.resolve(payload)),
  
  listAdminCategories: jest.fn().mockResolvedValue([]),
  createAdminCategory: jest.fn().mockImplementation((payload) => Promise.resolve({ id: 2, ...payload })),
  updateAdminCategory: jest.fn().mockImplementation((id, payload) => Promise.resolve({ id, ...payload })),
  updateAdminCategoryStatus: jest.fn().mockImplementation((id, status) => Promise.resolve({ id, status })),

  listAdminBrands: jest.fn().mockResolvedValue([]),
  createAdminBrand: jest.fn().mockImplementation((payload) => Promise.resolve({ id: 3, ...payload })),
  updateAdminBrand: jest.fn().mockImplementation((id, payload) => Promise.resolve({ id, ...payload })),
  updateAdminBrandStatus: jest.fn().mockImplementation((id, status) => Promise.resolve({ id, status })),

  listAdminVouchers: jest.fn().mockResolvedValue([]),
  createAdminVoucher: jest.fn().mockImplementation((payload) => Promise.resolve({ id: 4, ...payload })),
  updateAdminVoucher: jest.fn().mockImplementation((id, payload) => Promise.resolve({ id, ...payload })),
  updateAdminVoucherStatus: jest.fn().mockImplementation((id, isActive) => Promise.resolve({ id, isActive })),
  getAdminVoucher: jest.fn().mockResolvedValue({ id: 4, voucherCode: 'TEST10' }),

  listAdminNotifications: jest.fn().mockResolvedValue([]),
  createAdminNotification: jest.fn().mockImplementation((payload) => Promise.resolve({ id: 5, ...payload })),

  listAdminReviews: jest.fn().mockResolvedValue([]),
  moderateAdminReview: jest.fn().mockImplementation((id, payload, uid) => Promise.resolve({ id, ...payload, moderatedBy: uid })),

  listAdminUsers: jest.fn().mockResolvedValue([]),
  getAdminUserDetail: jest.fn().mockResolvedValue({ id: 10, email: 'user@example.com' }),
  updateAdminUserStatus: jest.fn().mockImplementation((id, status) => Promise.resolve({ id, status })),
  updateAdminUserRole: jest.fn().mockImplementation((id, role, adminLevel) => Promise.resolve({ id, role, adminLevel })),

  listAdminOrders: jest.fn().mockResolvedValue([]),
  getAdminOrderDetail: jest.fn().mockResolvedValue({ id: 20, totalAmount: 100 }),
  updateAdminOrderStatus: jest.fn().mockImplementation((id, status, uid, desc) => Promise.resolve({ id, status, updatedBy: uid, description: desc })),
  processAdminOrderReturn: jest.fn().mockImplementation((id, action, desc, uid) => Promise.resolve({ id, action, description: desc, processedBy: uid })),

  listAdminProducts: jest.fn().mockResolvedValue([]),
  getAdminProductDetail: jest.fn().mockResolvedValue({ id: 50, name: 'Product' }),
  createAdminProduct: jest.fn().mockResolvedValue(50),
  updateAdminProduct: jest.fn().mockImplementation((id, payload) => Promise.resolve({ id, ...payload })),
  updateAdminProductStatus: jest.fn().mockImplementation((id, status) => Promise.resolve({ id, status })),

  getReportOverview: jest.fn().mockResolvedValue({
    users: 100,
    orders: 50,
    revenueByPeriod: [{ period: '2026-06', revenue: 5000 }],
    topSellingProducts: [{ name: 'Item', totalSold: 10 }],
    orderStatusDistribution: [{ status: 'completed', total: 40 }],
  }),
};

describe('AdminService', () => {
  let adminService: AdminService;
  let databaseService: MySqlDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: MySqlDatabaseService,
          useValue: mockMySqlDatabaseService,
        },
      ],
    }).compile();

    adminService = module.get<AdminService>(AdminService);
    databaseService = module.get<MySqlDatabaseService>(MySqlDatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adminService).toBeDefined();
  });

  describe('getSystemDashboard', () => {
    it('should call database.getAdminDashboard and return wrapped data', async () => {
      const result = await adminService.getSystemDashboard();
      expect(databaseService.getAdminDashboard).toHaveBeenCalled();
      expect(result.data).toEqual({ revenue: 200000 });
    });
  });

  describe('getSystemConfigOptions', () => {
    it('should call database.getAdminSystemConfigOptions and return data', async () => {
      const result = await adminService.getSystemConfigOptions();
      expect(databaseService.getAdminSystemConfigOptions).toHaveBeenCalled();
      expect(result.data).toEqual({ categories: [] });
    });
  });

  describe('updateSystemConfig', () => {
    it('should call database.updateSystemConfig with payload', async () => {
      const payload: UpdateSystemConfigDto = {
        paymentMethodStatuses: [{ paymentMethodId: 1, status: 'active' }],
      };
      const result = await adminService.updateSystemConfig(payload);
      expect(databaseService.updateSystemConfig).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual(payload);
    });
  });

  describe('categories management', () => {
    it('should call database.listAdminCategories', async () => {
      const result = await adminService.listCategories();
      expect(databaseService.listAdminCategories).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });

    it('should call database.createAdminCategory with payload', async () => {
      const payload: CreateCategoryDto = { name: 'Books', status: 'active' };
      const result = await adminService.createCategory(payload);
      expect(databaseService.createAdminCategory).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual({ id: 2, name: 'Books', status: 'active' });
    });

    it('should update category details successfully', async () => {
      const payload: UpdateCategoryDto = { name: 'New Books' };
      const result = await adminService.updateCategory(2, payload);
      expect(databaseService.updateAdminCategory).toHaveBeenCalledWith(2, payload);
      expect(result.data).toEqual({ id: 2, name: 'New Books' });
    });

    it('should throw NotFoundException if category to update is not found', async () => {
      jest.spyOn(databaseService, 'updateAdminCategory').mockResolvedValueOnce(null);
      await expect(adminService.updateCategory(999, { name: 'Oops' })).rejects.toThrow(NotFoundException);
    });

    it('should update category status successfully', async () => {
      const payload: UpdateCategoryStatusDto = { status: 'inactive' };
      const result = await adminService.updateCategoryStatus(2, payload);
      expect(databaseService.updateAdminCategoryStatus).toHaveBeenCalledWith(2, 'inactive');
      expect(result.data).toEqual({ id: 2, status: 'inactive' });
    });

    it('should throw NotFoundException if category to update status is not found', async () => {
      jest.spyOn(databaseService, 'updateAdminCategoryStatus').mockResolvedValueOnce(null);
      await expect(adminService.updateCategoryStatus(999, { status: 'active' })).rejects.toThrow(NotFoundException);
    });

    it('should delete a category (marks it inactive)', async () => {
      const result = await adminService.deleteCategory(2);
      expect(databaseService.updateAdminCategoryStatus).toHaveBeenCalledWith(2, 'inactive');
      expect(result.data).toEqual({ id: 2, status: 'inactive' });
    });

    it('should throw NotFoundException if category to delete is not found', async () => {
      jest.spyOn(databaseService, 'updateAdminCategoryStatus').mockResolvedValueOnce(null);
      await expect(adminService.deleteCategory(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('brands management', () => {
    it('should list brands', async () => {
      const result = await adminService.listBrands();
      expect(databaseService.listAdminBrands).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });

    it('should create new brand', async () => {
      const payload = { name: 'Nike', status: 'active' as const };
      const result = await adminService.createBrand(payload);
      expect(databaseService.createAdminBrand).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual({ id: 3, name: 'Nike', status: 'active' });
    });

    it('should update brand details', async () => {
      const payload = { name: 'Nike Inc.' };
      const result = await adminService.updateBrand(3, payload);
      expect(databaseService.updateAdminBrand).toHaveBeenCalledWith(3, payload);
      expect(result.data).toEqual({ id: 3, name: 'Nike Inc.' });
    });

    it('should throw NotFoundException on updating non-existent brand', async () => {
      jest.spyOn(databaseService, 'updateAdminBrand').mockResolvedValueOnce(null);
      await expect(adminService.updateBrand(999, { name: 'Oops' })).rejects.toThrow(NotFoundException);
    });

    it('should update brand status', async () => {
      const result = await adminService.updateBrandStatus(3, { status: 'inactive' });
      expect(databaseService.updateAdminBrandStatus).toHaveBeenCalledWith(3, 'inactive');
      expect(result.data).toEqual({ id: 3, status: 'inactive' });
    });

    it('should throw NotFoundException on updating non-existent brand status', async () => {
      jest.spyOn(databaseService, 'updateAdminBrandStatus').mockResolvedValueOnce(null);
      await expect(adminService.updateBrandStatus(999, { status: 'active' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('vouchers management', () => {
    it('should list vouchers', async () => {
      const result = await adminService.listVouchers();
      expect(databaseService.listAdminVouchers).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });

    it('should create voucher', async () => {
      const payload: CreateVoucherDto = {
        voucherCode: 'SAVE20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 200,
        maxDiscountValue: 100,
        usageLimit: 50,
        startedAt: new Date(),
        expiredAt: new Date(),
        status: 'active',
      };
      const result = await adminService.createVoucher(payload);
      expect(databaseService.createAdminVoucher).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual({ id: 4, ...payload });
    });

    it('should update voucher details', async () => {
      const payload: UpdateVoucherDto = { usageLimit: 80 };
      const result = await adminService.updateVoucher(4, payload);
      expect(databaseService.updateAdminVoucher).toHaveBeenCalledWith(4, payload);
      expect(result.data).toEqual({ id: 4, usageLimit: 80 });
    });

    it('should throw NotFoundException on updating non-existent voucher', async () => {
      jest.spyOn(databaseService, 'updateAdminVoucher').mockResolvedValueOnce(null);
      await expect(adminService.updateVoucher(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should update voucher status', async () => {
      const payload: UpdateVoucherStatusDto = { isActive: false };
      const result = await adminService.updateVoucherStatus(4, payload);
      expect(databaseService.updateAdminVoucherStatus).toHaveBeenCalledWith(4, false);
      expect(result.data).toEqual({ id: 4, isActive: false });
    });

    it('should throw NotFoundException on updating non-existent voucher status', async () => {
      jest.spyOn(databaseService, 'updateAdminVoucherStatus').mockResolvedValueOnce(null);
      await expect(adminService.updateVoucherStatus(999, { isActive: true })).rejects.toThrow(NotFoundException);
    });

    it('should delete a voucher (marks it deleted)', async () => {
      const result = await adminService.deleteVoucher(4);
      expect(databaseService.getAdminVoucher).toHaveBeenCalledWith(4);
      expect(databaseService.updateAdminVoucher).toHaveBeenCalledWith(4, { isDeleted: true });
      expect(result.data).toEqual({ id: 4, voucherCode: 'TEST10' });
    });

    it('should throw NotFoundException on deleting non-existent voucher', async () => {
      jest.spyOn(databaseService, 'getAdminVoucher').mockResolvedValueOnce(null);
      await expect(adminService.deleteVoucher(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('notifications management', () => {
    it('should list notifications', async () => {
      const result = await adminService.listNotifications();
      expect(databaseService.listAdminNotifications).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });

    it('should create notification', async () => {
      const payload = { title: 'Alert', content: 'Message', type: 'system' as const };
      const result = await adminService.createNotification(payload);
      expect(databaseService.createAdminNotification).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual({ id: 5, ...payload });
    });
  });

  describe('reviews moderation', () => {
    it('should list reviews', async () => {
      const result = await adminService.listReviews();
      expect(databaseService.listAdminReviews).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });

    it('should moderate review', async () => {
      const payload: ModerateReviewDto = { moderationStatus: 'approved' };
      const result = await adminService.moderateReview(1, payload, 99);
      expect(databaseService.moderateAdminReview).toHaveBeenCalledWith(1, payload, 99);
      expect(result.data).toEqual({ id: 1, moderationStatus: 'approved', moderatedBy: 99 });
    });

    it('should throw NotFoundException when moderating non-existent review', async () => {
      jest.spyOn(databaseService, 'moderateAdminReview').mockResolvedValueOnce(null);
      await expect(adminService.moderateReview(999, { moderationStatus: 'approved' }, 99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('users management', () => {
    it('should list users with pagination parse', async () => {
      const result = await adminService.listUsers('2', '10');
      expect(databaseService.listAdminUsers).toHaveBeenCalledWith(2, 10);
      expect(result.data).toEqual([]);
    });

    it('should get user details', async () => {
      const result = await adminService.getUserDetail(10);
      expect(databaseService.getAdminUserDetail).toHaveBeenCalledWith(10);
      expect(result.data).toEqual({ id: 10, email: 'user@example.com' });
    });

    it('should throw NotFoundException on missing user details', async () => {
      jest.spyOn(databaseService, 'getAdminUserDetail').mockResolvedValueOnce(null);
      await expect(adminService.getUserDetail(999)).rejects.toThrow(NotFoundException);
    });

    it('should update user status', async () => {
      const payload: UpdateUserStatusDto = { status: 'blocked' };
      const result = await adminService.updateUserStatus(10, payload);
      expect(databaseService.updateAdminUserStatus).toHaveBeenCalledWith(10, 'blocked');
      expect(result.data).toEqual({ id: 10, status: 'blocked' });
    });

    it('should throw NotFoundException on status update of missing user', async () => {
      jest.spyOn(databaseService, 'updateAdminUserStatus').mockResolvedValueOnce(null);
      await expect(adminService.updateUserStatus(999, { status: 'active' })).rejects.toThrow(NotFoundException);
    });

    it('should update user role and admin level', async () => {
      const payload: UpdateUserRoleDto = { role: 'admin', adminLevel: 1, permissions: [] };
      const result = await adminService.updateUserRole(10, payload);
      expect(databaseService.updateAdminUserRole).toHaveBeenCalledWith(10, 'admin', 1);
      expect(result.data).toEqual({ id: 10, role: 'admin', adminLevel: 1 });
    });

    it('should throw BadRequestException if setting role to admin without adminLevel', async () => {
      const payload: UpdateUserRoleDto = { role: 'admin', permissions: [] };
      await expect(adminService.updateUserRole(10, payload)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException on role update of missing user', async () => {
      jest.spyOn(databaseService, 'updateAdminUserRole').mockResolvedValueOnce(null);
      const payload: UpdateUserRoleDto = { role: 'customer', permissions: [] };
      await expect(adminService.updateUserRole(999, payload)).rejects.toThrow(NotFoundException);
    });
  });

  describe('orders management', () => {
    it('should list orders', async () => {
      const result = await adminService.listOrders('5', '20');
      expect(databaseService.listAdminOrders).toHaveBeenCalledWith(5, 20);
      expect(result.data).toEqual([]);
    });

    it('should get order details', async () => {
      const result = await adminService.getOrderDetail(20);
      expect(databaseService.getAdminOrderDetail).toHaveBeenCalledWith(20);
      expect(result.data).toEqual({ id: 20, totalAmount: 100 });
    });

    it('should throw NotFoundException on missing order details', async () => {
      jest.spyOn(databaseService, 'getAdminOrderDetail').mockResolvedValueOnce(null);
      await expect(adminService.getOrderDetail(999)).rejects.toThrow(NotFoundException);
    });

    it('should update order status', async () => {
      const payload: UpdateOrderStatusDto = { status: 'completed', description: 'delivered' };
      const result = await adminService.updateOrderStatus(20, payload, 99);
      expect(databaseService.updateAdminOrderStatus).toHaveBeenCalledWith(20, 'completed', 99, 'delivered');
      expect(result.data).toEqual({ id: 20, status: 'completed', updatedBy: 99, description: 'delivered' });
    });

    it('should throw NotFoundException on status update of missing order', async () => {
      jest.spyOn(databaseService, 'updateAdminOrderStatus').mockResolvedValueOnce(null);
      await expect(adminService.updateOrderStatus(999, { status: 'completed' }, 99)).rejects.toThrow(NotFoundException);
    });

    it('should process order return successfully', async () => {
      const payload: ProcessReturnDto = { action: 'approve', description: 'Good return' };
      const result = await adminService.processOrderReturn(20, payload, 99);
      expect(databaseService.processAdminOrderReturn).toHaveBeenCalledWith(20, 'approve', 'Good return', 99);
      expect(result.data).toEqual({ id: 20, action: 'approve', description: 'Good return', processedBy: 99 });
    });

    it('should throw NotFoundException on order return processing fail', async () => {
      jest.spyOn(databaseService, 'processAdminOrderReturn').mockResolvedValueOnce(null);
      await expect(adminService.processOrderReturn(999, { action: 'reject' }, 99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('products management', () => {
    it('should list products', async () => {
      const result = await adminService.listProducts('1', '30');
      expect(databaseService.listAdminProducts).toHaveBeenCalledWith(1, 30);
      expect(result.data).toEqual([]);
    });

    it('should get product details', async () => {
      const result = await adminService.getProductDetail(50);
      expect(databaseService.getAdminProductDetail).toHaveBeenCalledWith(50);
      expect(result.data).toEqual({ id: 50, name: 'Product' });
    });

    it('should throw NotFoundException on missing product details', async () => {
      jest.spyOn(databaseService, 'getAdminProductDetail').mockResolvedValueOnce(null);
      await expect(adminService.getProductDetail(999)).rejects.toThrow(NotFoundException);
    });

    it('should create product', async () => {
      const payload: CreateProductDto = {
        name: 'Shoes',
        price: 50,
        stockQuantity: 10,
        categoryId: 1,
        brandId: 1,
        status: 'active',
      };
      const result = await adminService.createProduct(payload);
      expect(databaseService.createAdminProduct).toHaveBeenCalledWith(payload);
      expect(databaseService.getAdminProductDetail).toHaveBeenCalledWith(50);
      expect(result.data).toEqual({ id: 50, name: 'Product' });
    });

    it('should update product', async () => {
      const payload: UpdateProductDto = { name: 'Fancy Shoes' };
      const result = await adminService.updateProduct(50, payload);
      expect(databaseService.updateAdminProduct).toHaveBeenCalledWith(50, payload);
      expect(result.data).toEqual({ id: 50, name: 'Fancy Shoes' });
    });

    it('should throw NotFoundException on updating missing product', async () => {
      jest.spyOn(databaseService, 'updateAdminProduct').mockResolvedValueOnce(null);
      await expect(adminService.updateProduct(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should update product status', async () => {
      const payload: UpdateProductStatusDto = { status: 'inactive' };
      const result = await adminService.updateProductStatus(50, payload);
      expect(databaseService.updateAdminProductStatus).toHaveBeenCalledWith(50, 'inactive');
      expect(result.data).toEqual({ id: 50, status: 'inactive' });
    });

    it('should throw NotFoundException on status update of missing product', async () => {
      jest.spyOn(databaseService, 'updateAdminProductStatus').mockResolvedValueOnce(null);
      await expect(adminService.updateProductStatus(999, { status: 'inactive' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('reports overview and export', () => {
    it('should get report overview data', async () => {
      const result = await adminService.getReportOverview();
      expect(databaseService.getReportOverview).toHaveBeenCalled();
      expect(result.data.users).toBe(100);
    });

    it('should export report as JSON', async () => {
      const payload: ExportReportDto = { reportType: 'overview', format: 'json' };
      const result = await adminService.exportReport(payload);
      expect(databaseService.getReportOverview).toHaveBeenCalled();
      expect(result.message).toBe('Report exported successfully');
      expect(result.data.mimeType).toBe('application/json');
      expect(result.data.fileName).toContain('.json');
    });

    it('should export report as CSV', async () => {
      const payload: ExportReportDto = { reportType: 'overview', format: 'csv' };
      const result = await adminService.exportReport(payload);
      expect(databaseService.getReportOverview).toHaveBeenCalled();
      expect(result.message).toBe('Report exported successfully');
      expect(result.data.mimeType).toBe('text/csv');
      expect(result.data.fileName).toContain('.csv');
    });

    it('should throw BadRequestException for unsupported report types', async () => {
      const payload = { reportType: 'sales', format: 'json' } as any;
      await expect(adminService.exportReport(payload)).rejects.toThrow(BadRequestException);
    });
  });
});
