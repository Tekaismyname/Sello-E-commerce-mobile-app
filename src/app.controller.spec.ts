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
          register: 'POST /auth/register',
          verifyOtp: 'POST /auth/verify-otp',
          login: 'POST /auth/login',
          forgotPassword: 'POST /auth/forgot-password',
          resetPassword: 'POST /auth/reset-password',
        },
      });
    });
  });
});
