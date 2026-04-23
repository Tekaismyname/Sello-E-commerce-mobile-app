import { BadRequestException, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  createPool,
  Pool,
  PoolOptions,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import {
  AdminLevel,
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
  admin_level: number | null;
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
  slug?: string | null;
  image_url?: string | null;
  parent_id?: number | null;
  parent_name?: string | null;
  description?: string | null;
  status?: string | null;
  product_count?: number | string;
  child_count?: number | string;
}

interface BrandRow extends RowDataPacket {
  brand_id: number;
  name: string;
  slug?: string | null;
  logo_url?: string | null;
  status?: string | null;
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

interface CountRow extends RowDataPacket {
  total: number | string;
}

interface DashboardOrdersRow extends RowDataPacket {
  order_status: string;
  total: number | string;
}

interface RevenueRow extends RowDataPacket {
  revenue: number | string | null;
}

interface SimpleStatusRow extends RowDataPacket {
  total: number | string;
  active_total?: number | string;
  inactive_total?: number | string;
  unread_total?: number | string;
}

interface AdminUserListRow extends UserRow {
  admin_name?: string | null;
}

interface OrderListRow extends RowDataPacket {
  order_id: number;
  order_code: string;
  user_id: number;
  full_name: string;
  email: string;
  payment_method_name: string;
  total_amount: number | string;
  order_status: string;
  payment_status: string;
  placed_at: Date | string;
}

interface OrderItemRow extends RowDataPacket {
  order_item_id: number;
  product_id: number;
  variant_id: number | null;
  product_name_snapshot: string;
  variant_snapshot: string | null;
  unit_price: number | string;
  quantity: number;
  line_total: number | string;
}

interface PaymentRow extends RowDataPacket {
  payment_id: number;
  payment_method_id: number;
  method_code?: string | null;
  method_name?: string | null;
  amount: number | string;
  transaction_code: string | null;
  payment_status: string;
  paid_at: Date | string | null;
  fail_reason: string | null;
}

interface ShipmentRow extends RowDataPacket {
  shipment_id: number;
  carrier_name: string | null;
  tracking_code: string | null;
  shipping_type: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_number: string | null;
  estimated_delivery_at: Date | string | null;
  shipped_at: Date | string | null;
  delivered_at: Date | string | null;
  shipment_status: string;
}

interface OrderStatusHistoryRow extends RowDataPacket {
  history_id: number;
  status: string;
  description: string | null;
  updated_by: number | null;
  created_at: Date | string;
}

interface CartRow extends RowDataPacket {
  cart_id: number;
  user_id: number;
  status: string;
}

interface CartItemDetailRow extends RowDataPacket {
  cart_item_id: number;
  cart_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  unit_price: number | string;
  selected: number | boolean;
  product_name: string;
  product_status: string;
  base_price: number | string;
  primary_image_url: string | null;
  variant_color: string | null;
  variant_size: string | null;
  variant_stock_qty: number | null;
  variant_status: string | null;
}

interface AddressRow extends RowDataPacket {
  address_id: number;
  user_id: number;
  recipient_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail_address: string;
  address_type: string | null;
  is_default: number | boolean;
  latitude: number | string | null;
  longitude: number | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface PaymentMethodRow extends RowDataPacket {
  payment_method_id: number;
  method_code: string;
  method_name: string;
  status: string;
}

interface VoucherRow extends RowDataPacket {
  voucher_id: number;
  code: string;
  name: string;
  description: string | null;
  voucher_type: string;
  discount_type: string;
  discount_value: number | string;
  max_discount_value: number | string | null;
  min_order_value: number | string;
  usage_limit: number;
  used_count: number;
  start_at: Date | string | null;
  end_at: Date | string | null;
  is_active: number | boolean;
}

interface NotificationRow extends RowDataPacket {
  notification_id: number;
  user_id: number;
  full_name?: string;
  email?: string;
  title: string;
  content: string | null;
  notification_type: string;
  image_url?: string | null;
  is_read: number | boolean;
  created_at: Date | string;
}

interface WishlistRow extends RowDataPacket {
  wishlist_id: number;
  user_id: number;
  name: string;
  created_at: Date | string;
}

interface WishlistItemRow extends RowDataPacket {
  wishlist_item_id: number;
  wishlist_id: number;
  product_id: number;
  product_name: string;
  base_price: number | string;
  primary_image_url: string | null;
  created_at: Date | string;
}

interface ReviewListRow extends RowDataPacket {
  review_id: number;
  product_id?: number;
  product_name?: string;
  user_id: number;
  full_name: string;
  email?: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: number | boolean;
  moderation_status?: string | null;
  moderation_note?: string | null;
  moderated_by?: number | null;
  moderated_at?: Date | string | null;
  created_at: Date | string;
  media_urls?: string | null;
}

@Injectable()
export class MySqlDatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(MySqlDatabaseService.name);

  private normalizeAdminBrandId(brandId?: number | null) {
    return brandId && brandId > 0 ? brandId : null;
  }

  private readonly rolePermissions: RolePermissionMap = {
    admin: [
      'system:dashboard:read',
      'users:read',
      'users:status:update',
      'users:role:update',
      'orders:read',
      'orders:update',
      'products:read',
      'products:create',
      'products:update',
      'products:status:update',
      'reports:read',
      'reports:export',
      'system:config:update',
      'categories:read',
      'categories:create',
      'categories:update',
      'categories:delete',
      'brands:read',
      'brands:create',
      'brands:update',
      'vouchers:read',
      'vouchers:create',
      'vouchers:update',
      'vouchers:delete',
      'notifications:read',
      'notifications:create',
      'reviews:read',
      'reviews:moderate',
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
    await this.pool.query(`SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await this.ensureRefreshTokenTable();
    await this.ensureAdminFeatureColumns();
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
        SELECT user_id, full_name, email, phone, password_hash, role, admin_level, status, is_verified, created_at, updated_at
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
        SELECT user_id, full_name, email, phone, password_hash, role, admin_level, status, is_verified, created_at, updated_at
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
        SELECT user_id, full_name, email, phone, password_hash, role, admin_level, status, is_verified, created_at, updated_at
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
        INSERT INTO users (full_name, email, phone, password_hash, role, admin_level, status, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.fullName,
        input.email,
        input.phone,
        input.passwordHash,
        input.role,
        input.adminLevel ?? null,
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

    if (updates.adminLevel !== undefined) {
      fields.push('admin_level = ?');
      values.push(updates.adminLevel);
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

  async getPublicProductDetail(productId: number) {
    const product = await this.getAdminProductDetail(productId);

    if (!product) {
      return undefined;
    }

    const [reviewRows] = await this.pool.query<ReviewListRow[]>(
      `
        SELECT
          pr.review_id,
          pr.user_id,
          u.full_name,
          pr.rating,
          pr.title,
          pr.comment,
          pr.is_verified_purchase,
          pr.created_at
        FROM product_reviews pr
        INNER JOIN users u ON u.user_id = pr.user_id
        WHERE pr.product_id = ?
          AND COALESCE(pr.moderation_status, 'visible') = 'visible'
        ORDER BY pr.review_id DESC
      `,
      [productId],
    );

    return {
      ...product,
      reviews: reviewRows.map((row) => ({
        id: row.review_id,
        userId: row.user_id,
        fullName: row.full_name,
        rating: row.rating,
        title: row.title,
        comment: row.comment,
        isVerifiedPurchase: Boolean(row.is_verified_purchase),
        createdAt: new Date(row.created_at),
      })),
    };
  }

  async getCartDetail(userId: number) {
    const cart = await this.findOrCreateCart(userId);
    const items = await this.getCartItemsByCartId(cart.cartId);

    return this.toCartResponse(cart.cartId, items);
  }

  async addCartItem(
    userId: number,
    payload: { productId: number; variantId?: number | null; quantity: number },
  ) {
    const cart = await this.findOrCreateCart(userId);
    const purchasable = await this.getPurchasableProduct(
      payload.productId,
      payload.variantId ?? null,
    );

    if (!purchasable) {
      throw new BadRequestException('Product or variant is invalid');
    }

    if (payload.quantity > purchasable.availableStock) {
      throw new BadRequestException(
        'Requested quantity exceeds available stock',
      );
    }

    const [existingRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT cart_item_id, quantity
        FROM cart_items
        WHERE cart_id = ?
          AND product_id = ?
          AND (
            (variant_id IS NULL AND ? IS NULL)
            OR variant_id = ?
          )
        LIMIT 1
      `,
      [cart.cartId, payload.productId, payload.variantId ?? null, payload.variantId ?? null],
    );

    if (existingRows[0]) {
      const nextQuantity = Number(existingRows[0].quantity) + payload.quantity;

      if (nextQuantity > purchasable.availableStock) {
        throw new BadRequestException(
          'Requested quantity exceeds available stock',
        );
      }

      await this.pool.execute(
        `
          UPDATE cart_items
          SET quantity = ?, unit_price = ?, selected = TRUE
          WHERE cart_item_id = ?
        `,
        [nextQuantity, purchasable.unitPrice, existingRows[0].cart_item_id],
      );
    } else {
      await this.pool.execute(
        `
          INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price, selected)
          VALUES (?, ?, ?, ?, ?, TRUE)
        `,
        [
          cart.cartId,
          payload.productId,
          payload.variantId ?? null,
          payload.quantity,
          purchasable.unitPrice,
        ],
      );
    }

    return this.getCartDetail(userId);
  }

  async updateCartItem(
    userId: number,
    cartItemId: number,
    payload: { quantity: number },
  ) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT ci.product_id, ci.variant_id
        FROM cart_items ci
        INNER JOIN carts c ON c.cart_id = ci.cart_id
        WHERE ci.cart_item_id = ? AND c.user_id = ?
        LIMIT 1
      `,
      [cartItemId, userId],
    );

    const item = rows[0];
    if (!item) {
      return undefined;
    }

    const purchasable = await this.getPurchasableProduct(
      item.product_id,
      item.variant_id,
    );

    if (!purchasable || payload.quantity > purchasable.availableStock) {
      throw new BadRequestException(
        'Requested quantity exceeds available stock',
      );
    }

    await this.pool.execute(
      `
        UPDATE cart_items
        SET quantity = ?, unit_price = ?
        WHERE cart_item_id = ?
      `,
      [payload.quantity, purchasable.unitPrice, cartItemId],
    );

    return this.getCartDetail(userId);
  }

  async selectCartItem(
    userId: number,
    cartItemId: number,
    payload: { selected: boolean },
  ) {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        UPDATE cart_items ci
        INNER JOIN carts c ON c.cart_id = ci.cart_id
        SET ci.selected = ?
        WHERE ci.cart_item_id = ? AND c.user_id = ?
      `,
      [payload.selected, cartItemId, userId],
    );

    if (!result.affectedRows) {
      return undefined;
    }

    return this.getCartDetail(userId);
  }

  async deleteCartItem(userId: number, cartItemId: number) {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        DELETE ci
        FROM cart_items ci
        INNER JOIN carts c ON c.cart_id = ci.cart_id
        WHERE ci.cart_item_id = ? AND c.user_id = ?
      `,
      [cartItemId, userId],
    );

    return result.affectedRows > 0;
  }

  async getCartSummary(userId: number) {
    const cart = await this.findOrCreateCart(userId);
    const items = await this.getCartItemsByCartId(cart.cartId);
    const selectedItems = items.filter((item) => item.selected);
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    return {
      cartId: cart.cartId,
      selectedItemsCount: selectedItems.length,
      subtotal,
      totalAmount: subtotal,
    };
  }

  async getCheckoutPreview(userId: number, voucherCode?: string) {
    const cart = await this.findOrCreateCart(userId);
    const items = await this.getCartItemsByCartId(cart.cartId);
    const selectedItems = items.filter((item) => item.selected);

    if (!selectedItems.length) {
      throw new BadRequestException('No selected cart items for checkout');
    }

    await this.ensureSelectedItemsHaveStock(selectedItems);

    const addresses = await this.getUserAddresses(userId);
    const paymentMethods = await this.getActivePaymentMethods();
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const shippingFee = subtotal > 0 ? 30000 : 0;
    const voucher =
      voucherCode?.trim() ? await this.validateVoucher(voucherCode, subtotal) : null;
    const discount = voucher
      ? this.computeVoucherDiscount(voucher, subtotal)
      : 0;

    return {
      items: selectedItems,
      addresses,
      paymentMethods,
      voucher: voucher
        ? {
            code: voucher.code,
            name: voucher.name,
            discount,
          }
        : null,
      pricing: {
        subtotal,
        shippingFee,
        discount,
        totalAmount: Math.max(subtotal + shippingFee - discount, 0),
      },
    };
  }

  async applyVoucherToCheckout(userId: number, code: string) {
    return this.getCheckoutPreview(userId, code);
  }

  async createOrderFromCart(
    userId: number,
    payload: {
      addressId: number;
      paymentMethodId: number;
      voucherCode?: string;
      note?: string;
    },
  ) {
    const cart = await this.findOrCreateCart(userId);
    const items = (await this.getCartItemsByCartId(cart.cartId)).filter(
      (item) => item.selected,
    );

    if (!items.length) {
      throw new BadRequestException('No selected cart items for checkout');
    }

    await this.ensureSelectedItemsHaveStock(items);

    const address = await this.getAddressByUser(userId, payload.addressId);
    if (!address) {
      throw new BadRequestException('Address is invalid');
    }

    const paymentMethod = await this.getPaymentMethodById(payload.paymentMethodId);
    if (!paymentMethod || paymentMethod.status !== 'active') {
      throw new BadRequestException('Payment method is invalid');
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const shippingFee = subtotal > 0 ? 30000 : 0;
    const voucher =
      payload.voucherCode?.trim()
        ? await this.validateVoucher(payload.voucherCode, subtotal)
        : null;
    const discount = voucher
      ? this.computeVoucherDiscount(voucher, subtotal)
      : 0;
    const totalAmount = Math.max(subtotal + shippingFee - discount, 0);

    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const orderCode = `ORD${Date.now()}`;
      const [orderResult] = await connection.execute<ResultSetHeader>(
        `
          INSERT INTO orders (
            order_code, user_id, address_id, voucher_id, payment_method_id,
            subtotal, shipping_fee, product_discount, total_amount, order_status, payment_status, note
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?)
        `,
        [
          orderCode,
          userId,
          payload.addressId,
          voucher?.voucher_id ?? null,
          payload.paymentMethodId,
          subtotal,
          shippingFee,
          discount,
          totalAmount,
          payload.note ?? null,
        ],
      );

      const orderId = orderResult.insertId;

      for (const item of items) {
        await connection.execute(
          `
            INSERT INTO order_items (
              order_id, product_id, variant_id, product_name_snapshot, variant_snapshot, unit_price, quantity, line_total
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            orderId,
            item.productId,
            item.variantId,
            item.product.name,
            item.variant
              ? `${item.variant.color ?? ''} ${item.variant.size ?? ''}`.trim() || null
              : null,
            item.unitPrice,
            item.quantity,
            item.unitPrice * item.quantity,
          ],
        );

        if (item.variantId) {
          await connection.execute(
            `
              UPDATE product_variants
              SET stock_qty = stock_qty - ?
              WHERE variant_id = ?
            `,
            [item.quantity, item.variantId],
          );
        }
      }

      await connection.execute(
        `
          INSERT INTO order_status_histories (order_id, status, description, updated_by)
          VALUES (?, 'pending', 'Order placed successfully', ?)
        `,
        [orderId, userId],
      );

      if (voucher) {
        await connection.execute(
          `
            UPDATE vouchers
            SET used_count = used_count + 1
            WHERE voucher_id = ?
          `,
          [voucher.voucher_id],
        );
      }

      const [paymentResult] = await connection.execute<ResultSetHeader>(
        `
          INSERT INTO payments (order_id, payment_method_id, amount, payment_status)
          VALUES (?, ?, ?, 'pending')
        `,
        [orderId, payload.paymentMethodId, totalAmount],
      );

      const paymentId = paymentResult.insertId;

      if (paymentMethod.method_code === 'COD') {
        await connection.execute(
          `
            DELETE FROM cart_items
            WHERE cart_id = ? AND selected = TRUE
          `,
          [cart.cartId],
        );

        await connection.execute(
          `
            INSERT INTO notifications (user_id, title, content, notification_type)
            VALUES (?, ?, ?, 'order')
          `,
          [userId, `Order ${orderCode} created`, 'Your order has been placed successfully'],
        );

        await connection.commit();

        return {
          orderId,
          orderCode,
          paymentId,
          paymentType: 'cod',
          paymentStatus: 'pending',
          orderStatus: 'pending',
        };
      }

      await connection.commit();

      return {
        orderId,
        orderCode,
        paymentId,
        paymentType: 'online',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        ...this.buildMockPaymentQr(paymentId, orderCode, totalAmount),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async handleMockPaymentCallback(
    paymentId: number,
    result: 'success' | 'failed',
  ) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const [paymentRows] = await connection.query<RowDataPacket[]>(
        `
          SELECT p.payment_id, p.order_id, o.user_id, o.order_code
          FROM payments p
          INNER JOIN orders o ON o.order_id = p.order_id
          WHERE p.payment_id = ?
          LIMIT 1
        `,
        [paymentId],
      );

      const payment = paymentRows[0];
      if (!payment) {
        await connection.rollback();
        return undefined;
      }

      await connection.execute(
        `
          UPDATE payments
          SET payment_status = ?
          WHERE payment_id = ?
        `,
        [result === 'success' ? 'success' : 'failed', paymentId],
      );

      await connection.execute(
        `
          UPDATE orders
          SET payment_status = ? ${result === 'success' ? ", order_status = 'confirmed'" : ''}
          WHERE order_id = ?
        `,
        [result === 'success' ? 'paid' : 'failed', payment.order_id],
      );

      if (result === 'success') {
        const [cartRows] = await connection.query<CartRow[]>(
          `
            SELECT cart_id, user_id, status
            FROM carts
            WHERE user_id = ?
            LIMIT 1
          `,
          [payment.user_id],
        );

        if (cartRows[0]) {
          await connection.execute(
            `
              DELETE FROM cart_items
              WHERE cart_id = ? AND selected = TRUE
            `,
            [cartRows[0].cart_id],
          );
        }

        await connection.execute(
          `
            INSERT INTO notifications (user_id, title, content, notification_type)
            VALUES (?, ?, ?, 'order')
          `,
          [
            payment.user_id,
            `Payment for ${payment.order_code} succeeded`,
            'Your payment has been confirmed successfully',
          ],
        );
      }

      await connection.commit();

      return {
        paymentId,
        orderId: payment.order_id,
        status: result === 'success' ? 'success' : 'failed',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUserOrders(userId: number) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT order_id, order_code, subtotal, shipping_fee, product_discount, total_amount, order_status, payment_status, placed_at
        FROM orders
        WHERE user_id = ?
        ORDER BY order_id DESC
      `,
      [userId],
    );

    return rows.map((row) => ({
      id: row.order_id,
      orderCode: row.order_code,
      subtotal: Number(row.subtotal),
      shippingFee: Number(row.shipping_fee),
      discount: Number(row.product_discount ?? 0),
      totalAmount: Number(row.total_amount),
      orderStatus: row.order_status,
      paymentStatus: row.payment_status,
      placedAt: new Date(row.placed_at),
    }));
  }

  async getUserOrderDetail(userId: number, orderId: number) {
    const [orderRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT *
        FROM orders
        WHERE order_id = ? AND user_id = ?
        LIMIT 1
      `,
      [orderId, userId],
    );

    const order = orderRows[0];
    if (!order) {
      return undefined;
    }

    const [itemRows, paymentRows, shipmentRows, historyRows] = await Promise.all([
      this.pool.query<RowDataPacket[]>(
        `
          SELECT order_item_id, product_id, variant_id, product_name_snapshot, variant_snapshot, unit_price, quantity, line_total
          FROM order_items
          WHERE order_id = ?
          ORDER BY order_item_id ASC
        `,
        [orderId],
      ),
      this.pool.query<RowDataPacket[]>(
        `
          SELECT p.payment_id, p.payment_method_id, pm.method_code, pm.method_name, p.amount, p.transaction_code,
                 p.payment_status, p.paid_at, p.fail_reason
          FROM payments p
          INNER JOIN payment_methods pm ON pm.payment_method_id = p.payment_method_id
          WHERE p.order_id = ?
          LIMIT 1
        `,
        [orderId],
      ),
      this.pool.query<RowDataPacket[]>(
        `
          SELECT shipment_id, carrier_name, tracking_code, shipping_type, shipment_status, shipped_at, delivered_at
          FROM shipments
          WHERE order_id = ?
          LIMIT 1
        `,
        [orderId],
      ),
      this.pool.query<OrderStatusHistoryRow[]>(
        `
          SELECT history_id, status, description, updated_by, created_at
          FROM order_status_histories
          WHERE order_id = ?
          ORDER BY history_id DESC
        `,
        [orderId],
      ),
    ]);

    return {
      id: order.order_id,
      orderCode: order.order_code,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shipping_fee),
      discount: Number(order.product_discount ?? 0),
      totalAmount: Number(order.total_amount),
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      note: order.note,
      placedAt: new Date(order.placed_at),
      items: itemRows[0].map((row) => ({
        id: row.order_item_id,
        productId: row.product_id,
        variantId: row.variant_id,
        productName: row.product_name_snapshot,
        variantSnapshot: row.variant_snapshot,
        unitPrice: Number(row.unit_price),
        quantity: row.quantity,
        lineTotal: Number(row.line_total),
      })),
      payment: paymentRows[0][0]
        ? {
            id: paymentRows[0][0].payment_id,
            paymentMethodId: paymentRows[0][0].payment_method_id,
            methodCode: paymentRows[0][0].method_code,
            methodName: paymentRows[0][0].method_name,
            amount: Number(paymentRows[0][0].amount),
            transactionCode: paymentRows[0][0].transaction_code,
            paymentStatus: paymentRows[0][0].payment_status,
            paidAt: paymentRows[0][0].paid_at
              ? new Date(paymentRows[0][0].paid_at)
              : null,
            failReason: paymentRows[0][0].fail_reason,
            ...(paymentRows[0][0].method_code === 'COD'
              ? {}
              : this.buildMockPaymentQr(
                  paymentRows[0][0].payment_id,
                  order.order_code,
                  Number(paymentRows[0][0].amount),
                )),
          }
        : null,
      shipment: shipmentRows[0][0]
        ? {
            id: shipmentRows[0][0].shipment_id,
            carrierName: shipmentRows[0][0].carrier_name,
            trackingCode: shipmentRows[0][0].tracking_code,
            shippingType: shipmentRows[0][0].shipping_type,
            shipmentStatus: shipmentRows[0][0].shipment_status,
            shippedAt: shipmentRows[0][0].shipped_at
              ? new Date(shipmentRows[0][0].shipped_at)
              : null,
            deliveredAt: shipmentRows[0][0].delivered_at
              ? new Date(shipmentRows[0][0].delivered_at)
              : null,
          }
        : null,
      statusHistory: historyRows[0].map((row) => ({
        id: row.history_id,
        status: row.status,
        description: row.description,
        updatedBy: row.updated_by,
        createdAt: new Date(row.created_at),
      })),
    };
  }

  async cancelUserOrder(userId: number, orderId: number) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const [orderRows] = await connection.query<RowDataPacket[]>(
        `
          SELECT order_id, order_status, payment_status
          FROM orders
          WHERE order_id = ? AND user_id = ?
          LIMIT 1
        `,
        [orderId, userId],
      );

      const order = orderRows[0];
      if (!order) {
        await connection.rollback();
        return undefined;
      }

      if (!['pending', 'confirmed'].includes(order.order_status)) {
        throw new BadRequestException('Order cannot be cancelled');
      }

      await connection.execute(
        `
          UPDATE orders
          SET order_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
          WHERE order_id = ?
        `,
        [orderId],
      );

      await connection.execute(
        `
          INSERT INTO order_status_histories (order_id, status, description, updated_by)
          VALUES (?, 'cancelled', 'Cancelled by customer', ?)
        `,
        [orderId, userId],
      );

      const [itemRows] = await connection.query<RowDataPacket[]>(
        `
          SELECT variant_id, quantity
          FROM order_items
          WHERE order_id = ?
        `,
        [orderId],
      );

      for (const item of itemRows) {
        if (item.variant_id) {
          await connection.execute(
            `
              UPDATE product_variants
              SET stock_qty = stock_qty + ?
              WHERE variant_id = ?
            `,
            [item.quantity, item.variant_id],
          );
        }
      }

      if (order.payment_status === 'paid') {
        await connection.execute(
          `
            UPDATE payments
            SET payment_status = 'refunded'
            WHERE order_id = ?
          `,
          [orderId],
        );

        await connection.execute(
          `
            UPDATE orders
            SET payment_status = 'refunded'
            WHERE order_id = ?
          `,
          [orderId],
        );
      }

      await connection.commit();
      return this.getUserOrderDetail(userId, orderId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getOrderTracking(userId: number, orderId: number) {
    const [orderRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT o.order_id, o.order_code, o.order_status, o.placed_at,
               a.recipient_name, a.phone, a.province, a.district, a.ward,
               a.detail_address, a.latitude, a.longitude
        FROM orders o
        INNER JOIN addresses a ON a.address_id = o.address_id
        WHERE o.order_id = ? AND o.user_id = ?
        LIMIT 1
      `,
      [orderId, userId],
    );

    const order = orderRows[0];
    if (!order) {
      return undefined;
    }

    const [shipmentRows, historyRows] = await Promise.all([
      this.pool.query<ShipmentRow[]>(
        `
          SELECT shipment_id, carrier_name, tracking_code, shipping_type, driver_name, driver_phone, vehicle_number,
                 estimated_delivery_at, shipped_at, delivered_at, shipment_status
          FROM shipments
          WHERE order_id = ?
          LIMIT 1
        `,
        [orderId],
      ),
      this.pool.query<OrderStatusHistoryRow[]>(
        `
          SELECT history_id, status, description, updated_by, created_at
          FROM order_status_histories
          WHERE order_id = ?
          ORDER BY history_id ASC
        `,
        [orderId],
      ),
    ]);

    const destination = this.buildMockDestination(order);
    const currentLocation = this.buildMockDriverLocation(
      destination.latitude,
      destination.longitude,
      order.order_status,
    );
    const shipment = shipmentRows[0][0];

    return {
      shipment: shipment
        ? {
            id: shipment.shipment_id,
            carrierName: shipment.carrier_name,
            trackingCode: shipment.tracking_code,
            shippingType: shipment.shipping_type,
            driverName: shipment.driver_name,
            driverPhone: shipment.driver_phone,
            vehicleNumber: shipment.vehicle_number,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            shipmentStatus: shipment.shipment_status,
            estimatedDeliveryAt: shipment.estimated_delivery_at
              ? new Date(shipment.estimated_delivery_at)
              : null,
            shippedAt: shipment.shipped_at
              ? new Date(shipment.shipped_at)
              : null,
            deliveredAt: shipment.delivered_at
              ? new Date(shipment.delivered_at)
              : null,
          }
        : {
            id: 0,
            carrierName: 'Sello Express',
            trackingCode: `MOCK-${order.order_code ?? order.order_id}`,
            shippingType: 'Giao tieu chuan',
            driverName: 'Nguyen Van Tai',
            driverPhone: '0909009009',
            vehicleNumber: 'SELLO-01',
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            shipmentStatus:
              order.order_status === 'delivered'
                ? 'delivered'
                : order.order_status === 'shipping'
                  ? 'shipping'
                  : 'pending',
            estimatedDeliveryAt: new Date(
              new Date(order.placed_at).getTime() + 3 * 24 * 60 * 60 * 1000,
            ),
            shippedAt:
              order.order_status === 'shipping' || order.order_status === 'delivered'
                ? new Date(order.placed_at)
                : null,
            deliveredAt:
              order.order_status === 'delivered' ? new Date() : null,
          },
      destination,
      timeline: historyRows[0].map((row) => ({
        id: row.history_id,
        status: row.status,
        description: row.description,
        createdAt: new Date(row.created_at),
      })),
    };
  }

  async updateCustomerProfile(
    userId: number,
    payload: {
      fullName?: string;
      avatarUrl?: string;
      gender?: 'male' | 'female' | 'other';
      birthDate?: string;
      emailOptIn?: boolean;
    },
  ) {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (payload.fullName !== undefined) {
      fields.push('full_name = ?');
      values.push(payload.fullName);
    }
    if (payload.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(payload.avatarUrl);
    }
    if (payload.gender !== undefined) {
      fields.push('gender = ?');
      values.push(payload.gender);
    }
    if (payload.birthDate !== undefined) {
      fields.push('birth_date = ?');
      values.push(payload.birthDate);
    }
    if (payload.emailOptIn !== undefined) {
      fields.push('email_opt_in = ?');
      values.push(payload.emailOptIn);
    }

    if (fields.length) {
      await this.pool.query(
        `
          UPDATE users
          SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `,
        [...values, userId],
      );
    }

    const [rows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT user_id, full_name, email, phone, avatar_url, gender, birth_date, email_opt_in, role, admin_level, status, is_verified, created_at, updated_at
        FROM users
        WHERE user_id = ?
        LIMIT 1
      `,
      [userId],
    );

    const row = rows[0];
    return row
      ? {
          id: row.user_id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone,
          avatarUrl: row.avatar_url,
          gender: row.gender,
          birthDate: row.birth_date,
          emailOptIn: Boolean(row.email_opt_in),
          role: row.role,
          adminLevel: this.toAdminLevel(row.admin_level),
          status:
            row.status === 'blocked'
              ? 'blocked'
              : row.status === 'inactive'
                ? 'inactive'
                : 'active',
          isVerified: Boolean(row.is_verified),
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        }
      : undefined;
  }

  async getUserAddresses(userId: number) {
    const [rows] = await this.pool.query<AddressRow[]>(
      `
        SELECT address_id, user_id, recipient_name, phone, province, district, ward, detail_address,
               address_type, is_default, latitude, longitude, created_at, updated_at
        FROM addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, address_id DESC
      `,
      [userId],
    );

    return rows.map((row) => this.mapAddress(row));
  }

  async createUserAddress(
    userId: number,
    payload: {
      recipientName: string;
      phone: string;
      province: string;
      district: string;
      ward: string;
      detailAddress: string;
      addressType?: string;
      isDefault?: boolean;
      latitude?: number;
      longitude?: number;
    },
  ) {
    if (payload.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO addresses (
          user_id, recipient_name, phone, province, district, ward, detail_address, address_type, is_default, latitude, longitude
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        payload.recipientName,
        payload.phone,
        payload.province,
        payload.district,
        payload.ward,
        payload.detailAddress,
        payload.addressType ?? null,
        Boolean(payload.isDefault),
        payload.latitude ?? null,
        payload.longitude ?? null,
      ],
    );

    return this.getAddressByUser(userId, result.insertId);
  }

  async updateUserAddress(
    userId: number,
    addressId: number,
    payload: {
      recipientName?: string;
      phone?: string;
      province?: string;
      district?: string;
      ward?: string;
      detailAddress?: string;
      addressType?: string;
      isDefault?: boolean;
      latitude?: number;
      longitude?: number;
    },
  ) {
    if (payload.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    const fields: string[] = [];
    const values: unknown[] = [];

    if (payload.recipientName !== undefined) {
      fields.push('recipient_name = ?');
      values.push(payload.recipientName);
    }
    if (payload.phone !== undefined) {
      fields.push('phone = ?');
      values.push(payload.phone);
    }
    if (payload.province !== undefined) {
      fields.push('province = ?');
      values.push(payload.province);
    }
    if (payload.district !== undefined) {
      fields.push('district = ?');
      values.push(payload.district);
    }
    if (payload.ward !== undefined) {
      fields.push('ward = ?');
      values.push(payload.ward);
    }
    if (payload.detailAddress !== undefined) {
      fields.push('detail_address = ?');
      values.push(payload.detailAddress);
    }
    if (payload.addressType !== undefined) {
      fields.push('address_type = ?');
      values.push(payload.addressType);
    }
    if (payload.isDefault !== undefined) {
      fields.push('is_default = ?');
      values.push(payload.isDefault);
    }
    if (payload.latitude !== undefined) {
      fields.push('latitude = ?');
      values.push(payload.latitude);
    }
    if (payload.longitude !== undefined) {
      fields.push('longitude = ?');
      values.push(payload.longitude);
    }

    if (!fields.length) {
      return this.getAddressByUser(userId, addressId);
    }

    const [result] = await this.pool.query<ResultSetHeader>(
      `
        UPDATE addresses
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE address_id = ? AND user_id = ?
      `,
      [...values, addressId, userId],
    );

    if (!result.affectedRows) {
      return undefined;
    }

    return this.getAddressByUser(userId, addressId);
  }

  async setDefaultUserAddress(userId: number, addressId: number, isDefault: boolean) {
    if (isDefault) {
      await this.clearDefaultAddress(userId);
    }

    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        UPDATE addresses
        SET is_default = ?, updated_at = CURRENT_TIMESTAMP
        WHERE address_id = ? AND user_id = ?
      `,
      [isDefault, addressId, userId],
    );

    if (!result.affectedRows) {
      return undefined;
    }

    return this.getAddressByUser(userId, addressId);
  }

  async deleteUserAddress(userId: number, addressId: number) {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        DELETE FROM addresses
        WHERE address_id = ? AND user_id = ?
      `,
      [addressId, userId],
    );

    return result.affectedRows > 0;
  }

  async getUserNotifications(userId: number) {
    const [rows] = await this.pool.query<NotificationRow[]>(
      `
        SELECT notification_id, user_id, title, content, notification_type, image_url, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY notification_id DESC
      `,
      [userId],
    );

    return rows.map((row) => ({
      id: row.notification_id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      notificationType: row.notification_type,
      imageUrl: row.image_url ?? null,
      isRead: Boolean(row.is_read),
      createdAt: new Date(row.created_at),
    }));
  }

  async markNotificationRead(userId: number, notificationId: number) {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = ? AND user_id = ?
      `,
      [notificationId, userId],
    );

    if (!result.affectedRows) {
      return undefined;
    }

    const [rows] = await this.pool.query<NotificationRow[]>(
      `
        SELECT notification_id, user_id, title, content, notification_type, image_url, is_read, created_at
        FROM notifications
        WHERE notification_id = ? AND user_id = ?
        LIMIT 1
      `,
      [notificationId, userId],
    );

    const row = rows[0];
    return row
      ? {
          id: row.notification_id,
          userId: row.user_id,
          title: row.title,
          content: row.content,
          notificationType: row.notification_type,
          imageUrl: row.image_url ?? null,
          isRead: Boolean(row.is_read),
          createdAt: new Date(row.created_at),
        }
      : undefined;
  }

  async markAllNotificationsRead(userId: number) {
    await this.pool.execute(
      `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = ?
      `,
      [userId],
    );
  }

  async createAdminContactNotification(
    userId: number,
    input: { subject?: string; message?: string },
  ) {
    if (!input.subject?.trim()) {
      throw new BadRequestException('Contact subject is required');
    }

    if (!input.message?.trim()) {
      throw new BadRequestException('Contact message is required');
    }

    const [userRows] = await this.pool.query<UserRow[]>(
      `
        SELECT user_id, full_name, email, phone, password_hash, role, admin_level, status, is_verified, created_at, updated_at
        FROM users
        WHERE user_id = ?
        LIMIT 1
      `,
      [userId],
    );
    const sender = userRows[0];

    if (!sender) {
      throw new BadRequestException('User not found');
    }

    const [adminRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT user_id
        FROM users
        WHERE role = 'admin' AND status = 'active'
      `,
    );

    if (!adminRows.length) {
      return { insertedCount: 0, targetScope: 'admin_only' };
    }

    const title = `[Lien he admin] ${input.subject.trim()}`;
    const content = [
      `Nguoi gui: ${sender.full_name}`,
      `Email: ${sender.email}`,
      sender.phone ? `Phone: ${sender.phone}` : null,
      '',
      input.message.trim(),
    ]
      .filter((line) => line !== null)
      .join('\n');

    const values = adminRows.map((admin) => [
      admin.user_id,
      title,
      content,
      'system',
      null,
    ]);

    await this.pool.query(
      `
        INSERT INTO notifications (user_id, title, content, notification_type, image_url)
        VALUES ?
      `,
      [values],
    );

    return {
      insertedCount: adminRows.length,
      targetScope: 'admin_only',
    };
  }

  async addWishlistItem(userId: number, productId: number) {
    const wishlist = await this.findOrCreateWishlist(userId);
    const [productRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT product_id
        FROM products
        WHERE product_id = ?
        LIMIT 1
      `,
      [productId],
    );

    if (!productRows[0]) {
      throw new BadRequestException('Product is invalid');
    }

    const [existingRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT wishlist_item_id
        FROM wishlist_items
        WHERE wishlist_id = ? AND product_id = ?
        LIMIT 1
      `,
      [wishlist.wishlist_id, productId],
    );

    if (!existingRows[0]) {
      await this.pool.execute(
        `
          INSERT INTO wishlist_items (wishlist_id, product_id)
          VALUES (?, ?)
        `,
        [wishlist.wishlist_id, productId],
      );
    }

    return this.getWishlist(userId);
  }

  async getWishlist(userId: number) {
    const wishlist = await this.findOrCreateWishlist(userId);

    const [rows] = await this.pool.query<WishlistItemRow[]>(
      `
        SELECT
          wi.wishlist_item_id,
          wi.wishlist_id,
          wi.product_id,
          p.name AS product_name,
          p.base_price,
          pi.image_url AS primary_image_url,
          wi.created_at
        FROM wishlist_items wi
        INNER JOIN products p ON p.product_id = wi.product_id
        LEFT JOIN product_images pi
          ON pi.product_id = p.product_id
         AND pi.is_primary = TRUE
        WHERE wi.wishlist_id = ?
        ORDER BY wi.wishlist_item_id DESC
      `,
      [wishlist.wishlist_id],
    );

    return {
      id: wishlist.wishlist_id,
      name: wishlist.name,
      items: rows.map((row) => ({
        id: row.wishlist_item_id,
        productId: row.product_id,
        productName: row.product_name,
        basePrice: Number(row.base_price),
        primaryImageUrl: row.primary_image_url,
        createdAt: new Date(row.created_at),
      })),
    };
  }

  async deleteWishlistItem(userId: number, wishlistItemId: number) {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        DELETE wi
        FROM wishlist_items wi
        INNER JOIN wishlists w ON w.wishlist_id = wi.wishlist_id
        WHERE wi.wishlist_item_id = ? AND w.user_id = ?
      `,
      [wishlistItemId, userId],
    );

    return result.affectedRows > 0;
  }

  async createProductReview(
    userId: number,
    payload: {
      productId: number;
      rating: number;
      title?: string;
      comment?: string;
      media?: Array<{ mediaUrl: string; mediaType?: 'image' | 'video' }>;
    },
  ) {
    const [eligibleRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT oi.order_item_id
        FROM order_items oi
        INNER JOIN orders o ON o.order_id = oi.order_id
        WHERE o.user_id = ?
          AND oi.product_id = ?
          AND o.order_status = 'delivered'
        ORDER BY oi.order_item_id DESC
      `,
      [userId, payload.productId],
    );

    const eligibleOrderItem = eligibleRows[0];
    if (!eligibleOrderItem) {
      throw new BadRequestException('User is not eligible to review this product');
    }

    const [existingRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT review_id
        FROM product_reviews
        WHERE user_id = ? AND order_item_id = ?
        LIMIT 1
      `,
      [userId, eligibleOrderItem.order_item_id],
    );

    if (existingRows[0]) {
      throw new BadRequestException('User already reviewed this purchase');
    }

    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const [reviewResult] = await connection.execute<ResultSetHeader>(
        `
          INSERT INTO product_reviews (
            product_id, user_id, order_item_id, rating, title, comment, is_verified_purchase
          )
          VALUES (?, ?, ?, ?, ?, ?, TRUE)
        `,
        [
          payload.productId,
          userId,
          eligibleOrderItem.order_item_id,
          payload.rating,
          payload.title ?? null,
          payload.comment ?? null,
        ],
      );

      const reviewId = reviewResult.insertId;

      for (const media of payload.media ?? []) {
        await connection.execute(
          `
            INSERT INTO review_media (review_id, media_url, media_type)
            VALUES (?, ?, ?)
          `,
          [reviewId, media.mediaUrl, media.mediaType ?? 'image'],
        );
      }

      await connection.execute(
        `
          UPDATE products
          SET avg_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM product_reviews
            WHERE product_id = ?
              AND COALESCE(moderation_status, 'visible') = 'visible'
          )
          WHERE product_id = ?
        `,
        [payload.productId, payload.productId],
      );

      await connection.commit();

      return {
        id: reviewId,
        productId: payload.productId,
        userId,
        orderItemId: eligibleOrderItem.order_item_id,
        rating: payload.rating,
        title: payload.title ?? null,
        comment: payload.comment ?? null,
        isVerifiedPurchase: true,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAdminDashboard() {
    const [
      usersQuery,
      productsQuery,
      orderStatusQuery,
      revenueQuery,
      vouchersQuery,
      paymentMethodsQuery,
      notificationsQuery,
    ] = await Promise.all([
      this.pool.query<CountRow[]>(
        `SELECT COUNT(*) AS total FROM users`,
      ),
      this.pool.query<CountRow[]>(
        `SELECT COUNT(*) AS total FROM products`,
      ),
      this.pool.query<DashboardOrdersRow[]>(
        `
          SELECT order_status, COUNT(*) AS total
          FROM orders
          GROUP BY order_status
        `,
      ),
      this.pool.query<RevenueRow[]>(
        `
          SELECT COALESCE(SUM(total_amount), 0) AS revenue
          FROM orders
          WHERE order_status NOT IN ('cancelled', 'returned')
        `,
      ),
      this.pool.query<SimpleStatusRow[]>(
        `
          SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active_total
          FROM vouchers
        `,
      ),
      this.pool.query<SimpleStatusRow[]>(
        `
          SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_total
          FROM payment_methods
        `,
      ),
      this.pool.query<SimpleStatusRow[]>(
        `
          SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) AS unread_total
          FROM notifications
        `,
      ),
    ]);

    const usersResult = usersQuery[0][0];
    const productsResult = productsQuery[0][0];
    const orderStatusRows = orderStatusQuery[0];
    const revenueResult = revenueQuery[0][0];
    const vouchersResult = vouchersQuery[0][0];
    const paymentMethodsResult = paymentMethodsQuery[0][0];
    const notificationsResult = notificationsQuery[0][0];

    return {
      users: Number(usersResult?.total ?? 0),
      products: Number(productsResult?.total ?? 0),
      orderStatusSummary: orderStatusRows.map((row) => ({
        status: row.order_status,
        total: Number(row.total ?? 0),
      })),
      revenue: Number(revenueResult?.revenue ?? 0),
      configSummary: {
        vouchers: {
          total: Number(vouchersResult?.total ?? 0),
          active: Number(vouchersResult?.active_total ?? 0),
        },
        paymentMethods: {
          total: Number(paymentMethodsResult?.total ?? 0),
          active: Number(paymentMethodsResult?.active_total ?? 0),
        },
        notifications: {
          total: Number(notificationsResult?.total ?? 0),
          unread: Number(notificationsResult?.unread_total ?? 0),
        },
      },
    };
  }

  async listAdminCategories() {
    const [rows] = await this.pool.query<CategoryRow[]>(
      `
        SELECT
          c.category_id,
          c.name,
          c.slug,
          c.image_url,
          c.parent_id,
          parent.name AS parent_name,
          c.description,
          c.status,
          COUNT(DISTINCT p.product_id) AS product_count,
          COUNT(DISTINCT child.category_id) AS child_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.category_id
        LEFT JOIN categories child ON child.parent_id = c.category_id
        LEFT JOIN categories parent ON parent.category_id = c.parent_id
        GROUP BY c.category_id
        ORDER BY c.category_id DESC
      `,
    );

    return rows.map((row) => this.mapAdminCategory(row));
  }

  async getAdminCategory(categoryId: number) {
    const [rows] = await this.pool.query<CategoryRow[]>(
      `
        SELECT
          c.category_id,
          c.name,
          c.slug,
          c.image_url,
          c.parent_id,
          parent.name AS parent_name,
          c.description,
          c.status,
          COUNT(DISTINCT p.product_id) AS product_count,
          COUNT(DISTINCT child.category_id) AS child_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.category_id
        LEFT JOIN categories child ON child.parent_id = c.category_id
        LEFT JOIN categories parent ON parent.category_id = c.parent_id
        WHERE c.category_id = ?
        GROUP BY c.category_id
        LIMIT 1
      `,
      [categoryId],
    );

    return rows[0] ? this.mapAdminCategory(rows[0]) : undefined;
  }

  async createAdminCategory(input: {
    name: string;
    slug?: string;
    imageUrl?: string | null;
    parentId?: number | null;
    description?: string | null;
    status?: 'active' | 'inactive';
  }) {
    if (!input.name?.trim()) {
      throw new BadRequestException('Category name is required');
    }

    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO categories (name, slug, image_url, parent_id, description, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        input.name.trim(),
        input.slug?.trim() || this.slugify(input.name),
        input.imageUrl ?? null,
        input.parentId && input.parentId > 0 ? input.parentId : null,
        input.description ?? null,
        input.status ?? 'active',
      ],
    );

    return this.getAdminCategory(result.insertId);
  }

  async updateAdminCategory(
    categoryId: number,
    input: {
      name?: string;
      slug?: string | null;
      imageUrl?: string | null;
      parentId?: number | null;
      description?: string | null;
      status?: 'active' | 'inactive';
    },
  ) {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      if (!input.name.trim()) {
        throw new BadRequestException('Category name is required');
      }
      fields.push('name = ?');
      values.push(input.name.trim());
    }
    if (input.slug !== undefined) {
      fields.push('slug = ?');
      values.push(input.slug?.trim() || null);
    }
    if (input.imageUrl !== undefined) {
      fields.push('image_url = ?');
      values.push(input.imageUrl);
    }
    if (input.parentId !== undefined) {
      if (input.parentId === categoryId) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      fields.push('parent_id = ?');
      values.push(input.parentId && input.parentId > 0 ? input.parentId : null);
    }
    if (input.description !== undefined) {
      fields.push('description = ?');
      values.push(input.description);
    }
    if (input.status !== undefined) {
      fields.push('status = ?');
      values.push(input.status);
    }

    if (!fields.length) {
      return this.getAdminCategory(categoryId);
    }

    const [result] = await this.pool.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE category_id = ?`,
      [...values, categoryId] as any[],
    );

    return (result as ResultSetHeader).affectedRows > 0
      ? this.getAdminCategory(categoryId)
      : undefined;
  }

  async updateAdminCategoryStatus(
    categoryId: number,
    status: 'active' | 'inactive',
  ) {
    return this.updateAdminCategory(categoryId, { status });
  }

  async listAdminBrands() {
    const [rows] = await this.pool.query<BrandRow[]>(
      `
        SELECT brand_id, name, slug, logo_url, status
        FROM brands
        ORDER BY brand_id DESC
      `,
    );

    return rows.map((row) => this.mapAdminBrand(row));
  }

  async getAdminBrand(brandId: number) {
    const [rows] = await this.pool.query<BrandRow[]>(
      `
        SELECT brand_id, name, slug, logo_url, status
        FROM brands
        WHERE brand_id = ?
        LIMIT 1
      `,
      [brandId],
    );

    return rows[0] ? this.mapAdminBrand(rows[0]) : undefined;
  }

  async createAdminBrand(input: {
    name: string;
    slug?: string | null;
    logoUrl?: string | null;
    status?: 'active' | 'inactive';
  }) {
    if (!input.name?.trim()) {
      throw new BadRequestException('Brand name is required');
    }

    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO brands (name, slug, logo_url, status)
        VALUES (?, ?, ?, ?)
      `,
      [
        input.name.trim(),
        input.slug?.trim() || this.slugify(input.name),
        input.logoUrl ?? null,
        input.status ?? 'active',
      ],
    );

    return this.getAdminBrand(result.insertId);
  }

  async updateAdminBrand(
    brandId: number,
    input: {
      name?: string;
      slug?: string | null;
      logoUrl?: string | null;
      status?: 'active' | 'inactive';
    },
  ) {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      if (!input.name.trim()) {
        throw new BadRequestException('Brand name is required');
      }
      fields.push('name = ?');
      values.push(input.name.trim());
    }
    if (input.slug !== undefined) {
      fields.push('slug = ?');
      values.push(input.slug?.trim() || null);
    }
    if (input.logoUrl !== undefined) {
      fields.push('logo_url = ?');
      values.push(input.logoUrl);
    }
    if (input.status !== undefined) {
      fields.push('status = ?');
      values.push(input.status);
    }

    if (!fields.length) {
      return this.getAdminBrand(brandId);
    }

    const [result] = await this.pool.query<ResultSetHeader>(
      `UPDATE brands SET ${fields.join(', ')} WHERE brand_id = ?`,
      [...values, brandId],
    );

    return result.affectedRows > 0 ? this.getAdminBrand(brandId) : undefined;
  }

  async updateAdminBrandStatus(
    brandId: number,
    status: 'active' | 'inactive',
  ) {
    return this.updateAdminBrand(brandId, { status });
  }

  async listAdminVouchers() {
    const [rows] = await this.pool.query<VoucherRow[]>(
      `
        SELECT
          voucher_id,
          code,
          name,
          description,
          voucher_type,
          discount_type,
          discount_value,
          max_discount_value,
          min_order_value,
          usage_limit,
          used_count,
          start_at,
          end_at,
          is_active
        FROM vouchers
        ORDER BY voucher_id DESC
      `,
    );

    return rows.map((row) => this.mapAdminVoucher(row));
  }

  async getAdminVoucher(voucherId: number) {
    const [rows] = await this.pool.query<VoucherRow[]>(
      `
        SELECT
          voucher_id,
          code,
          name,
          description,
          voucher_type,
          discount_type,
          discount_value,
          max_discount_value,
          min_order_value,
          usage_limit,
          used_count,
          start_at,
          end_at,
          is_active
        FROM vouchers
        WHERE voucher_id = ?
        LIMIT 1
      `,
      [voucherId],
    );

    return rows[0] ? this.mapAdminVoucher(rows[0]) : undefined;
  }

  async createAdminVoucher(input: {
    code: string;
    name: string;
    description?: string | null;
    voucherType: 'product' | 'shipping' | 'cashback';
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscountValue?: number | null;
    minOrderValue?: number;
    usageLimit?: number;
    startAt?: string | null;
    endAt?: string | null;
    isActive?: boolean;
  }) {
    this.validateAdminVoucher(input);
    const startAt = this.normalizeAdminVoucherDateTime(
      input.startAt,
      'startAt',
    );
    const endAt = this.normalizeAdminVoucherDateTime(input.endAt, 'endAt');
    this.validateAdminVoucherDateRange(startAt, endAt);

    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO vouchers (
          code, name, description, voucher_type, discount_type, discount_value,
          max_discount_value, min_order_value, usage_limit, start_at, end_at, is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.code.trim().toUpperCase(),
        input.name.trim(),
        input.description ?? null,
        input.voucherType,
        input.discountType,
        input.discountValue,
        input.maxDiscountValue ?? null,
        input.minOrderValue ?? 0,
        input.usageLimit ?? 0,
        startAt,
        endAt,
        input.isActive ?? true,
      ],
    );

    return this.getAdminVoucher(result.insertId);
  }

  async updateAdminVoucher(
    voucherId: number,
    input: {
      code?: string;
      name?: string;
      description?: string | null;
      voucherType?: 'product' | 'shipping' | 'cashback';
      discountType?: 'percent' | 'fixed';
      discountValue?: number;
      maxDiscountValue?: number | null;
      minOrderValue?: number;
      usageLimit?: number;
      startAt?: string | null;
      endAt?: string | null;
      isActive?: boolean;
    },
  ) {
    this.validateAdminVoucher(input, true);

    const fields: string[] = [];
    const values: unknown[] = [];

    const push = (field: string, value: unknown) => {
      fields.push(`${field} = ?`);
      values.push(value);
    };

    if (input.code !== undefined) push('code', input.code.trim().toUpperCase());
    if (input.name !== undefined) push('name', input.name.trim());
    if (input.description !== undefined) push('description', input.description);
    if (input.voucherType !== undefined) push('voucher_type', input.voucherType);
    if (input.discountType !== undefined) push('discount_type', input.discountType);
    if (input.discountValue !== undefined) push('discount_value', input.discountValue);
    if (input.maxDiscountValue !== undefined) push('max_discount_value', input.maxDiscountValue);
    if (input.minOrderValue !== undefined) push('min_order_value', input.minOrderValue);
    if (input.usageLimit !== undefined) push('usage_limit', input.usageLimit);
    const startAt =
      input.startAt !== undefined
        ? this.normalizeAdminVoucherDateTime(input.startAt, 'startAt')
        : undefined;
    const endAt =
      input.endAt !== undefined
        ? this.normalizeAdminVoucherDateTime(input.endAt, 'endAt')
        : undefined;
    if (startAt !== undefined) push('start_at', startAt);
    if (endAt !== undefined) push('end_at', endAt);
    if (startAt !== undefined && endAt !== undefined) {
      this.validateAdminVoucherDateRange(startAt, endAt);
    }
    if (input.isActive !== undefined) push('is_active', input.isActive);

    if (!fields.length) {
      return this.getAdminVoucher(voucherId);
    }

    const [result] = await this.pool.query(
      `UPDATE vouchers SET ${fields.join(', ')} WHERE voucher_id = ?`,
      [...values, voucherId] as any[],
    );

    return (result as ResultSetHeader).affectedRows > 0
      ? this.getAdminVoucher(voucherId)
      : undefined;
  }

  async updateAdminVoucherStatus(voucherId: number, isActive: boolean) {
    return this.updateAdminVoucher(voucherId, { isActive });
  }

  async listAdminNotifications() {
    const [rows] = await this.pool.query<NotificationRow[]>(
      `
        SELECT
          n.notification_id,
          n.user_id,
          u.full_name,
          u.email,
          n.title,
          n.content,
          n.notification_type,
          n.image_url,
          n.is_read,
          n.created_at
        FROM notifications n
        INNER JOIN users u ON u.user_id = n.user_id
        ORDER BY n.notification_id DESC
        LIMIT 200
      `,
    );

    return rows.map((row) => ({
      id: row.notification_id,
      userId: row.user_id,
      userName: row.full_name,
      userEmail: row.email,
      title: row.title,
      content: row.content,
      notificationType: row.notification_type,
      imageUrl: row.image_url ?? null,
      isRead: Boolean(row.is_read),
      createdAt: new Date(row.created_at),
    }));
  }

  async createAdminNotification(input: {
    title: string;
    content: string;
    targetScope: 'all_users' | 'customer_only' | 'admin_only';
    notificationType?: 'promotion' | 'order' | 'system';
    imageUrl?: string | null;
  }) {
    if (!input.title?.trim()) {
      throw new BadRequestException('Notification title is required');
    }

    if (!input.content?.trim()) {
      throw new BadRequestException('Notification content is required');
    }

    const targetWhere =
      input.targetScope === 'customer_only'
        ? "role = 'customer' AND status = 'active'"
        : input.targetScope === 'admin_only'
          ? "role = 'admin' AND status = 'active'"
          : "status = 'active'";

    const [users] = await this.pool.query<RowDataPacket[]>(
      `SELECT user_id FROM users WHERE ${targetWhere}`,
    );

    if (!users.length) {
      return { insertedCount: 0, targetScope: input.targetScope };
    }

    const values = users.map((user) => [
      user.user_id,
      input.title.trim(),
      input.content.trim(),
      input.notificationType ?? 'system',
      input.imageUrl ?? null,
    ]);

    await this.pool.query(
      `
        INSERT INTO notifications (user_id, title, content, notification_type, image_url)
        VALUES ?
      `,
      [values],
    );

    return {
      insertedCount: users.length,
      targetScope: input.targetScope,
    };
  }

  async listAdminReviews() {
    const [rows] = await this.pool.query<ReviewListRow[]>(
      `
        SELECT
          pr.review_id,
          pr.product_id,
          p.name AS product_name,
          pr.user_id,
          u.full_name,
          u.email,
          pr.rating,
          pr.title,
          pr.comment,
          pr.is_verified_purchase,
          COALESCE(pr.moderation_status, 'visible') AS moderation_status,
          pr.moderation_note,
          pr.moderated_by,
          pr.moderated_at,
          pr.created_at,
          GROUP_CONCAT(rm.media_url ORDER BY rm.media_id ASC SEPARATOR '||') AS media_urls
        FROM product_reviews pr
        INNER JOIN users u ON u.user_id = pr.user_id
        INNER JOIN products p ON p.product_id = pr.product_id
        LEFT JOIN review_media rm ON rm.review_id = pr.review_id
        GROUP BY pr.review_id
        ORDER BY pr.review_id DESC
      `,
    );

    return rows.map((row) => this.mapAdminReview(row));
  }

  async getAdminReview(reviewId: number) {
    const [rows] = await this.pool.query<ReviewListRow[]>(
      `
        SELECT
          pr.review_id,
          pr.product_id,
          p.name AS product_name,
          pr.user_id,
          u.full_name,
          u.email,
          pr.rating,
          pr.title,
          pr.comment,
          pr.is_verified_purchase,
          COALESCE(pr.moderation_status, 'visible') AS moderation_status,
          pr.moderation_note,
          pr.moderated_by,
          pr.moderated_at,
          pr.created_at,
          GROUP_CONCAT(rm.media_url ORDER BY rm.media_id ASC SEPARATOR '||') AS media_urls
        FROM product_reviews pr
        INNER JOIN users u ON u.user_id = pr.user_id
        INNER JOIN products p ON p.product_id = pr.product_id
        LEFT JOIN review_media rm ON rm.review_id = pr.review_id
        WHERE pr.review_id = ?
        GROUP BY pr.review_id
        LIMIT 1
      `,
      [reviewId],
    );

    return rows[0] ? this.mapAdminReview(rows[0]) : undefined;
  }

  async moderateAdminReview(
    reviewId: number,
    input: { status: 'visible' | 'hidden' | 'deleted'; note?: string | null },
    adminUserId: number,
  ) {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        UPDATE product_reviews
        SET moderation_status = ?, moderation_note = ?, moderated_by = ?, moderated_at = CURRENT_TIMESTAMP
        WHERE review_id = ?
      `,
      [input.status, input.note ?? null, adminUserId, reviewId],
    );

    if (result.affectedRows < 1) {
      return undefined;
    }

    const review = await this.getAdminReview(reviewId);

    if (review) {
      await this.recalculateProductRating(review.productId);
    }

    return review;
  }

  async updateSystemConfig(input: {
    categoryStatuses?: Array<{ categoryId: number; status: 'active' | 'inactive' }>;
    paymentMethodStatuses?: Array<{
      paymentMethodId: number;
      status: 'active' | 'inactive';
    }>;
    voucherStatuses?: Array<{ voucherId: number; isActive: boolean }>;
  }) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const item of input.categoryStatuses ?? []) {
        await connection.execute(
          `
            UPDATE categories
            SET status = ?
            WHERE category_id = ?
          `,
          [item.status, item.categoryId],
        );
      }

      for (const item of input.paymentMethodStatuses ?? []) {
        await connection.execute(
          `
            UPDATE payment_methods
            SET status = ?
            WHERE payment_method_id = ?
          `,
          [item.status, item.paymentMethodId],
        );
      }

      for (const item of input.voucherStatuses ?? []) {
        await connection.execute(
          `
            UPDATE vouchers
            SET is_active = ?
            WHERE voucher_id = ?
          `,
          [item.isActive, item.voucherId],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.getAdminDashboard();
  }

  async listAdminUsers() {
    const [rows] = await this.pool.query<AdminUserListRow[]>(
      `
        SELECT user_id, full_name, email, phone, password_hash, role, admin_level, status, is_verified, created_at, updated_at
        FROM users
        ORDER BY user_id ASC
      `,
    );

    return rows.map((row) => this.mapUser(row));
  }

  async getAdminUserDetail(userId: number) {
    return this.findUserById(userId);
  }

  async updateAdminUserStatus(userId: number, status: 'active' | 'blocked') {
    return this.updateUser(userId, { status });
  }

  async updateAdminUserRole(
    userId: number,
    role: UserRole,
    adminLevel?: AdminLevel | null,
  ) {
    return this.updateUser(userId, {
      role,
      adminLevel: role === 'admin' ? adminLevel ?? 3 : null,
    });
  }

  async listAdminOrders() {
    const [rows] = await this.pool.query<OrderListRow[]>(
      `
        SELECT
          o.order_id,
          o.order_code,
          o.user_id,
          u.full_name,
          u.email,
          pm.method_name AS payment_method_name,
          o.total_amount,
          o.order_status,
          o.payment_status,
          o.placed_at
        FROM orders o
        INNER JOIN users u ON u.user_id = o.user_id
        INNER JOIN payment_methods pm ON pm.payment_method_id = o.payment_method_id
        ORDER BY o.order_id DESC
      `,
    );

    return rows.map((row) => ({
      id: row.order_id,
      orderCode: row.order_code,
      user: {
        id: row.user_id,
        fullName: row.full_name,
        email: row.email,
      },
      paymentMethodName: row.payment_method_name,
      totalAmount: Number(row.total_amount),
      orderStatus: row.order_status,
      paymentStatus: row.payment_status,
      placedAt: new Date(row.placed_at),
    }));
  }

  async getAdminOrderDetail(orderId: number) {
    const [orderRows] = await this.pool.query<OrderListRow[]>(
      `
        SELECT
          o.order_id,
          o.order_code,
          o.user_id,
          u.full_name,
          u.email,
          pm.method_name AS payment_method_name,
          o.total_amount,
          o.order_status,
          o.payment_status,
          o.placed_at
        FROM orders o
        INNER JOIN users u ON u.user_id = o.user_id
        INNER JOIN payment_methods pm ON pm.payment_method_id = o.payment_method_id
        WHERE o.order_id = ?
        LIMIT 1
      `,
      [orderId],
    );

    const order = orderRows[0];

    if (!order) {
      return undefined;
    }

    const [itemsRows, paymentRows, shipmentRows, historyRows] =
      await Promise.all([
        this.pool.query<OrderItemRow[]>(
          `
            SELECT order_item_id, product_id, variant_id, product_name_snapshot, variant_snapshot, unit_price, quantity, line_total
            FROM order_items
            WHERE order_id = ?
            ORDER BY order_item_id ASC
          `,
          [orderId],
        ),
        this.pool.query<PaymentRow[]>(
          `
            SELECT p.payment_id, p.payment_method_id, pm.method_code, pm.method_name, p.amount, p.transaction_code,
                   p.payment_status, p.paid_at, p.fail_reason
            FROM payments p
            INNER JOIN payment_methods pm ON pm.payment_method_id = p.payment_method_id
            WHERE p.order_id = ?
            LIMIT 1
          `,
          [orderId],
        ),
        this.pool.query<ShipmentRow[]>(
          `
            SELECT shipment_id, carrier_name, tracking_code, shipping_type, driver_name, driver_phone, vehicle_number,
                   estimated_delivery_at, shipped_at, delivered_at, shipment_status
            FROM shipments
            WHERE order_id = ?
            LIMIT 1
          `,
          [orderId],
        ),
        this.pool.query<OrderStatusHistoryRow[]>(
          `
            SELECT history_id, status, description, updated_by, created_at
            FROM order_status_histories
            WHERE order_id = ?
            ORDER BY history_id DESC
          `,
          [orderId],
        ),
      ]);

    const items = itemsRows[0].map((row) => ({
      id: row.order_item_id,
      productId: row.product_id,
      variantId: row.variant_id,
      productName: row.product_name_snapshot,
      variantSnapshot: row.variant_snapshot,
      unitPrice: Number(row.unit_price),
      quantity: row.quantity,
      lineTotal: Number(row.line_total),
    }));

    const payment = paymentRows[0][0]
      ? {
          id: paymentRows[0][0].payment_id,
          paymentMethodId: paymentRows[0][0].payment_method_id,
          methodCode: paymentRows[0][0].method_code,
          methodName: paymentRows[0][0].method_name,
          amount: Number(paymentRows[0][0].amount),
          transactionCode: paymentRows[0][0].transaction_code,
          paymentStatus: paymentRows[0][0].payment_status,
          paidAt: paymentRows[0][0].paid_at
            ? new Date(paymentRows[0][0].paid_at)
            : null,
          failReason: paymentRows[0][0].fail_reason,
          ...(paymentRows[0][0].method_code === 'COD'
            ? {}
            : this.buildMockPaymentQr(
                paymentRows[0][0].payment_id,
                order.order_code,
                Number(paymentRows[0][0].amount),
              )),
        }
      : null;

    const shipment = shipmentRows[0][0]
      ? {
          id: shipmentRows[0][0].shipment_id,
          carrierName: shipmentRows[0][0].carrier_name,
          trackingCode: shipmentRows[0][0].tracking_code,
          shippingType: shipmentRows[0][0].shipping_type,
          driverName: shipmentRows[0][0].driver_name,
          driverPhone: shipmentRows[0][0].driver_phone,
          vehicleNumber: shipmentRows[0][0].vehicle_number,
          estimatedDeliveryAt: shipmentRows[0][0].estimated_delivery_at
            ? new Date(shipmentRows[0][0].estimated_delivery_at)
            : null,
          shippedAt: shipmentRows[0][0].shipped_at
            ? new Date(shipmentRows[0][0].shipped_at)
            : null,
          deliveredAt: shipmentRows[0][0].delivered_at
            ? new Date(shipmentRows[0][0].delivered_at)
            : null,
          shipmentStatus: shipmentRows[0][0].shipment_status,
        }
      : null;

    return {
      id: order.order_id,
      orderCode: order.order_code,
      user: {
        id: order.user_id,
        fullName: order.full_name,
        email: order.email,
      },
      paymentMethodName: order.payment_method_name,
      totalAmount: Number(order.total_amount),
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      placedAt: new Date(order.placed_at),
      items,
      payment,
      shipment,
      statusHistory: historyRows[0].map((row) => ({
        id: row.history_id,
        status: row.status,
        description: row.description,
        updatedBy: row.updated_by,
        createdAt: new Date(row.created_at),
      })),
    };
  }

  async updateAdminOrderStatus(
    orderId: number,
    status: string,
    updatedBy: number,
    description?: string,
  ) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        `
          UPDATE orders
          SET order_status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE order_id = ?
        `,
        [status, orderId],
      );

      await connection.execute(
        `
          INSERT INTO order_status_histories (order_id, status, description, updated_by)
          VALUES (?, ?, ?, ?)
        `,
        [orderId, status, description ?? null, updatedBy],
      );

      const [orderRows] = await connection.query<RowDataPacket[]>(
        `SELECT user_id, order_code FROM orders WHERE order_id = ? LIMIT 1`,
        [orderId],
      );

      const order = orderRows[0];
      if (order?.user_id) {
        await connection.execute(
          `
            INSERT INTO notifications (user_id, title, content, notification_type)
            VALUES (?, ?, ?, 'order')
          `,
          [
            order.user_id,
            `Order ${order.order_code} updated`,
            `Your order status is now ${status}`,
          ],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.getAdminOrderDetail(orderId);
  }

  async listAdminProducts() {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT
          p.product_id,
          p.name,
          p.sku,
          p.base_price,
          p.status,
          c.category_id,
          c.name AS category_name,
          b.brand_id,
          b.name AS brand_name,
          pi.image_url AS primary_image_url,
          COALESCE(SUM(CASE WHEN pv.status = 'active' THEN pv.stock_qty ELSE 0 END), 0) AS stock_qty
        FROM products p
        INNER JOIN categories c ON c.category_id = p.category_id
        LEFT JOIN brands b ON b.brand_id = p.brand_id
        LEFT JOIN product_images pi
          ON pi.product_id = p.product_id
         AND pi.is_primary = TRUE
        LEFT JOIN product_variants pv ON pv.product_id = p.product_id
        GROUP BY
          p.product_id,
          p.name,
          p.sku,
          p.base_price,
          p.status,
          c.category_id,
          c.name,
          b.brand_id,
          b.name,
          pi.image_url
        ORDER BY p.product_id DESC
      `,
    );

    return rows.map((row) => ({
      id: row.product_id,
      name: row.name,
      sku: row.sku,
      basePrice: Number(row.base_price),
      status: row.status,
      stockQty: Number(row.stock_qty ?? 0),
      category: {
        id: row.category_id,
        name: row.category_name,
      },
      brand: row.brand_id
        ? {
            id: row.brand_id,
            name: row.brand_name,
          }
        : null,
      primaryImageUrl: row.primary_image_url,
    }));
  }

  async createAdminProduct(input: {
    categoryId: number;
    brandId?: number | null;
    name: string;
    slug?: string;
    sku?: string;
    shortDescription?: string;
    description?: string;
    basePrice: number;
    comparePrice?: number | null;
    warrantyMonths?: number;
    status?: 'draft' | 'active' | 'out_of_stock' | 'inactive';
    images?: Array<{ imageUrl: string; isPrimary?: boolean; sortOrder?: number }>;
    variants?: Array<{
      skuVariant?: string;
      color?: string;
      size?: string;
      price: number;
      stockQty?: number;
      weight?: number | null;
      imageUrl?: string;
      status?: 'active' | 'inactive';
    }>;
  }) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute<ResultSetHeader>(
        `
          INSERT INTO products (
            category_id, brand_id, name, slug, sku, short_description, description,
            base_price, compare_price, warranty_months, status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            input.categoryId,
            this.normalizeAdminBrandId(input.brandId),
            input.name,
            input.slug ?? null,
            input.sku ?? null,
          input.shortDescription ?? null,
          input.description ?? null,
          input.basePrice,
          input.comparePrice ?? null,
          input.warrantyMonths ?? 0,
          input.status ?? 'draft',
        ],
      );

      const productId = result.insertId;

      for (const image of input.images ?? []) {
        await connection.execute(
          `
            INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
            VALUES (?, ?, ?, ?)
          `,
          [productId, image.imageUrl, Boolean(image.isPrimary), image.sortOrder ?? 0],
        );
      }

      for (const variant of input.variants ?? []) {
        await connection.execute(
          `
            INSERT INTO product_variants (
              product_id, sku_variant, color, size, price, stock_qty, weight, image_url, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            productId,
            variant.skuVariant ?? null,
            variant.color ?? null,
            variant.size ?? null,
            variant.price,
            variant.stockQty ?? 0,
            variant.weight ?? null,
            variant.imageUrl ?? null,
            variant.status ?? 'active',
          ],
        );
      }

      await connection.commit();
      return productId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateAdminProduct(
    productId: number,
    input: {
      categoryId?: number;
      brandId?: number | null;
      name?: string;
      slug?: string | null;
      sku?: string | null;
      shortDescription?: string | null;
      description?: string | null;
      basePrice?: number;
      comparePrice?: number | null;
      warrantyMonths?: number;
      status?: 'draft' | 'active' | 'out_of_stock' | 'inactive';
      images?: Array<{ imageUrl: string; isPrimary?: boolean; sortOrder?: number }>;
      variants?: Array<{
        skuVariant?: string;
        color?: string;
        size?: string;
        price: number;
        stockQty?: number;
        weight?: number | null;
        imageUrl?: string;
        status?: 'active' | 'inactive';
      }>;
    },
  ) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const fields: string[] = [];
      const values: unknown[] = [];

      if (input.categoryId !== undefined) {
        fields.push('category_id = ?');
        values.push(input.categoryId);
      }
        if (input.brandId !== undefined) {
          fields.push('brand_id = ?');
          values.push(this.normalizeAdminBrandId(input.brandId));
        }
      if (input.name !== undefined) {
        fields.push('name = ?');
        values.push(input.name);
      }
      if (input.slug !== undefined) {
        fields.push('slug = ?');
        values.push(input.slug);
      }
      if (input.sku !== undefined) {
        fields.push('sku = ?');
        values.push(input.sku);
      }
      if (input.shortDescription !== undefined) {
        fields.push('short_description = ?');
        values.push(input.shortDescription);
      }
      if (input.description !== undefined) {
        fields.push('description = ?');
        values.push(input.description);
      }
      if (input.basePrice !== undefined) {
        fields.push('base_price = ?');
        values.push(input.basePrice);
      }
      if (input.comparePrice !== undefined) {
        fields.push('compare_price = ?');
        values.push(input.comparePrice);
      }
      if (input.warrantyMonths !== undefined) {
        fields.push('warranty_months = ?');
        values.push(input.warrantyMonths);
      }
      if (input.status !== undefined) {
        fields.push('status = ?');
        values.push(input.status);
      }

      if (fields.length) {
        await connection.query(
          `
            UPDATE products
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE product_id = ?
          `,
          [...values, productId],
        );
      }

      if (input.images) {
        await connection.execute(
          `DELETE FROM product_images WHERE product_id = ?`,
          [productId],
        );

        for (const image of input.images) {
          await connection.execute(
            `
              INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
              VALUES (?, ?, ?, ?)
            `,
            [productId, image.imageUrl, Boolean(image.isPrimary), image.sortOrder ?? 0],
          );
        }
      }

      if (input.variants) {
        await connection.execute(
          `DELETE FROM product_variants WHERE product_id = ?`,
          [productId],
        );

        for (const variant of input.variants) {
          await connection.execute(
            `
              INSERT INTO product_variants (
                product_id, sku_variant, color, size, price, stock_qty, weight, image_url, status
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              productId,
              variant.skuVariant ?? null,
              variant.color ?? null,
              variant.size ?? null,
              variant.price,
              variant.stockQty ?? 0,
              variant.weight ?? null,
              variant.imageUrl ?? null,
              variant.status ?? 'active',
            ],
          );
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return this.getAdminProductDetail(productId);
  }

  async updateAdminProductStatus(
    productId: number,
    status: 'draft' | 'active' | 'out_of_stock' | 'inactive',
  ) {
    await this.pool.execute(
      `
        UPDATE products
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ?
      `,
      [status, productId],
    );

    return this.getAdminProductDetail(productId);
  }

  async getAdminProductDetail(productId: number) {
    const [productRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT
          p.product_id,
          p.category_id,
          p.brand_id,
          p.name,
          p.slug,
          p.sku,
          p.short_description,
          p.description,
          p.base_price,
          p.compare_price,
          p.warranty_months,
          p.status,
          c.name AS category_name,
          b.name AS brand_name
        FROM products p
        INNER JOIN categories c ON c.category_id = p.category_id
        LEFT JOIN brands b ON b.brand_id = p.brand_id
        WHERE p.product_id = ?
        LIMIT 1
      `,
      [productId],
    );

    const product = productRows[0];
    if (!product) {
      return undefined;
    }

    const [imageRows, variantRows] = await Promise.all([
      this.pool.query<RowDataPacket[]>(
        `
          SELECT image_id, image_url, is_primary, sort_order
          FROM product_images
          WHERE product_id = ?
          ORDER BY sort_order ASC, image_id ASC
        `,
        [productId],
      ),
      this.pool.query<RowDataPacket[]>(
        `
          SELECT variant_id, sku_variant, color, size, price, stock_qty, weight, image_url, status
          FROM product_variants
          WHERE product_id = ?
          ORDER BY variant_id ASC
        `,
        [productId],
      ),
    ]);

    return {
      id: product.product_id,
      categoryId: product.category_id,
      brandId: product.brand_id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.short_description,
      description: product.description,
      basePrice: Number(product.base_price),
      comparePrice:
        product.compare_price !== null ? Number(product.compare_price) : null,
      warrantyMonths: product.warranty_months,
      status: product.status,
      categoryName: product.category_name,
      brandName: product.brand_name,
      stockQty: variantRows[0].reduce(
        (total, row) =>
          row.status === 'active' ? total + Number(row.stock_qty ?? 0) : total,
        0,
      ),
      images: imageRows[0].map((row) => ({
        id: row.image_id,
        imageUrl: row.image_url,
        isPrimary: Boolean(row.is_primary),
        sortOrder: row.sort_order,
      })),
      variants: variantRows[0].map((row) => ({
        id: row.variant_id,
        skuVariant: row.sku_variant,
        color: row.color,
        size: row.size,
        price: Number(row.price),
        stockQty: row.stock_qty,
        weight: row.weight !== null ? Number(row.weight) : null,
        imageUrl: row.image_url,
        status: row.status,
      })),
    };
  }

  async getReportOverview() {
    const [usersQuery, ordersQuery, revenueQuery, topProductQuery, statusQuery] =
      await Promise.all([
        this.pool.query<CountRow[]>(`SELECT COUNT(*) AS total FROM users`),
        this.pool.query<CountRow[]>(`SELECT COUNT(*) AS total FROM orders`),
        this.pool.query<RowDataPacket[]>(
          `
            SELECT DATE_FORMAT(placed_at, '%Y-%m') AS period, COALESCE(SUM(total_amount), 0) AS revenue
            FROM orders
            GROUP BY DATE_FORMAT(placed_at, '%Y-%m')
            ORDER BY period ASC
          `,
        ),
        this.pool.query<RowDataPacket[]>(
          `
            SELECT p.product_id, p.name, COALESCE(SUM(oi.quantity), 0) AS total_sold
            FROM products p
            LEFT JOIN order_items oi ON oi.product_id = p.product_id
            GROUP BY p.product_id, p.name
            ORDER BY total_sold DESC, p.product_id ASC
            LIMIT 5
          `,
        ),
        this.pool.query<RowDataPacket[]>(
          `
            SELECT order_status, COUNT(*) AS total
            FROM orders
            GROUP BY order_status
            ORDER BY total DESC
          `,
        ),
      ]);

    const usersResult = usersQuery[0][0];
    const ordersResult = ordersQuery[0][0];
    const revenueRows = revenueQuery[0];
    const topProductRows = topProductQuery[0];
    const statusRows = statusQuery[0];

    return {
      users: Number(usersResult?.total ?? 0),
      orders: Number(ordersResult?.total ?? 0),
      revenueByPeriod: revenueRows.map((row) => ({
        period: row.period,
        revenue: Number(row.revenue ?? 0),
      })),
      topSellingProducts: topProductRows.map((row) => ({
        productId: row.product_id,
        name: row.name,
        totalSold: Number(row.total_sold ?? 0),
      })),
      orderStatusDistribution: statusRows.map((row) => ({
        status: row.order_status,
        total: Number(row.total ?? 0),
      })),
    };
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

  async getAdminSystemConfigOptions() {
    const hasCategoryStatus = await this.hasColumn('categories', 'status');
    const [categoryRows] = await this.pool.query<
      Array<CategoryRow & { status?: string | null }>
    >(
      `
        SELECT category_id, name ${hasCategoryStatus ? ', status' : ", 'active' AS status"}
        FROM categories
        ORDER BY category_id ASC
      `,
    );
    const [paymentMethodRows] = await this.pool.query<PaymentMethodRow[]>(
      `
        SELECT payment_method_id, method_code, method_name, status
        FROM payment_methods
        ORDER BY payment_method_id ASC
      `,
    );
    const [voucherRows] = await this.pool.query<VoucherRow[]>(
      `
        SELECT
          voucher_id,
          code,
          name,
          description,
          voucher_type,
          discount_type,
          discount_value,
          max_discount_value,
          min_order_value,
          usage_limit,
          used_count,
          start_at,
          end_at,
          is_active
        FROM vouchers
        ORDER BY voucher_id ASC
      `,
    );

    return {
      categories: categoryRows.map((row) => ({
        id: row.category_id,
        name: row.name,
        status: row.status ?? 'active',
      })),
      paymentMethods: paymentMethodRows.map((row) => ({
        id: row.payment_method_id,
        code: row.method_code,
        name: row.method_name,
        status: row.status,
      })),
      vouchers: voucherRows.map((row) => ({
        id: row.voucher_id,
        code: row.code,
        name: row.name,
        discountType: row.discount_type,
        discountValue: Number(row.discount_value ?? 0),
        minOrderValue: Number(row.min_order_value ?? 0),
        isActive: Boolean(row.is_active),
      })),
    };
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
          ORDER BY p.product_id DESC
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

  getAdminPermissions(adminLevel: AdminLevel | null | undefined) {
    if (adminLevel === 1) {
      return [
        'users:delete',
        'admins:manage',
        ...this.rolePermissions.admin,
      ];
    }

    if (adminLevel === 2) {
      return [
        'system:dashboard:read',
        'users:read',
        'users:status:update',
        'orders:read',
        'orders:update',
        'products:read',
        'products:create',
        'products:update',
        'products:status:update',
        'reports:read',
        'categories:read',
        'categories:create',
        'categories:update',
        'brands:read',
        'brands:create',
        'brands:update',
        'vouchers:read',
        'vouchers:create',
        'vouchers:update',
        'notifications:read',
        'notifications:create',
        'reviews:read',
        'reviews:moderate',
      ];
    }

    return [
      'system:dashboard:read',
      'users:read',
      'orders:read',
      'orders:update',
      'products:read',
      'reports:read',
      'categories:read',
      'brands:read',
      'vouchers:read',
      'notifications:read',
      'reviews:read',
    ];
  }

  getPermissionsForUser(user: Pick<User, 'role' | 'adminLevel'>) {
    if (user.role === 'admin') {
      return this.getAdminPermissions(user.adminLevel);
    }

    return this.getPermissionsByRole(user.role);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  private async findOrCreateCart(userId: number) {
    const [rows] = await this.pool.query<CartRow[]>(
      `
        SELECT cart_id, user_id, status
        FROM carts
        WHERE user_id = ?
        LIMIT 1
      `,
      [userId],
    );

    if (rows[0]) {
      return {
        cartId: rows[0].cart_id,
        userId: rows[0].user_id,
        status: rows[0].status,
      };
    }

    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO carts (user_id, status)
        VALUES (?, 'active')
      `,
      [userId],
    );

    return {
      cartId: result.insertId,
      userId,
      status: 'active',
    };
  }

  private async getCartItemsByCartId(cartId: number) {
    const [rows] = await this.pool.query<CartItemDetailRow[]>(
      `
        SELECT
          ci.cart_item_id,
          ci.cart_id,
          ci.product_id,
          ci.variant_id,
          ci.quantity,
          ci.unit_price,
          ci.selected,
          p.name AS product_name,
          p.status AS product_status,
          p.base_price,
          pi.image_url AS primary_image_url,
          pv.color AS variant_color,
          pv.size AS variant_size,
          pv.stock_qty AS variant_stock_qty,
          pv.status AS variant_status
        FROM cart_items ci
        INNER JOIN products p ON p.product_id = ci.product_id
        LEFT JOIN product_variants pv ON pv.variant_id = ci.variant_id
        LEFT JOIN product_images pi
          ON pi.product_id = p.product_id
         AND pi.is_primary = TRUE
        WHERE ci.cart_id = ?
        ORDER BY ci.cart_item_id DESC
      `,
      [cartId],
    );

    return rows.map((row) => ({
      id: row.cart_item_id,
      cartId: row.cart_id,
      productId: row.product_id,
      variantId: row.variant_id,
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
      selected: Boolean(row.selected),
      product: {
        id: row.product_id,
        name: row.product_name,
        basePrice: Number(row.base_price),
        status: row.product_status,
        primaryImageUrl: row.primary_image_url,
      },
      variant: row.variant_id
        ? {
            id: row.variant_id,
            color: row.variant_color,
            size: row.variant_size,
            stockQty: row.variant_stock_qty ?? 0,
            status: row.variant_status,
          }
        : null,
    }));
  }

  private toCartResponse(
    cartId: number,
    items: Array<{
      id: number;
      cartId: number;
      productId: number;
      variantId: number | null;
      quantity: number;
      unitPrice: number;
      selected: boolean;
      product: {
        id: number;
        name: string;
        basePrice: number;
        status: string;
        primaryImageUrl: string | null;
      };
      variant: {
        id: number;
        color: string | null;
        size: string | null;
        stockQty: number;
        status: string | null;
      } | null;
    }>,
  ) {
    const subtotal = items
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return {
      cartId,
      items,
      summary: {
        itemsCount: items.length,
        selectedItemsCount: items.filter((item) => item.selected).length,
        subtotal,
        totalAmount: subtotal,
      },
    };
  }

  private async getPurchasableProduct(
    productId: number,
    variantId: number | null,
  ) {
    const [productRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT product_id, name, base_price, status
        FROM products
        WHERE product_id = ?
        LIMIT 1
      `,
      [productId],
    );

    const product = productRows[0];
    if (!product || !['active', 'out_of_stock'].includes(product.status)) {
      return undefined;
    }

    if (variantId) {
      const [variantRows] = await this.pool.query<RowDataPacket[]>(
        `
          SELECT variant_id, price, stock_qty, status
          FROM product_variants
          WHERE variant_id = ? AND product_id = ?
          LIMIT 1
        `,
        [variantId, productId],
      );

      const variant = variantRows[0];
      if (!variant || variant.status !== 'active') {
        return undefined;
      }

      return {
        unitPrice: Number(variant.price),
        availableStock: Number(variant.stock_qty ?? 0),
      };
    }

    const [variantCountRows] = await this.pool.query<RowDataPacket[]>(
      `
        SELECT COUNT(*) AS total
        FROM product_variants
        WHERE product_id = ? AND status = 'active'
      `,
      [productId],
    );

    const variantCount = Number(variantCountRows[0]?.total ?? 0);

    return {
      unitPrice: Number(product.base_price),
      availableStock: variantCount > 0 ? 0 : Number.MAX_SAFE_INTEGER,
    };
  }

  private async ensureSelectedItemsHaveStock(
    items: Array<{
      productId: number;
      variantId: number | null;
      quantity: number;
    }>,
  ) {
    for (const item of items) {
      const purchasable = await this.getPurchasableProduct(
        item.productId,
        item.variantId,
      );

      if (!purchasable || item.quantity > purchasable.availableStock) {
        throw new BadRequestException(
          'One or more selected items are no longer available in the requested quantity',
        );
      }
    }
  }

  private async getActivePaymentMethods() {
    const [rows] = await this.pool.query<PaymentMethodRow[]>(
      `
        SELECT payment_method_id, method_code, method_name, status
        FROM payment_methods
        WHERE status = 'active'
        ORDER BY payment_method_id ASC
      `,
    );

    return rows.map((row) => ({
      id: row.payment_method_id,
      methodCode: row.method_code,
      methodName: row.method_name,
      status: row.status,
    }));
  }

  private async validateVoucher(code: string, subtotal: number) {
    const [rows] = await this.pool.query<VoucherRow[]>(
      `
        SELECT
          voucher_id, code, name, description, voucher_type, discount_type, discount_value,
          max_discount_value, min_order_value, usage_limit, used_count, start_at, end_at, is_active
        FROM vouchers
        WHERE code = ?
        LIMIT 1
      `,
      [code],
    );

    const voucher = rows[0];
    if (!voucher) {
      throw new BadRequestException('Voucher code is invalid');
    }

    const now = new Date();
    const startAt = voucher.start_at ? new Date(voucher.start_at) : null;
    const endAt = voucher.end_at ? new Date(voucher.end_at) : null;

    if (!voucher.is_active) {
      throw new BadRequestException('Voucher is inactive');
    }
    if (startAt && startAt > now) {
      throw new BadRequestException('Voucher is not active yet');
    }
    if (endAt && endAt < now) {
      throw new BadRequestException('Voucher has expired');
    }
    if (subtotal < Number(voucher.min_order_value ?? 0)) {
      throw new BadRequestException('Order does not meet voucher minimum value');
    }
    if (
      Number(voucher.usage_limit ?? 0) > 0 &&
      Number(voucher.used_count ?? 0) >= Number(voucher.usage_limit)
    ) {
      throw new BadRequestException('Voucher usage limit has been reached');
    }

    return voucher;
  }

  private computeVoucherDiscount(voucher: VoucherRow, subtotal: number) {
    const discountValue = Number(voucher.discount_value);

    if (voucher.discount_type === 'percent') {
      const rawDiscount = (subtotal * discountValue) / 100;
      const maxDiscount =
        voucher.max_discount_value !== null
          ? Number(voucher.max_discount_value)
          : null;

      return maxDiscount !== null
        ? Math.min(rawDiscount, maxDiscount)
        : rawDiscount;
    }

    return Math.min(discountValue, subtotal);
  }

  private async getAddressByUser(userId: number, addressId: number) {
    const [rows] = await this.pool.query<AddressRow[]>(
      `
        SELECT address_id, user_id, recipient_name, phone, province, district, ward, detail_address,
               address_type, is_default, latitude, longitude, created_at, updated_at
        FROM addresses
        WHERE address_id = ? AND user_id = ?
        LIMIT 1
      `,
      [addressId, userId],
    );

    return rows[0] ? this.mapAddress(rows[0]) : undefined;
  }

  private async getPaymentMethodById(paymentMethodId: number) {
    const [rows] = await this.pool.query<PaymentMethodRow[]>(
      `
        SELECT payment_method_id, method_code, method_name, status
        FROM payment_methods
        WHERE payment_method_id = ?
        LIMIT 1
      `,
      [paymentMethodId],
    );

    const row = rows[0];
    return row
      ? {
          id: row.payment_method_id,
          method_code: row.method_code,
          method_name: row.method_name,
          status: row.status,
        }
      : undefined;
  }

  private async clearDefaultAddress(userId: number) {
    await this.pool.execute(
      `
        UPDATE addresses
        SET is_default = FALSE
        WHERE user_id = ?
      `,
      [userId],
    );
  }

  private mapAddress(row: AddressRow) {
    return {
      id: row.address_id,
      userId: row.user_id,
      recipientName: row.recipient_name,
      phone: row.phone,
      province: row.province,
      district: row.district,
      ward: row.ward,
      detailAddress: row.detail_address,
      addressType: row.address_type,
      isDefault: Boolean(row.is_default),
      latitude: row.latitude !== null ? Number(row.latitude) : null,
      longitude: row.longitude !== null ? Number(row.longitude) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private async findOrCreateWishlist(userId: number) {
    const [rows] = await this.pool.query<WishlistRow[]>(
      `
        SELECT wishlist_id, user_id, name, created_at
        FROM wishlists
        WHERE user_id = ?
        ORDER BY wishlist_id ASC
        LIMIT 1
      `,
      [userId],
    );

    if (rows[0]) {
      return rows[0];
    }

    const [result] = await this.pool.execute<ResultSetHeader>(
      `
        INSERT INTO wishlists (user_id, name)
        VALUES (?, 'Yeu thich')
      `,
      [userId],
    );

    return {
      wishlist_id: result.insertId,
      user_id: userId,
      name: 'Yeu thich',
      created_at: new Date(),
    } as WishlistRow;
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

  private async ensureAdminFeatureColumns() {
    if (!(await this.hasColumn('categories', 'description'))) {
      await this.pool.execute(`
        ALTER TABLE categories
        ADD COLUMN description TEXT NULL
      `);
    }

    if (!(await this.hasColumn('notifications', 'image_url'))) {
      await this.pool.execute(`
        ALTER TABLE notifications
        ADD COLUMN image_url VARCHAR(255) NULL
      `);
    }

    if (!(await this.hasColumn('product_reviews', 'moderation_status'))) {
      await this.pool.execute(`
        ALTER TABLE product_reviews
        ADD COLUMN moderation_status ENUM('visible','hidden','deleted') NOT NULL DEFAULT 'visible'
      `);
    }

    if (!(await this.hasColumn('product_reviews', 'moderated_by'))) {
      await this.pool.execute(`
        ALTER TABLE product_reviews
        ADD COLUMN moderated_by BIGINT NULL
      `);
    }

    if (!(await this.hasColumn('product_reviews', 'moderated_at'))) {
      await this.pool.execute(`
        ALTER TABLE product_reviews
        ADD COLUMN moderated_at DATETIME NULL
      `);
    }

    if (!(await this.hasColumn('product_reviews', 'moderation_note'))) {
      await this.pool.execute(`
        ALTER TABLE product_reviews
        ADD COLUMN moderation_note VARCHAR(255) NULL
      `);
    }
  }

  private mapAdminCategory(row: CategoryRow) {
    return {
      id: row.category_id,
      name: row.name,
      slug: row.slug ?? null,
      imageUrl: row.image_url ?? null,
      parentId: row.parent_id ?? null,
      parentName: row.parent_name ?? null,
      description: row.description ?? null,
      status: row.status ?? 'active',
      productCount: Number(row.product_count ?? 0),
      childCount: Number(row.child_count ?? 0),
    };
  }

  private mapAdminBrand(row: BrandRow) {
    return {
      id: row.brand_id,
      name: row.name,
      slug: row.slug ?? null,
      logoUrl: row.logo_url ?? null,
      status: row.status ?? 'active',
    };
  }

  private mapAdminVoucher(row: VoucherRow) {
    return {
      id: row.voucher_id,
      code: row.code,
      name: row.name,
      description: row.description,
      voucherType: row.voucher_type,
      discountType: row.discount_type,
      discountValue: Number(row.discount_value ?? 0),
      maxDiscountValue:
        row.max_discount_value === null ? null : Number(row.max_discount_value),
      minOrderValue: Number(row.min_order_value ?? 0),
      usageLimit: Number(row.usage_limit ?? 0),
      usedCount: Number(row.used_count ?? 0),
      startAt: row.start_at ? new Date(row.start_at) : null,
      endAt: row.end_at ? new Date(row.end_at) : null,
      isActive: Boolean(row.is_active),
    };
  }

  private mapAdminReview(row: ReviewListRow) {
    return {
      id: row.review_id,
      productId: row.product_id ?? 0,
      productName: row.product_name ?? 'Product',
      userId: row.user_id,
      userName: row.full_name,
      userEmail: row.email ?? '',
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      isVerifiedPurchase: Boolean(row.is_verified_purchase),
      moderationStatus: row.moderation_status ?? 'visible',
      moderationNote: row.moderation_note ?? null,
      moderatedBy: row.moderated_by ?? null,
      moderatedAt: row.moderated_at ? new Date(row.moderated_at) : null,
      mediaUrls: row.media_urls ? row.media_urls.split('||').filter(Boolean) : [],
      createdAt: new Date(row.created_at),
    };
  }

  private slugify(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private validateAdminVoucher(
    input: {
      code?: string;
      name?: string;
      voucherType?: string;
      discountType?: string;
      discountValue?: number;
      minOrderValue?: number;
      usageLimit?: number;
      maxDiscountValue?: number | null;
    },
    partial = false,
  ) {
    if (!partial && !input.code?.trim()) {
      throw new BadRequestException('Voucher code is required');
    }
    if (!partial && !input.name?.trim()) {
      throw new BadRequestException('Voucher name is required');
    }
    if (input.code !== undefined && !input.code.trim()) {
      throw new BadRequestException('Voucher code is required');
    }
    if (input.name !== undefined && !input.name.trim()) {
      throw new BadRequestException('Voucher name is required');
    }
    if (
      input.voucherType !== undefined &&
      !['product', 'shipping', 'cashback'].includes(input.voucherType)
    ) {
      throw new BadRequestException('Voucher type is invalid');
    }
    if (
      input.discountType !== undefined &&
      !['percent', 'fixed'].includes(input.discountType)
    ) {
      throw new BadRequestException('Discount type is invalid');
    }
    if (input.discountValue !== undefined && input.discountValue <= 0) {
      throw new BadRequestException('Discount value must be greater than 0');
    }
    if (
      input.discountType === 'percent' &&
      input.discountValue !== undefined &&
      input.discountValue > 100
    ) {
      throw new BadRequestException('Percent discount cannot exceed 100');
    }
    if (input.minOrderValue !== undefined && input.minOrderValue < 0) {
      throw new BadRequestException('Minimum order value cannot be negative');
    }
    if (input.usageLimit !== undefined && input.usageLimit < 0) {
      throw new BadRequestException('Usage limit cannot be negative');
    }
    if (
      input.maxDiscountValue !== undefined &&
      input.maxDiscountValue !== null &&
      input.maxDiscountValue < 0
    ) {
      throw new BadRequestException('Max discount cannot be negative');
    }
  }

  private normalizeAdminVoucherDateTime(
    value: string | null | undefined,
    fieldName: string,
  ) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const match = value
      .trim()
      .match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?$/,
      );
    if (!match) {
      throw new BadRequestException(`${fieldName} must be a valid date/time`);
    }

    const [, yearText, monthText, dayText, hourText, minuteText, secondText] =
      match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const hour = Number(hourText ?? '0');
    const minute = Number(minuteText ?? '0');
    const second = Number(secondText ?? '0');
    const daysInMonth = new Date(year, month, 0).getDate();

    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > daysInMonth ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59 ||
      second < 0 ||
      second > 59
    ) {
      throw new BadRequestException(`${fieldName} must be a real date/time`);
    }

    return `${yearText}-${monthText}-${dayText} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
  }

  private validateAdminVoucherDateRange(
    startAt: string | null,
    endAt: string | null,
  ) {
    if (!startAt || !endAt) {
      return;
    }

    const startTime = new Date(startAt.replace(' ', 'T')).getTime();
    const endTime = new Date(endAt.replace(' ', 'T')).getTime();
    if (startTime > endTime) {
      throw new BadRequestException('Voucher start date must be before end date');
    }
  }

  private async recalculateProductRating(productId: number) {
    await this.pool.execute(
      `
        UPDATE products
        SET avg_rating = (
          SELECT COALESCE(AVG(rating), 0)
          FROM product_reviews
          WHERE product_id = ?
            AND COALESCE(moderation_status, 'visible') = 'visible'
        )
        WHERE product_id = ?
      `,
      [productId, productId],
    );
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

  private buildMockPaymentQr(
    paymentId: number,
    orderCode: string,
    amount: number,
  ) {
    const paymentUrl = `https://mock-gateway.local/payments/${paymentId}`;
    const qrPayload = JSON.stringify({
      type: 'SELLO_MOCK_PAYMENT',
      paymentId,
      orderCode,
      amount,
      currency: 'VND',
      paymentUrl,
    });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrPayload)}`;

    return {
      paymentUrl,
      qrPayload,
      qrCodeUrl,
    };
  }

  private buildMockDestination(order: RowDataPacket) {
    const province = String(order.province ?? '').toLowerCase();
    const fallback =
      province.includes('ha noi') || province.includes('hanoi')
        ? { latitude: 21.0278, longitude: 105.8342 }
        : province.includes('da nang')
          ? { latitude: 16.0544, longitude: 108.2022 }
          : { latitude: 10.7769, longitude: 106.7009 };

    return {
      recipientName: order.recipient_name,
      phone: order.phone,
      address: [
        order.detail_address,
        order.ward,
        order.district,
        order.province,
      ]
        .filter(Boolean)
        .join(', '),
      latitude:
        order.latitude !== null && order.latitude !== undefined
          ? Number(order.latitude)
          : fallback.latitude,
      longitude:
        order.longitude !== null && order.longitude !== undefined
          ? Number(order.longitude)
          : fallback.longitude,
    };
  }

  private buildMockDriverLocation(
    destinationLat: number,
    destinationLng: number,
    orderStatus: string,
  ) {
    const progressByStatus: Record<string, number> = {
      pending: 0.15,
      confirmed: 0.25,
      packed: 0.45,
      shipping: 0.78,
      delivered: 1,
    };
    const progress = progressByStatus[orderStatus] ?? 0.35;
    const origin = {
      latitude: destinationLat + 0.055,
      longitude: destinationLng - 0.065,
    };

    return {
      latitude:
        origin.latitude + (destinationLat - origin.latitude) * progress,
      longitude:
        origin.longitude + (destinationLng - origin.longitude) * progress,
    };
  }

  private mapUser(row: UserRow): User {
    return {
      id: row.user_id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      passwordHash: row.password_hash,
      role: row.role,
      adminLevel: this.toAdminLevel(row.admin_level),
      status:
        row.status === 'blocked'
          ? 'blocked'
          : row.status === 'inactive'
            ? 'inactive'
            : 'active',
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
      charset: 'utf8mb4',
    };
  }

  private toAdminLevel(value: number | null): AdminLevel | null {
    return value === 1 || value === 2 || value === 3 ? value : null;
  }
}
