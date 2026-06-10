import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { MySqlDatabaseService } from '../auth/services/mysql-database.service';
import { CreateCategoryDto, UpdateSystemConfigDto } from './dto/admin.dto';

const mockMySqlDatabaseService = {
  getAdminDashboard: jest.fn().mockResolvedValue({ revenue: 200000 }),
  getAdminSystemConfigOptions: jest.fn().mockResolvedValue({ categories: [] }),
  updateSystemConfig: jest.fn().mockImplementation((payload: UpdateSystemConfigDto) =>
    Promise.resolve(payload),
  ),
  listAdminCategories: jest.fn().mockResolvedValue([]),
  createAdminCategory: jest.fn().mockImplementation((payload: CreateCategoryDto) =>
    Promise.resolve({ id: 2, ...payload }),
  ),
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
      expect(result).toEqual({
        message: 'System dashboard fetched successfully',
        data: { revenue: 200000 },
      });
    });
  });

  describe('getSystemConfigOptions', () => {
    it('should call database.getAdminSystemConfigOptions and return data', async () => {
      const result = await adminService.getSystemConfigOptions();
      expect(databaseService.getAdminSystemConfigOptions).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'System config options fetched successfully',
        data: { categories: [] },
      });
    });
  });

  describe('updateSystemConfig', () => {
    it('should call database.updateSystemConfig with payload', async () => {
      const payload: UpdateSystemConfigDto = {
        paymentMethodStatuses: [{ paymentMethodId: 1, status: 'active' }],
      };
      const result = await adminService.updateSystemConfig(payload);
      expect(databaseService.updateSystemConfig).toHaveBeenCalledWith(payload);
      expect(result).toEqual({
        message: 'System configuration updated successfully',
        data: payload,
      });
    });
  });

  describe('listCategories', () => {
    it('should call database.listAdminCategories', async () => {
      const result = await adminService.listCategories();
      expect(databaseService.listAdminCategories).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Categories fetched successfully',
        data: [],
      });
    });
  });

  describe('createCategory', () => {
    it('should call database.createAdminCategory with payload', async () => {
      const payload: CreateCategoryDto = {
        name: 'Books',
        status: 'active',
      };
      const result = await adminService.createCategory(payload);
      expect(databaseService.createAdminCategory).toHaveBeenCalledWith(payload);
      expect(result).toEqual({
        message: 'Category created successfully',
        data: { id: 2, name: 'Books', status: 'active' },
      });
    });
  });
});
