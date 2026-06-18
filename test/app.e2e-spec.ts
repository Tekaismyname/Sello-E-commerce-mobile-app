import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { MySqlDatabaseService } from './../src/auth/services/mysql-database.service';

describe('Auth & Admin flows (e2e)', () => {
  let app: INestApplication<App>;
  let dbService: MySqlDatabaseService;
  
  // Set longer timeout for database E2E tests
  jest.setTimeout(25000);
  
  const testEmails = ['testuser@gmail.com', 'admin@gmail.com', 'duplicate@gmail.com'];
  
  let customerToken: string;
  let adminToken: string;
  let createdCategoryId: number;
  let createdBrandId: number;
  let createdVoucherId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    dbService = app.get(MySqlDatabaseService);

    // Clean up any existing test data to ensure clean E2E run
    for (const email of testEmails) {
      const user = await dbService.findUserByIdentifier(email);
      if (user) {
        await dbService.deleteUser(user.id);
      }
    }

    // Clean up any test categories/brands/vouchers that might match E2E names
    await dbService['pool'].query('DELETE FROM categories WHERE name = ?', ['E2E Category']);
    await dbService['pool'].query('DELETE FROM brands WHERE name = ?', ['E2E Brand']);
    await dbService['pool'].query('DELETE FROM vouchers WHERE code = ?', ['E2EVOUCH']);
  });

  afterAll(async () => {
    // Clean up test data after execution
    for (const email of testEmails) {
      const user = await dbService.findUserByIdentifier(email);
      if (user) {
        await dbService.deleteUser(user.id);
      }
    }
    await dbService['pool'].query('DELETE FROM categories WHERE name = ?', ['E2E Category']);
    await dbService['pool'].query('DELETE FROM brands WHERE name = ?', ['E2E Brand']);
    await dbService['pool'].query('DELETE FROM vouchers WHERE code = ?', ['E2EVOUCH']);

    await app.close();
  });

  // Scenario 1: API Root
  it('GET / should expose API metadata', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe('running');
        expect(response.body.docs.login).toBe('POST /auth/login');
      });
  });

  // Scenario 2: Auth Flow (Register -> Verify -> Login)
  it('should register a customer, verify OTP, then login', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Test User',
        email: 'testuser@gmail.com',
        phone: '0901234567',
        password: 'Password123',
        confirmPassword: 'Password123',
        deliveryMethod: 'phone',
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

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identifier: '0901234567',
        password: 'Password123',
      })
      .expect(201);

    expect(loginResponse.body.tokens.accessToken).toBeDefined();
    customerToken = loginResponse.body.tokens.accessToken;
    expect(loginResponse.body.user.role).toBe('customer');
  });

  // Validation & Error Handling
  it('should return 400 when registering with duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Duplicate User',
        email: 'testuser@gmail.com', // already registered
        phone: '0901112223',
        password: 'Password123',
        confirmPassword: 'Password123',
        deliveryMethod: 'phone',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('already exists');
      });
  });

  it('should return 400 when registering with invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Invalid Email User',
        email: 'invalid-email',
        phone: '0901112224',
        password: 'Password123',
        confirmPassword: 'Password123',
        deliveryMethod: 'phone',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('Email is invalid');
      });
  });

  it('should return 400 when registering with missing fields', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'missing@gmail.com',
      })
      .expect(400);
  });

  it('should return 401 when logging in with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identifier: '0901234567',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('should return 404 when logging in with non-existent user', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identifier: 'nonexistent@gmail.com',
        password: 'Password123',
      })
      .expect(404);
  });

  // Scenario 3: Password Reset Flow (using phone method to avoid SMTP latency/failure)
  it('should request forgot password OTP and reset password successfully', async () => {
    const forgotResponse = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({
        identifier: 'testuser@gmail.com',
        deliveryMethod: 'phone',
      })
      .expect(201);

    const otpCode = forgotResponse.body.otp.otpCodePreview;

    // Test: Reset with wrong OTP first
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        identifier: 'testuser@gmail.com',
        targetValue: '0901234567',
        otpCode: '000000', // wrong
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123',
      })
      .expect(400);

    // Test: Reset with correct OTP
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({
        identifier: 'testuser@gmail.com',
        targetValue: '0901234567',
        otpCode,
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123',
      })
      .expect(201);

    // Test: Login with new password
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identifier: 'testuser@gmail.com',
        password: 'NewPassword123',
      })
      .expect(201);
  });

  // Scenario 4: Protected Routes & Authorization Guards
  it('GET /auth/me should return 401 when no token is provided', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
  });

  it('GET /auth/me should return 200 when valid customer token is provided', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.user.email).toBe('testuser@gmail.com');
      });
  });

  it('GET /auth/admin/ping should return 403 Forbidden for customer role', () => {
    return request(app.getHttpServer())
      .get('/auth/admin/ping')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });

  it('GET /admin/system/dashboard should return 403 Forbidden for customer role', () => {
    return request(app.getHttpServer())
      .get('/admin/system/dashboard')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });

  // Setup Admin user dynamically to test Admin features
  it('should setup an admin user and login to obtain admin token', async () => {
    // 1. Register admin user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Admin User',
        email: 'admin@gmail.com',
        phone: '0909999999',
        password: 'AdminPassword123',
        confirmPassword: 'AdminPassword123',
        deliveryMethod: 'phone',
      })
      .expect(201);

    const otpCode = registerResponse.body.otp.otpCodePreview;

    // 2. Verify OTP
    await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({
        targetValue: '0909999999',
        purpose: 'register',
        otpCode,
      })
      .expect(201);

    // 3. Upgrade user to admin level 1 directly in database
    const adminUser = await dbService.findUserByIdentifier('admin@gmail.com');
    expect(adminUser).toBeDefined();
    await dbService.updateUser(adminUser!.id, {
      role: 'admin',
      adminLevel: 1,
    });

    // 4. Log in with admin credentials
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identifier: 'admin@gmail.com',
        password: 'AdminPassword123',
      })
      .expect(201);

    expect(loginResponse.body.user.role).toBe('admin');
    expect(loginResponse.body.user.adminLevel).toBe(1);
    expect(loginResponse.body.tokens.accessToken).toBeDefined();
    adminToken = loginResponse.body.tokens.accessToken;
  });

  it('GET /auth/admin/ping should return 200 for admin user', () => {
    return request(app.getHttpServer())
      .get('/auth/admin/ping')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Admin access granted');
      });
  });

  it('GET /admin/system/dashboard should return 200 for admin user', () => {
    return request(app.getHttpServer())
      .get('/admin/system/dashboard')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  // Scenario 5: Admin CRUD Operations E2E
  describe('Admin CRUD Operations', () => {
    it('should create a new category', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Category',
          status: 'active',
        })
        .expect(201);

      expect(response.body.data.id).toBeDefined();
      createdCategoryId = response.body.data.id;
    });

    it('should list categories and find the created category', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const categories = response.body.data;
      const found = categories.find((cat: any) => cat.id === createdCategoryId);
      expect(found).toBeDefined();
      expect(found.name).toBe('E2E Category');
    });

    it('should create a new brand', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/brands')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Brand',
          status: 'active',
        })
        .expect(201);

      expect(response.body.data.id).toBeDefined();
      createdBrandId = response.body.data.id;
    });

    it('should list brands and find the created brand', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/brands')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const brands = response.body.data;
      const found = brands.find((br: any) => br.id === createdBrandId);
      expect(found).toBeDefined();
      expect(found.name).toBe('E2E Brand');
    });

    it('should create a new voucher', async () => {
      const startedAt = new Date();
      const expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + 7);

      const formattedStart = startedAt.toISOString().replace('T', ' ').substring(0, 19);
      const formattedEnd = expiredAt.toISOString().replace('T', ' ').substring(0, 19);

      const response = await request(app.getHttpServer())
        .post('/admin/vouchers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'E2EVOUCH',
          name: 'E2E Voucher Name',
          voucherType: 'product',
          discountType: 'percent',
          discountValue: 10,
          minOrderValue: 100,
          maxDiscountValue: 50,
          usageLimit: 100,
          startAt: formattedStart,
          endAt: formattedEnd,
          isActive: true,
        })
        .expect(201);

      expect(response.body.data.id).toBeDefined();
      createdVoucherId = response.body.data.id;
    });

    it('should delete the created voucher', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/vouchers/${createdVoucherId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Voucher deleted successfully');
        });
    });
  });
});
