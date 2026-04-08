import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
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
        deleteUser: 'DELETE /auth/users/:userId',
        forgotPassword: 'POST /auth/forgot-password',
        resetPassword: 'POST /auth/reset-password',
      },
    };
  }
}
