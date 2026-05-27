import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MySqlDatabaseService } from '../auth/services/mysql-database.service';
import { PasswordService } from '../auth/services/password.service';
import {
  AddCartItemDto,
  ApplyVoucherDto,
  CheckoutPreviewDto,
  ContactAdminDto,
  CreateAddressDto,
  CreateOrderDto,
  CreateReviewDto,
  MockPaymentCallbackDto,
  SelectCartItemDto,
  SetDefaultAddressDto,
  UpdateAddressDto,
  UpdateCartItemDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    private readonly database: MySqlDatabaseService,
    private readonly passwordService: PasswordService,
  ) {}

  async getCart(userId: number) {
    return {
      message: 'Cart fetched successfully',
      data: await this.database.getCartDetail(userId),
    };
  }

  async addCartItem(userId: number, payload: AddCartItemDto) {
    if (payload.quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    return {
      message: 'Item added to cart successfully',
      data: await this.database.addCartItem(userId, payload),
    };
  }

  async updateCartItem(
    userId: number,
    cartItemId: number,
    payload: UpdateCartItemDto,
  ) {
    if (payload.quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const cart = await this.database.updateCartItem(userId, cartItemId, payload);

    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }

    return {
      message: 'Cart item updated successfully',
      data: cart,
    };
  }

  async selectCartItem(
    userId: number,
    cartItemId: number,
    payload: SelectCartItemDto,
  ) {
    const cart = await this.database.selectCartItem(userId, cartItemId, payload);

    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }

    return {
      message: 'Cart item selection updated successfully',
      data: cart,
    };
  }

  async deleteCartItem(userId: number, cartItemId: number) {
    const deleted = await this.database.deleteCartItem(userId, cartItemId);

    if (!deleted) {
      throw new NotFoundException('Cart item not found');
    }

    return {
      message: 'Cart item deleted successfully',
    };
  }

  async getCartSummary(userId: number) {
    return {
      message: 'Cart summary fetched successfully',
      data: await this.database.getCartSummary(userId),
    };
  }

  async previewCheckout(userId: number, payload: CheckoutPreviewDto) {
    return {
      message: 'Checkout preview fetched successfully',
      data: await this.database.getCheckoutPreview(userId, payload.voucherCode),
    };
  }

  async applyVoucher(userId: number, payload: ApplyVoucherDto) {
    return {
      message: 'Voucher applied successfully',
      data: await this.database.applyVoucherToCheckout(userId, payload.code),
    };
  }

  async createOrder(userId: number, payload: CreateOrderDto) {
    const result = await this.database.createOrderFromCart(userId, payload);

    return {
      message: 'Order created successfully',
      data: result,
    };
  }

  async handleMockPaymentCallback(
    paymentId: number,
    payload: MockPaymentCallbackDto,
  ) {
    void paymentId;
    void payload;
    throw new BadRequestException(
      'Mock payment callback is disabled. Please confirm payment through the QR confirmation page.',
    );
  }

  async getMockPaymentStatus(paymentId: number) {
    const result = await this.database.getMockPaymentStatus(paymentId);

    if (!result) {
      throw new NotFoundException('Payment not found');
    }

    return {
      message: 'Mock payment status fetched successfully',
      data: result,
    };
  }

  getMockPaymentConfirmPage(paymentId: number, token: string) {
    return this.database.getMockPaymentConfirmPage(paymentId, token);
  }

  async confirmMockPayment(paymentId: number, token: string) {
    const result = await this.database.confirmMockPayment(paymentId, token);

    if (!result) {
      throw new NotFoundException('Payment not found');
    }

    return result;
  }

  async declineMockPayment(paymentId: number, token: string) {
    const result = await this.database.declineMockPayment(paymentId, token);

    if (!result) {
      throw new NotFoundException('Payment not found');
    }

    return result;
  }

  async getMyOrders(userId: number, page?: string, limit?: string) {
    const p = page ? parseInt(page, 10) : undefined;
    const l = limit ? parseInt(limit, 10) : undefined;

    return {
      message: 'Orders fetched successfully',
      data: await this.database.getUserOrders(userId, p, l),
    };
  }

  async requestOrderReturn(userId: number, orderId: number, reason: string) {
    const result = await this.database.requestUserOrderReturn(userId, orderId, reason);

    if (!result) {
      throw new NotFoundException('Order not found or cannot be returned');
    }

    return {
      message: 'Order return request submitted successfully',
      data: result,
    };
  }

  async getOrderDetail(userId: number, orderId: number) {
    const order = await this.database.getUserOrderDetail(userId, orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order detail fetched successfully',
      data: order,
    };
  }

  async cancelOrder(userId: number, orderId: number) {
    const result = await this.database.cancelUserOrder(userId, orderId);

    if (!result) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order cancelled successfully',
      data: result,
    };
  }

  async getOrderTracking(userId: number, orderId: number) {
    const tracking = await this.database.getOrderTracking(userId, orderId);

    if (!tracking) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order tracking fetched successfully',
      data: tracking,
    };
  }

  async getProfile(userId: number) {
    const user = await this.database.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Profile fetched successfully',
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        adminLevel: user.adminLevel,
        status: user.status,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async updateProfile(userId: number, payload: UpdateProfileDto) {
    const user = await this.database.updateCustomerProfile(userId, payload);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Profile updated successfully',
      data: user,
    };
  }

  async updatePassword(userId: number, payload: UpdatePasswordDto) {
    if (payload.newPassword !== payload.confirmNewPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    if (payload.newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const user = await this.database.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      !this.passwordService.verify(payload.currentPassword, user.passwordHash)
    ) {
      throw new BadRequestException('Current password is incorrect');
    }

    await this.database.updateUser(userId, {
      passwordHash: this.passwordService.hash(payload.newPassword),
    });

    return {
      message: 'Password updated successfully',
    };
  }

  async listAddresses(userId: number) {
    return {
      message: 'Addresses fetched successfully',
      data: await this.database.getUserAddresses(userId),
    };
  }

  async createAddress(userId: number, payload: CreateAddressDto) {
    return {
      message: 'Address created successfully',
      data: await this.database.createUserAddress(userId, payload),
    };
  }

  async updateAddress(
    userId: number,
    addressId: number,
    payload: UpdateAddressDto,
  ) {
    const address = await this.database.updateUserAddress(userId, addressId, payload);

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return {
      message: 'Address updated successfully',
      data: address,
    };
  }

  async setDefaultAddress(
    userId: number,
    addressId: number,
    payload: SetDefaultAddressDto,
  ) {
    const address = await this.database.setDefaultUserAddress(
      userId,
      addressId,
      payload.isDefault,
    );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return {
      message: 'Default address updated successfully',
      data: address,
    };
  }

  async deleteAddress(userId: number, addressId: number) {
    const deleted = await this.database.deleteUserAddress(userId, addressId);

    if (!deleted) {
      throw new NotFoundException('Address not found');
    }

    return {
      message: 'Address deleted successfully',
    };
  }

  async getNotifications(userId: number) {
    return {
      message: 'Notifications fetched successfully',
      data: await this.database.getUserNotifications(userId),
    };
  }

  async markNotificationRead(userId: number, notificationId: number) {
    const notification = await this.database.markNotificationRead(
      userId,
      notificationId,
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return {
      message: 'Notification marked as read',
      data: notification,
    };
  }

  async markAllNotificationsRead(userId: number) {
    await this.database.markAllNotificationsRead(userId);

    return {
      message: 'All notifications marked as read',
    };
  }

  async contactAdmin(userId: number, payload: ContactAdminDto) {
    const result = await this.database.createAdminContactNotification(
      userId,
      payload,
    );

    return {
      message: 'Contact request sent to admin successfully',
      data: result,
    };
  }

  async addWishlistItem(userId: number, productId: number) {
    return {
      message: 'Item added to wishlist successfully',
      data: await this.database.addWishlistItem(userId, productId),
    };
  }

  async getWishlist(userId: number) {
    return {
      message: 'Wishlist fetched successfully',
      data: await this.database.getWishlist(userId),
    };
  }

  async deleteWishlistItem(userId: number, wishlistItemId: number) {
    const deleted = await this.database.deleteWishlistItem(userId, wishlistItemId);

    if (!deleted) {
      throw new NotFoundException('Wishlist item not found');
    }

    return {
      message: 'Wishlist item deleted successfully',
    };
  }

  async createReview(userId: number, payload: CreateReviewDto) {
    if (payload.rating < 1 || payload.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    return {
      message: 'Review created successfully',
      data: await this.database.createProductReview(userId, payload),
    };
  }
}
