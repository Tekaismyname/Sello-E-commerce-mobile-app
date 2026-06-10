import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API metadata', () => {
      expect(appController.getRoot()).toEqual({
        name: 'Sello Ecommerce API',
        status: 'running',
        docs: {
          home: 'GET /home',
          register: 'POST /auth/register',
          verifyOtp: 'POST /auth/verify-otp',
          login: 'POST /auth/login',
          logout: 'POST /auth/logout',
          me: 'GET /auth/me',
          adminPing: 'GET /auth/admin/ping',
          adminOperationsPing: 'GET /auth/admin/operations/ping',
          deleteUser: 'DELETE /auth/users/:userId',
          adminDashboard: 'GET /admin/system/dashboard',
          adminConfig: 'PUT /admin/system/config',
          adminUsers: 'GET /admin/users',
          adminUserDetail: 'GET /admin/users/:userId',
          adminUserStatus: 'PATCH /admin/users/:userId/status',
          adminUserRole: 'PATCH /admin/users/:userId/role',
          adminOrders: 'GET /admin/orders',
          adminOrderDetail: 'GET /admin/orders/:orderId',
          adminOrderStatus: 'PATCH /admin/orders/:orderId/status',
          adminProducts: 'GET /admin/products',
          adminCreateProduct: 'POST /admin/products',
          adminUpdateProduct: 'PUT /admin/products/:productId',
          adminProductStatus: 'PATCH /admin/products/:productId/status',
          adminReportOverview: 'GET /admin/reports/overview',
          adminReportExport: 'POST /admin/reports/export',
          forgotPassword: 'POST /auth/forgot-password',
          resetPassword: 'POST /auth/reset-password',
        },
      });
    });
  });
});
