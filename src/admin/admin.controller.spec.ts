import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
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

const mockAdminService = {
  getSystemDashboard: jest.fn().mockResolvedValue({ status: 'success', data: {} }),
  getSystemConfigOptions: jest.fn().mockResolvedValue({ status: 'success', data: {} }),
  updateSystemConfig: jest.fn().mockImplementation((p) => Promise.resolve({ status: 'success', data: p })),
  
  listCategories: jest.fn().mockResolvedValue({ status: 'success', data: [] }),
  createCategory: jest.fn().mockImplementation((p) => Promise.resolve({ status: 'success', data: p })),
  updateCategory: jest.fn().mockImplementation((id, p) => Promise.resolve({ status: 'success', id, data: p })),
  updateCategoryStatus: jest.fn().mockImplementation((id, p) => Promise.resolve({ status: 'success', id, data: p })),
  deleteCategory: jest.fn().mockImplementation((id) => Promise.resolve({ status: 'success', id })),

  listBrands: jest.fn().mockResolvedValue({ status: 'success', data: [] }),
  createBrand: jest.fn().mockImplementation((p) => Promise.resolve({ status: 'success', data: p })),
  updateBrand: jest.fn().mockImplementation((id, p) => Promise.resolve({ status: 'success', id, data: p })),
  updateBrandStatus: jest.fn().mockImplementation((id, p) => Promise.resolve({ status: 'success', id, data: p })),

  listVouchers: jest.fn().mockResolvedValue({ status: 'success', data: [] }),
  createVoucher: jest.fn().mockImplementation((p) => Promise.resolve({ status: 'success', data: p })),
  updateVoucher: jest.fn().mockImplementation((id, p) => Promise.resolve({ status: 'success', id, data: p })),
  updateVoucherStatus: jest.fn().mockImplementation((id, p) => Promise.resolve({ status: 'success', id, data: p })),
  deleteVoucher: jest.fn().mockImplementation((id) => Promise.resolve({ status: 'success', id })),

  listNotifications: jest.fn().mockResolvedValue({ status: 'success', data: [] }),
  createNotification: jest.fn().mockImplementation((p) => Promise.resolve({ status: 'success', data: p })),

  listReviews: jest.fn().mockResolvedValue({ status: 'success', data: [] }),
  moderateReview: jest.fn().mockImplementation((id, p, uid) => Promise.resolve({ status: 'success', id, data: p, moderatedBy: uid })),

  listUsers: jest.fn().mockImplementation((page, limit) => Promise.resolve({ status: 'success', page, limit, data: [] })),
  getUserDetail: jest.fn().mockImplementation((id) => Promise.resolve({ status: 'success', id })),
  updateUserStatus: jest.fn().mockImplementation((id, p) => Promise.resolve({ status: 'success', id, data: p })),
  updateUserRole: jest.fn().mockImplementation((id, p) => Promise.resolve({ status: 'success', id, data: p })),

  listOrders: jest.fn().mockImplementation((page, limit) => Promise.resolve({ status: 'success', page, limit, data: [] })),
  getOrderDetail: jest.fn().mockImplementation((id) => Promise.resolve({ status: 'success', id })),
  updateOrderStatus: jest.fn().mockImplementation((id, p, uid) => Promise.resolve({ status: 'success', id, data: p, updatedBy: uid })),
  processOrderReturn: jest.fn().mockImplementation((id, p, uid) => Promise.resolve({ status: 'success', id, data: p, processedBy: uid })),

  listProducts: jest.fn().mockImplementation((page, limit) => Promise.resolve({ status: 'success', page, limit, data: [] })),
  getProductDetail: jest.fn().mockImplementation((id) => Promise.resolve({ status: 'success', id })),
  createProduct: jest.fn().mockImplementation((p) => Promise.resolve({ status: 'success', data: p })),
  updateProduct: jest.fn().mockImplementation((id, p) => Promise.resolve({ status: 'success', id, data: p })),
  updateProductStatus: jest.fn().mockImplementation((id, p) => Promise.resolve({ status: 'success', id, data: p })),

  getReportOverview: jest.fn().mockResolvedValue({ status: 'success', data: {} }),
  exportReport: jest.fn().mockImplementation((p) => Promise.resolve({ status: 'success', data: p })),
};

describe('AdminController', () => {
  let adminController: AdminController;
  let adminService: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    adminController = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adminController).toBeDefined();
  });

  describe('system dashboard and config', () => {
    it('should fetch system dashboard stats', async () => {
      const result = await adminController.getSystemDashboard();
      expect(adminService.getSystemDashboard).toHaveBeenCalled();
      expect(result.status).toBe('success');
    });

    it('should fetch system config options', async () => {
      const result = await adminController.getSystemConfigOptions();
      expect(adminService.getSystemConfigOptions).toHaveBeenCalled();
      expect(result.status).toBe('success');
    });

    it('should update system config with payload', async () => {
      const payload: UpdateSystemConfigDto = {
        categoryStatuses: [{ categoryId: 1, status: 'active' }],
      };
      const result = await adminController.updateSystemConfig(payload);
      expect(adminService.updateSystemConfig).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual(payload);
    });
  });

  describe('file upload', () => {
    it('should return path of successfully uploaded file', () => {
      const mockFile = { filename: 'test-file.png' };
      const result = adminController.uploadFile(mockFile);
      expect(result).toEqual({
        status: 'success',
        url: '/uploads/test-file.png',
      });
    });

    it('should throw BadRequestException if file is missing', () => {
      expect(() => adminController.uploadFile(null)).toThrow(BadRequestException);
    });
  });

  describe('categories management', () => {
    it('should fetch categories list', async () => {
      const result = await adminController.listCategories();
      expect(adminService.listCategories).toHaveBeenCalled();
      expect(result.status).toBe('success');
    });

    it('should create new category', async () => {
      const payload: CreateCategoryDto = { name: 'Electronics', status: 'active' };
      const result = await adminController.createCategory(payload);
      expect(adminService.createCategory).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual(payload);
    });

    it('should update category name/status', async () => {
      const payload: UpdateCategoryDto = { name: 'New Electronics', status: 'active' };
      const result = await adminController.updateCategory(1, payload);
      expect(adminService.updateCategory).toHaveBeenCalledWith(1, payload);
      expect(result.id).toBe(1);
    });

    it('should update category status', async () => {
      const payload: UpdateCategoryStatusDto = { status: 'inactive' };
      const result = await adminController.updateCategoryStatus(1, payload);
      expect(adminService.updateCategoryStatus).toHaveBeenCalledWith(1, payload);
      expect(result.id).toBe(1);
    });

    it('should delete a category', async () => {
      const result = await adminController.deleteCategory(1);
      expect(adminService.deleteCategory).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });
  });

  describe('brands management', () => {
    it('should fetch brands list', async () => {
      const result = await adminController.listBrands();
      expect(adminService.listBrands).toHaveBeenCalled();
      expect(result.status).toBe('success');
    });

    it('should create new brand', async () => {
      const payload: CreateBrandDto = { name: 'Apple', status: 'active' };
      const result = await adminController.createBrand(payload);
      expect(adminService.createBrand).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual(payload);
    });

    it('should update brand', async () => {
      const payload: UpdateBrandDto = { name: 'Apple Inc', status: 'active' };
      const result = await adminController.updateBrand(1, payload);
      expect(adminService.updateBrand).toHaveBeenCalledWith(1, payload);
      expect(result.id).toBe(1);
    });

    it('should update brand status', async () => {
      const payload: UpdateBrandStatusDto = { status: 'inactive' };
      const result = await adminController.updateBrandStatus(1, payload);
      expect(adminService.updateBrandStatus).toHaveBeenCalledWith(1, payload);
      expect(result.id).toBe(1);
    });
  });

  describe('vouchers management', () => {
    it('should fetch vouchers list', async () => {
      const result = await adminController.listVouchers();
      expect(adminService.listVouchers).toHaveBeenCalled();
      expect(result.status).toBe('success');
    });

    it('should create new voucher', async () => {
      const payload: CreateVoucherDto = {
        voucherCode: 'DISCOUNT10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 100,
        maxDiscountValue: 50,
        usageLimit: 100,
        startedAt: new Date(),
        expiredAt: new Date(),
        status: 'active',
      };
      const result = await adminController.createVoucher(payload);
      expect(adminService.createVoucher).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual(payload);
    });

    it('should update voucher details', async () => {
      const payload: UpdateVoucherDto = { discountValue: 15 };
      const result = await adminController.updateVoucher(1, payload);
      expect(adminService.updateVoucher).toHaveBeenCalledWith(1, payload);
      expect(result.id).toBe(1);
    });

    it('should update voucher status', async () => {
      const payload: UpdateVoucherStatusDto = { status: 'inactive' };
      const result = await adminController.updateVoucherStatus(1, payload);
      expect(adminService.updateVoucherStatus).toHaveBeenCalledWith(1, payload);
      expect(result.id).toBe(1);
    });

    it('should delete voucher', async () => {
      const result = await adminController.deleteVoucher(1);
      expect(adminService.deleteVoucher).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });
  });

  describe('notifications management', () => {
    it('should fetch admin notifications', async () => {
      const result = await adminController.listNotifications();
      expect(adminService.listNotifications).toHaveBeenCalled();
      expect(result.status).toBe('success');
    });

    it('should create admin notification', async () => {
      const payload: CreateAdminNotificationDto = {
        title: 'System Update',
        content: 'System will be updated soon',
        type: 'system',
      };
      const result = await adminController.createNotification(payload);
      expect(adminService.createNotification).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual(payload);
    });
  });

  describe('reviews moderation', () => {
    it('should list reviews', async () => {
      const result = await adminController.listReviews();
      expect(adminService.listReviews).toHaveBeenCalled();
      expect(result.status).toBe('success');
    });

    it('should moderate review with user context sub', async () => {
      const payload: ModerateReviewDto = { moderationStatus: 'approved', rejectionReason: '' };
      const req = { user: { sub: 99 } } as any;
      const result = await adminController.moderateReview(5, payload, req);
      expect(adminService.moderateReview).toHaveBeenCalledWith(5, payload, 99);
      expect(result.moderatedBy).toBe(99);
    });
  });

  describe('users management', () => {
    it('should list users with pagination params', async () => {
      const result = await adminController.listUsers('2', '15');
      expect(adminService.listUsers).toHaveBeenCalledWith('2', '15');
      expect(result.page).toBe('2');
      expect(result.limit).toBe('15');
    });

    it('should get user details', async () => {
      const result = await adminController.getUserDetail(10);
      expect(adminService.getUserDetail).toHaveBeenCalledWith(10);
      expect(result.id).toBe(10);
    });

    it('should update user status', async () => {
      const payload: UpdateUserStatusDto = { status: 'blocked' };
      const result = await adminController.updateUserStatus(10, payload);
      expect(adminService.updateUserStatus).toHaveBeenCalledWith(10, payload);
      expect(result.id).toBe(10);
    });

    it('should update user role', async () => {
      const payload: UpdateUserRoleDto = { role: 'staff', adminLevel: 2, permissions: [] };
      const result = await adminController.updateUserRole(10, payload);
      expect(adminService.updateUserRole).toHaveBeenCalledWith(10, payload);
      expect(result.id).toBe(10);
    });
  });

  describe('orders management', () => {
    it('should list orders with pagination', async () => {
      const result = await adminController.listOrders('1', '10');
      expect(adminService.listOrders).toHaveBeenCalledWith('1', '10');
      expect(result.page).toBe('1');
    });

    it('should get order details', async () => {
      const result = await adminController.getOrderDetail(22);
      expect(adminService.getOrderDetail).toHaveBeenCalledWith(22);
      expect(result.id).toBe(22);
    });

    it('should update order status with admin sub', async () => {
      const payload: UpdateOrderStatusDto = { orderStatus: 'shipping' };
      const req = { user: { sub: 99 } } as any;
      const result = await adminController.updateOrderStatus(22, payload, req);
      expect(adminService.updateOrderStatus).toHaveBeenCalledWith(22, payload, 99);
      expect(result.updatedBy).toBe(99);
    });

    it('should process order return with admin sub', async () => {
      const payload: ProcessReturnDto = { action: 'approve' };
      const req = { user: { sub: 99 } } as any;
      const result = await adminController.processOrderReturn(22, payload, req);
      expect(adminService.processOrderReturn).toHaveBeenCalledWith(22, payload, 99);
      expect(result.processedBy).toBe(99);
    });
  });

  describe('products management', () => {
    it('should list products with pagination', async () => {
      const result = await adminController.listProducts('3', '5');
      expect(adminService.listProducts).toHaveBeenCalledWith('3', '5');
      expect(result.page).toBe('3');
    });

    it('should get product details', async () => {
      const result = await adminController.getProductDetail(55);
      expect(adminService.getProductDetail).toHaveBeenCalledWith(55);
      expect(result.id).toBe(55);
    });

    it('should create new product', async () => {
      const payload: CreateProductDto = {
        name: 'iPhone 15',
        description: 'Latest Apple iPhone',
        price: 999,
        stockQuantity: 50,
        categoryId: 1,
        brandId: 1,
        imageUrl: '/uploads/iphone15.png',
        status: 'active',
        attributes: {},
      };
      const result = await adminController.createProduct(payload);
      expect(adminService.createProduct).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual(payload);
    });

    it('should update product details', async () => {
      const payload: UpdateProductDto = { price: 950 };
      const result = await adminController.updateProduct(55, payload);
      expect(adminService.updateProduct).toHaveBeenCalledWith(55, payload);
      expect(result.id).toBe(55);
    });

    it('should update product status', async () => {
      const payload: UpdateProductStatusDto = { status: 'inactive' };
      const result = await adminController.updateProductStatus(55, payload);
      expect(adminService.updateProductStatus).toHaveBeenCalledWith(55, payload);
      expect(result.id).toBe(55);
    });
  });

  describe('reports and export', () => {
    it('should get report overview stats', async () => {
      const result = await adminController.getReportOverview();
      expect(adminService.getReportOverview).toHaveBeenCalled();
      expect(result.status).toBe('success');
    });

    it('should export report', async () => {
      const payload: ExportReportDto = { format: 'csv', startDate: '2026-01-01', endDate: '2026-06-01' };
      const result = await adminController.exportReport(payload);
      expect(adminService.exportReport).toHaveBeenCalledWith(payload);
      expect(result.data).toEqual(payload);
    });
  });
});
