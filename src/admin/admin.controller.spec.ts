import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CreateCategoryDto, UpdateSystemConfigDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

const mockAdminService = {
  getSystemDashboard: jest.fn().mockResolvedValue({
    message: 'System dashboard fetched successfully',
    data: {},
  }),
  getSystemConfigOptions: jest.fn().mockResolvedValue({
    message: 'System config options fetched successfully',
    data: {},
  }),
  updateSystemConfig: jest.fn().mockImplementation((payload: UpdateSystemConfigDto) =>
    Promise.resolve({
      message: 'System configuration updated successfully',
      data: payload,
    }),
  ),
  listCategories: jest.fn().mockResolvedValue({
    message: 'Categories fetched successfully',
    data: [],
  }),
  createCategory: jest.fn().mockImplementation((payload: CreateCategoryDto) =>
    Promise.resolve({
      message: 'Category created successfully',
      data: { id: 1, ...payload },
    }),
  ),
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

  describe('getSystemDashboard', () => {
    it('should fetch system dashboard stats', async () => {
      const result = await adminController.getSystemDashboard();
      expect(adminService.getSystemDashboard).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'System dashboard fetched successfully',
        data: {},
      });
    });
  });

  describe('getSystemConfigOptions', () => {
    it('should fetch system config options', async () => {
      const result = await adminController.getSystemConfigOptions();
      expect(adminService.getSystemConfigOptions).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'System config options fetched successfully',
        data: {},
      });
    });
  });

  describe('updateSystemConfig', () => {
    it('should update system config with payload', async () => {
      const payload: UpdateSystemConfigDto = {
        categoryStatuses: [{ categoryId: 1, status: 'active' }],
      };
      const result = await adminController.updateSystemConfig(payload);
      expect(adminService.updateSystemConfig).toHaveBeenCalledWith(payload);
      expect(result).toEqual({
        message: 'System configuration updated successfully',
        data: payload,
      });
    });
  });

  describe('listCategories', () => {
    it('should fetch categories list', async () => {
      const result = await adminController.listCategories();
      expect(adminService.listCategories).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Categories fetched successfully',
        data: [],
      });
    });
  });

  describe('createCategory', () => {
    it('should create new category', async () => {
      const payload: CreateCategoryDto = {
        name: 'Electronics',
        status: 'active',
      };
      const result = await adminController.createCategory(payload);
      expect(adminService.createCategory).toHaveBeenCalledWith(payload);
      expect(result).toEqual({
        message: 'Category created successfully',
        data: { id: 1, name: 'Electronics', status: 'active' },
      });
    });
  });
});
