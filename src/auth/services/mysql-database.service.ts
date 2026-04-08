import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  createPool,
  Pool,
  PoolOptions,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import {
  AuthPurpose,
  CreateRefreshTokenInput,
  CreateOtpInput,
  CreateUserInput,
  RefreshTokenRecord,
  RolePermissionMap,
  User,
  UserOtp,
  UserRole,
} from '../types/auth.types';

interface UserRow extends RowDataPacket {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  status?: string | null;
  is_verified: number | boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

interface UserOtpRow extends RowDataPacket {
  otp_id: number;
  user_id: number;
  purpose: AuthPurpose;
  target_value: string;
  otp_code: string;
  expired_at: Date | string;
  is_used: number | boolean;
  created_at: Date | string;
}

interface RefreshTokenRow extends RowDataPacket {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date | string;
  status: 'active' | 'revoked';
  revoked_at: Date | string | null;
  created_at: Date | string;
}

interface CategoryRow extends RowDataPacket {
  category_id: number;
  name: string;
}

interface BrandRow extends RowDataPacket {
  brand_id: number;
  name: string;
}

interface ProductRow extends RowDataPacket {
  product_id: number;
  category_id: number;
  brand_id: number | null;
  name: string;
  base_price: number | string;
  status?: string | null;
  brand_name: string | null;
  primary_image_url: string | null;
}

@Injectable()
export class MySqlDatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(MySqlDatabaseService.name);

  private readonly rolePermissions: RolePermissionMap = {
    admin: [
      'dashboard:read',
      'orders:read',
      'orders:update',
      'products:read',
      'products:create',
      'products:update',
      'users:read',
    ],
    customer: [
      'profile:read',
      'profile:update',
      'cart:read',
      'cart:update',
      'orders:create',
      'orders:read',
      'reviews:create',
    ],
  };

  private readonly pool: Pool = createPool(this.getPoolOptions());

  async checkConnection() {
    await this.pool.query('SELECT 1');
    await this.ensureRefreshTokenTable();
    this.logger.log('Connected to MySQL successfully');
  }

  async findUserByEmailOrPhone(email?: string, phone?: string) {
    const clauses: string[] = [];
    const params: string[] = [];

    if (email) {
      clauses.push('LOWER(email) = LOWER(?)');
      params.push(email);
    }

    if (phone) {
      clauses.push('phone = ?');
      params.push(phone);
    }

    if (!clauses.length) {
      return undefined;
    }

    const [rows] = await this.pool.query<UserRow[]>(
      `
        SELECT user_id, full_name, email, phone, password_hash, role, status, is_verified, created_at, updated_at
        FROM users
        WHERE ${clauses.join(' OR ')}
        LIMIT 1
      `,
      params,
    );

    return rows[0] ? this.mapUser(rows[0]) : undefined;
  }

  async findUserByIdentifier(identifier: string) {
    const value = identifier.trim();

    const [rows] = await this.pool.query<UserRow[]>(
      `
        SELECT user_id, full_name, email, phone, password_hash, role, status, is_verified, created_at, updated_at
        FROM users
        WHERE LOWER(email) = LOWER(?) OR phone = ?
        LIMIT 1
      `,
      [value, value],
    );

    return rows[0] ? this.mapUser(rows[0]) : undefined;
  }

  async findUserById(userId: number) {
    const [rows] = await this.pool.query<UserRow[]>(
      `
        SELECT user_id, full_name, email, phone, password_hash, role, status, is_verified, created_at, updated_at
        FROM users
        WHERE user_id = ?
        LIMIT 1
      `,
      [userId],
    );

    return rows[0] ? this.mapUser(rows[0]) : undefined;
  }

  async createUser(input: CreateUserInput) {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO users (full_name, email, phone, password_hash, role, status, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.fullName,
        input.email,
        input.phone,
        input.passwordHash,
        input.role,
        input.status,
        input.isVerified,
      ],
    );

    return this.findUserById(result.insertId);
  }

  async updateUser(userId: number, updates: Partial<Omit<User, 'id'>>) {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.fullName !== undefined) {
      fields.push('full_name = ?');
      values.push(updates.fullName);
    }

    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }

    if (updates.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updates.phone);
    }

    if (updates.passwordHash !== undefined) {
      fields.push('password_hash = ?');
      values.push(updates.passwordHash);
    }

    if (updates.role !== undefined) {
      fields.push('role = ?');
      values.push(updates.role);
    }

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }

    if (updates.isVerified !== undefined) {
      fields.push('is_verified = ?');
      values.push(updates.isVerified);
    }

    if (!fields.length) {
      return this.findUserById(userId);
    }

    await this.pool.query(
      `
        UPDATE users
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `,
      [...values, userId],
    );

    return this.findUserById(userId);
  }

  async createOtp(input: CreateOtpInput) {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO user_otps (user_id, purpose, target_value, otp_code, expired_at, is_used)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        input.userId,
        input.purpose,
        input.targetValue,
        input.otpCode,
        input.expiredAt,
        false,
      ],
    );

    return this.findOtpById(result.insertId);
  }

  async findLatestOtp(targetValue: string, purpose: AuthPurpose) {
    const [rows] = await this.pool.query<UserOtpRow[]>(
      `
        SELECT otp_id, user_id, purpose, target_value, otp_code, expired_at, is_used, created_at
        FROM user_otps
        WHERE LOWER(target_value) = LOWER(?) AND purpose = ?
        ORDER BY otp_id DESC
        LIMIT 1
      `,
      [targetValue.trim(), purpose],
    );

    return rows[0] ? this.mapOtp(rows[0]) : undefined;
  }

  async markOtpAsUsed(otpId: number) {
    await this.pool.execute(
      `
        UPDATE user_otps
        SET is_used = ?
        WHERE otp_id = ?
      `,
      [true, otpId],
    );

    return this.findOtpById(otpId);
  }

  async createRefreshToken(input: CreateRefreshTokenInput) {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO auth_refresh_tokens (user_id, token_hash, expires_at, status)
        VALUES (?, ?, ?, ?)
      `,
      [input.userId, input.tokenHash, input.expiresAt, 'active'],
    );

    return this.findRefreshTokenById(result.insertId);
  }

  async findActiveRefreshToken(tokenHash: string) {
    const [rows] = await this.pool.query<RefreshTokenRow[]>(
      `
        SELECT id, user_id, token_hash, expires_at, status, revoked_at, created_at
        FROM auth_refresh_tokens
        WHERE token_hash = ? AND status = 'active'
        ORDER BY id DESC
        LIMIT 1
      `,
      [tokenHash],
    );

    return rows[0] ? this.mapRefreshToken(rows[0]) : undefined;
  }

  async revokeRefreshToken(tokenId: number) {
    await this.pool.execute(
      `
        UPDATE auth_refresh_tokens
        SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [tokenId],
    );

    return this.findRefreshTokenById(tokenId);
  }

  async deleteUser(userId: number) {
    await this.pool.execute(
      `
        DELETE FROM user_otps
        WHERE user_id = ?
      `,
      [userId],
    );

    await this.pool.execute(
      `
        DELETE FROM auth_refresh_tokens
        WHERE user_id = ?
      `,
      [userId],
    );

    await this.pool.execute(
      `
        DELETE FROM users
        WHERE user_id = ?
      `,
      [userId],
    );
  }

  async getHomeCategories(limit = 8) {
    const hasStatus = await this.hasColumn('categories', 'status');
    const [rows] = await this.pool.query<CategoryRow[]>(
      `
        SELECT category_id, name
        FROM categories
        ${hasStatus ? "WHERE status = 'active'" : ''}
        ORDER BY category_id ASC
        LIMIT ?
      `,
      [limit],
    );

    return rows.map((row) => ({
      id: row.category_id,
      name: row.name,
    }));
  }

  async getHomeBrands(limit = 12) {
    const [rows] = await this.pool.query<BrandRow[]>(
      `
        SELECT brand_id, name
        FROM brands
        ORDER BY brand_id ASC
        LIMIT ?
      `,
      [limit],
    );

    return rows.map((row) => ({
      id: row.brand_id,
      name: row.name,
    }));
  }

  async getHomeProducts(limit = 12) {
    const hasStatus = await this.hasColumn('products', 'status');

    const [rows] = await this.pool.query<ProductRow[]>(
      `
        SELECT
          p.product_id,
          p.category_id,
          p.brand_id,
          p.name,
          p.base_price,
          ${hasStatus ? 'p.status,' : "'active' AS status,"}
          b.name AS brand_name,
          pi.image_url AS primary_image_url
        FROM products p
        LEFT JOIN brands b ON b.brand_id = p.brand_id
        LEFT JOIN product_images pi
          ON pi.product_id = p.product_id
         AND pi.is_primary = TRUE
        ${hasStatus ? "WHERE p.status = 'active'" : ''}
        ORDER BY p.product_id ASC
        LIMIT ?
      `,
      [limit],
    );

    return rows.map((row) => ({
      id: row.product_id,
      name: row.name,
      basePrice: Number(row.base_price),
      status: row.status ?? 'active',
      categoryId: row.category_id,
      brand: row.brand_id
        ? {
            id: row.brand_id,
            name: row.brand_name,
          }
        : null,
      primaryImageUrl: row.primary_image_url,
    }));
  }

  getPermissionsByRole(role: UserRole) {
    return this.rolePermissions[role] ?? [];
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  private async findOtpById(otpId: number) {
    const [rows] = await this.pool.query<UserOtpRow[]>(
      `
        SELECT otp_id, user_id, purpose, target_value, otp_code, expired_at, is_used, created_at
        FROM user_otps
        WHERE otp_id = ?
        LIMIT 1
      `,
      [otpId],
    );

    return rows[0] ? this.mapOtp(rows[0]) : undefined;
  }

  private async findRefreshTokenById(tokenId: number) {
    const [rows] = await this.pool.query<RefreshTokenRow[]>(
      `
        SELECT id, user_id, token_hash, expires_at, status, revoked_at, created_at
        FROM auth_refresh_tokens
        WHERE id = ?
        LIMIT 1
      `,
      [tokenId],
    );

    return rows[0] ? this.mapRefreshToken(rows[0]) : undefined;
  }

  private async ensureRefreshTokenTable() {
    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        status ENUM('active', 'revoked') NOT NULL DEFAULT 'active',
        revoked_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_auth_refresh_tokens_token_hash (token_hash),
        KEY idx_auth_refresh_tokens_user_id (user_id)
      )
    `);
  }

  private async hasColumn(tableName: string, columnName: string) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_schema = ?
          AND table_name = ?
          AND column_name = ?
      `,
      [process.env.MYSQL_DATABASE ?? 'Sello_commerce', tableName, columnName],
    );

    return Number(rows[0]?.total ?? 0) > 0;
  }

  private mapUser(row: UserRow): User {
    return {
      id: row.user_id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      passwordHash: row.password_hash,
      role: row.role,
      status: row.status === 'blocked' ? 'blocked' : 'active',
      isVerified: Boolean(row.is_verified),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapOtp(row: UserOtpRow): UserOtp {
    return {
      id: row.otp_id,
      userId: row.user_id,
      purpose: row.purpose,
      targetValue: row.target_value,
      otpCode: row.otp_code,
      expiredAt: new Date(row.expired_at),
      isUsed: Boolean(row.is_used),
      createdAt: new Date(row.created_at),
    };
  }

  private mapRefreshToken(row: RefreshTokenRow): RefreshTokenRecord {
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      status: row.status,
      revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
      createdAt: new Date(row.created_at),
    };
  }

  private getPoolOptions(): PoolOptions {
    return {
      host: process.env.MYSQL_HOST ?? '127.0.0.1',
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DATABASE ?? 'Sello_commerce',
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10),
      queueLimit: 0,
      timezone: process.env.MYSQL_TIMEZONE ?? 'Z',
    };
  }
}
