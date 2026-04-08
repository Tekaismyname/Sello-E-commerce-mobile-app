import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET / should expose API metadata', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe('running');
        expect(response.body.docs.login).toBe('POST /auth/login');
      });
  });

  it('should register, verify OTP, then login with permissions', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Test User',
        email: 'testuser@gmail.com',
        phone: '0901234567',
        password: 'Password123',
        confirmPassword: 'Password123',
      })
      .expect(201);

    expect(registerResponse.body.user.isVerified).toBe(false);
    expect(registerResponse.body.otp.purpose).toBe('register');

    const otpCode = registerResponse.body.otp.otpCodePreview;

    await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({
        targetValue: '0901234567',
        purpose: 'register',
        otpCode,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.user.isVerified).toBe(true);
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identifier: '0901234567',
        password: 'Password123',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.tokens.accessToken).toBeDefined();
        expect(response.body.tokens.refreshToken).toBeDefined();
        expect(response.body.user.role).toBe('customer');
        expect(response.body.user.permissions).toContain('orders:create');
      });
  });

  it('should send OTP for forgot password and reset password successfully', async () => {
    const forgotPasswordResponse = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({
        identifier: 'a@gmail.com',
      })
      .expect(201);

    const otpCode = forgotPasswordResponse.body.otp.otpCodePreview;

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        identifier: 'a@gmail.com',
        otpCode,
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.message).toBe('Password reset successful');
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identifier: 'a@gmail.com',
        password: 'NewPassword123',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.user.permissions).toContain('cart:update');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
