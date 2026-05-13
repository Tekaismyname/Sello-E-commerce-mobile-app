import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import type { JwtPayload } from '../../auth/types/auth.types';

type AuditedRequest = Request & {
  user?: JwtPayload;
};

@Injectable()
export class RequestAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('UserAction');

  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const request = http.getRequest<AuditedRequest>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();
    const action = this.describeAction(request.method, request.path);
    const user = this.describeUser(request.user);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `${user} action="${action}" method=${request.method} path=${request.path} status=${response.statusCode} durationMs=${Date.now() - startedAt}`,
        );
      }),
      catchError((error: unknown) => {
        const status =
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          typeof error.status === 'number'
            ? error.status
            : response.statusCode || 500;

        this.logger.warn(
          `${user} action="${action}" method=${request.method} path=${request.path} status=${status} durationMs=${Date.now() - startedAt}`,
        );

        return throwError(() => error);
      }),
    );
  }

  private describeUser(user?: JwtPayload) {
    if (!user) {
      return 'user=guest';
    }

    return [
      `userId=${user.sub}`,
      `role=${user.role}`,
      user.email ? `email=${user.email}` : null,
      user.phone ? `phone=${user.phone}` : null,
      user.adminLevel ? `adminLevel=${user.adminLevel}` : null,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private describeAction(method: string, path: string) {
    const normalizedPath = path.replace(/\/\d+(?=\/|$)/g, '/:id');
    const key = `${method.toUpperCase()} ${normalizedPath}`;

    const actionMap: Record<string, string> = {
      'GET /': 'health_check',
      'GET /home': 'view_home',
      'POST /auth/register': 'register',
      'POST /auth/verify-otp': 'verify_otp',
      'POST /auth/login': 'login',
      'POST /auth/logout': 'logout',
      'GET /auth/me': 'view_current_user',
      'GET /auth/admin/ping': 'admin_ping',
      'GET /auth/admin/operations/ping': 'admin_operations_ping',
      'GET /products/:id': 'view_product_detail',
      'GET /products/:id/reviews': 'view_product_reviews',
      'GET /cart': 'view_cart',
      'POST /cart/items': 'add_cart_item',
      'PUT /cart/items/:id': 'update_cart_item',
      'PATCH /cart/items/:id/select': 'select_cart_item',
      'DELETE /cart/items/:id': 'delete_cart_item',
      'GET /cart/summary': 'view_cart_summary',
      'POST /checkout/preview': 'preview_checkout',
      'POST /checkout/apply-voucher': 'apply_voucher',
      'POST /orders': 'create_order',
      'GET /orders/me': 'view_my_orders',
      'GET /orders/:id': 'view_order_detail',
      'POST /orders/:id/cancel': 'cancel_order',
      'GET /orders/:id/tracking': 'view_order_tracking',
      'POST /payments/mock/:id/callback': 'mock_payment_callback',
      'GET /payments/mock/:id/status': 'view_mock_payment_status',
      'GET /payments/mock/:id/confirm-page': 'view_mock_payment_confirm_page',
      'POST /payments/mock/:id/confirm': 'confirm_mock_payment',
      'POST /payments/mock/:id/decline': 'decline_mock_payment',
      'GET /me': 'view_profile',
      'PUT /me': 'update_profile',
      'PUT /me/password': 'update_password',
      'POST /me/contact-admin': 'contact_admin',
      'GET /addresses': 'list_addresses',
      'POST /addresses': 'create_address',
      'PUT /addresses/:id': 'update_address',
      'PATCH /addresses/:id/default': 'set_default_address',
      'DELETE /addresses/:id': 'delete_address',
      'GET /notifications': 'list_notifications',
      'PATCH /notifications/:id/read': 'mark_notification_read',
      'PATCH /notifications/read-all': 'mark_all_notifications_read',
      'POST /wishlist/items': 'add_wishlist_item',
      'GET /wishlist': 'view_wishlist',
      'DELETE /wishlist/items/:id': 'delete_wishlist_item',
      'POST /reviews': 'create_review',
      'GET /admin/system/dashboard': 'admin_view_dashboard',
      'PUT /admin/system/config': 'admin_update_system_config',
      'GET /admin/users': 'admin_list_users',
      'GET /admin/users/:id': 'admin_view_user',
      'PATCH /admin/users/:id/status': 'admin_update_user_status',
      'PATCH /admin/users/:id/role': 'admin_update_user_role',
      'DELETE /auth/users/:id': 'admin_delete_user',
      'GET /admin/orders': 'admin_list_orders',
      'GET /admin/orders/:id': 'admin_view_order',
      'PATCH /admin/orders/:id/status': 'admin_update_order_status',
      'GET /admin/products': 'admin_list_products',
      'POST /admin/products': 'admin_create_product',
      'GET /admin/products/:id': 'admin_view_product',
      'PUT /admin/products/:id': 'admin_update_product',
      'PATCH /admin/products/:id/status': 'admin_update_product_status',
      'GET /admin/categories': 'admin_list_categories',
      'POST /admin/categories': 'admin_create_category',
      'PUT /admin/categories/:id': 'admin_update_category',
      'PATCH /admin/categories/:id/status': 'admin_update_category_status',
      'DELETE /admin/categories/:id': 'admin_delete_category',
      'GET /admin/vouchers': 'admin_list_vouchers',
      'POST /admin/vouchers': 'admin_create_voucher',
      'PUT /admin/vouchers/:id': 'admin_update_voucher',
      'PATCH /admin/vouchers/:id/status': 'admin_update_voucher_status',
      'DELETE /admin/vouchers/:id': 'admin_delete_voucher',
      'GET /admin/notifications': 'admin_list_notifications',
      'POST /admin/notifications': 'admin_create_notification',
      'GET /admin/reviews': 'admin_list_reviews',
      'PATCH /admin/reviews/:id/moderation': 'admin_moderate_review',
      'GET /admin/reports/overview': 'admin_view_reports',
      'POST /admin/reports/export': 'admin_export_reports',
    };

    return actionMap[key] ?? key.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  }
}
