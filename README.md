# Sello E-commerce Backend

Backend NestJS cho Sello E-commerce, dùng MySQL và JWT. API hiện phục vụ cả customer app và admin app.

## Tính Năng Chính

- Auth: register, verify OTP, login, logout, forgot password, reset password.
- Social login: Google OAuth2 và iCloud/Apple placeholder flow.
- Role-based access: `customer`, `admin`.
- Admin hierarchy: `admin_level` 1, 2, 3.
- Permission-based admin API qua `@Permissions`.
- Public catalog: home, product detail, product reviews.
- Customer flows: cart, checkout, voucher apply, order, order cancel/tracking, payment mock callback.
- Customer account: profile, password, addresses, wishlist, notifications, contact admin, reviews.
- Admin flows: dashboard, users, orders, products, reports, categories, vouchers, notifications, review moderation.
- MySQL UTF-8/UTF-8MB4 support for Vietnamese text.

## Cài Đặt

```bash
npm install
```

Tạo `.env` từ `.env.example`:

```env
PORT=3000
JWT_SECRET=sello-local-secret

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=Sello_commerce
MYSQL_CONNECTION_LIMIT=10
MYSQL_TIMEZONE=Z

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SMTP_FROM=Sello Ecommerce <your_email@gmail.com>

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
APP_AUTH_REDIRECT_URI=selloecommerce://auth/callback
```

Chạy development:

```bash
npm run start:dev
```

API mặc định chạy tại:

```txt
http://localhost:3000
```

## Scripts

```bash
npm run start
npm run start:dev
npm run start:debug
npm run start:prod
npm run build
npm run lint
npm run test
npm run test:e2e
```

## Database Notes

Backend dùng MySQL qua `mysql2/promise`. Khi boot, service sẽ kiểm tra kết nối và tự bổ sung một số cột admin nếu thiếu:

- `categories.description`
- `notifications.image_url`
- `product_reviews.moderation_status`
- `product_reviews.moderated_by`
- `product_reviews.moderated_at`
- `product_reviews.moderation_note`

Connection pool cấu hình `charset: utf8mb4` và chạy `SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci` khi kiểm tra kết nối để hỗ trợ tiếng Việt tốt hơn.

Nếu dữ liệu cũ đã bị vỡ encoding, cần sửa/convert dữ liệu cũ trong database; cấu hình UTF-8 chỉ đảm bảo dữ liệu mới lưu đúng.

## Main Endpoints

### Public

```http
GET /
GET /home
GET /products/:productId
GET /products/:productId/reviews
POST /auth/register
POST /auth/verify-otp
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/logout
GET /auth/google
GET /auth/icloud
```

### Customer Protected

```http
GET /auth/me
GET /cart
POST /cart/items
PUT /cart/items/:cartItemId
PATCH /cart/items/:cartItemId/select
DELETE /cart/items/:cartItemId
GET /cart/summary
POST /checkout/preview
POST /checkout/apply-voucher
POST /orders
GET /orders/me
GET /orders/:orderId
POST /orders/:orderId/cancel
GET /orders/:orderId/tracking
POST /payments/mock/:paymentId/callback
GET /me
PUT /me
PUT /me/password
POST /me/contact-admin
GET /addresses
POST /addresses
PUT /addresses/:addressId
PATCH /addresses/:addressId/default
DELETE /addresses/:addressId
GET /notifications
PATCH /notifications/:notificationId/read
PATCH /notifications/read-all
POST /wishlist/items
GET /wishlist
DELETE /wishlist/items/:wishlistItemId
POST /reviews
```

### Admin

```http
GET /auth/admin/ping
GET /auth/admin/operations/ping
DELETE /auth/users/:userId

GET /admin/system/dashboard
PUT /admin/system/config

GET /admin/users
GET /admin/users/:userId
PATCH /admin/users/:userId/status
PATCH /admin/users/:userId/role

GET /admin/orders
GET /admin/orders/:orderId
PATCH /admin/orders/:orderId/status

GET /admin/products
POST /admin/products
GET /admin/products/:productId
PUT /admin/products/:productId
PATCH /admin/products/:productId/status

GET /admin/categories
POST /admin/categories
PUT /admin/categories/:categoryId
PATCH /admin/categories/:categoryId/status
DELETE /admin/categories/:categoryId

GET /admin/vouchers
POST /admin/vouchers
PUT /admin/vouchers/:voucherId
PATCH /admin/vouchers/:voucherId/status
DELETE /admin/vouchers/:voucherId

GET /admin/notifications
POST /admin/notifications

GET /admin/reviews
PATCH /admin/reviews/:reviewId/moderation

GET /admin/reports/overview
POST /admin/reports/export
```

## Auth Và Permissions

`POST /auth/login` dùng chung cho customer và admin. Sau khi login thành công, backend trả:

- `accessToken`
- `refreshToken`
- `role`
- `adminLevel`
- `permissions`

Admin API được bảo vệ bằng JWT guard, role/admin guard và permission guard. Frontend nên dựa vào `permissions`, không hard-code theo role string.

## Admin Permission Matrix

| Capability | Level 1 | Level 2 | Level 3 |
|---|---:|---:|---:|
| System dashboard | Có | Có | Có |
| System config | Có | Không | Không |
| Users read | Có | Có | Có |
| Users status update | Có | Có | Không |
| Users role update | Có | Không | Không |
| Orders read/update | Có | Có | Có |
| Products read | Có | Có | Có |
| Products create/update/status | Có | Có | Không |
| Categories read | Có | Có | Có |
| Categories create/update/status | Có | Có | Không |
| Categories delete/soft-delete | Có | Không | Không |
| Vouchers read | Có | Có | Có |
| Vouchers create/update/status | Có | Có | Không |
| Vouchers delete/soft-delete | Có | Không | Không |
| Notifications read/create | Có | Có | Có đọc, không tạo |
| Reviews read/moderate | Có | Có | Có đọc, không duyệt |
| Reports overview | Có | Có | Có |
| Reports export | Có | Không | Không |

## Admin Behavior Notes

- Category delete là soft delete bằng `status = inactive`.
- Voucher delete là soft delete bằng `is_active = false`.
- Voucher date được validate trước khi lưu; ngày không tồn tại sẽ trả `BadRequestException`, không để MySQL trả lỗi `ER_TRUNCATED_WRONG_VALUE`.
- Product list trả `stockQty` tổng từ active variants để frontend hiển thị tồn kho đúng.
- Notification target hiện hỗ trợ `all_users`, `customer_only`, `admin_only`.
- Khi admin gọi `POST /admin/notifications`, backend tạo một notification row cho từng user khớp target ngay trong request.
- `POST /me/contact-admin` tạo notification cho toàn bộ admin `active`, giúp user liên hệ admin từ profile.
- Review moderation hỗ trợ `visible`, `hidden`, `deleted`; public review chỉ trả review `visible`.

## Customer Flow Notes

- `GET /products/:productId`: trả detail, variants, images, stock và review summary.
- `POST /cart/items`: thêm sản phẩm/variant vào giỏ; nếu trùng item thì cộng quantity.
- `PATCH /cart/items/:cartItemId/select`: chọn item để checkout.
- `POST /checkout/preview`: tính subtotal, shipping, voucher discount.
- `POST /checkout/apply-voucher`: validate voucher theo selected cart items.
- `POST /orders`: tạo đơn từ selected cart items.
- `POST /orders/:orderId/cancel`: chỉ hủy đơn `pending` hoặc `confirmed`, hoàn kho và hoàn voucher/payment nếu phù hợp.
- `GET /orders/me`, `GET /orders/:orderId`, `GET /orders/:orderId/tracking`: lịch sử, chi tiết và tracking.
- `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`: đọc và cập nhật thông báo user.
- `POST /me/contact-admin`: user gửi nội dung hỗ trợ tới admin dưới dạng notification.
- `POST /reviews`: chỉ cho review khi user đã mua sản phẩm và đơn đã `delivered`.

## Reports

`POST /admin/reports/export` ghi file vào thư mục `exports/` tại root backend và trả:

- `fileName`
- `filePath`
- `mimeType`

## Code Structure

```txt
src/main.ts                         # Bootstrap app, CORS, health logs
src/app.module.ts                   # Root module
src/auth/                           # Auth, JWT, guards, permissions
src/auth/services/mysql-database.service.ts
src/admin/                          # Admin controller/service/dto
src/catalog/                        # Home/catalog API
src/customer/                       # Customer cart/order/profile APIs
```

## Kiểm Tra

```bash
npm run build
npm run test
```

Lint backend hiện dùng `--fix`:

```bash
npm run lint
```

Nếu repo đang có khác biệt line-ending/Prettier cũ, nên kiểm tra diff kỹ trước khi commit sau khi chạy lint.

## Postman

Collection hiện nằm tại frontend repo:

```txt
../Sello-Ecommerce/Sello-Auth.postman_collection.json
```

Thứ tự test nhanh:

1. Login Customer.
2. Get Product Detail.
3. Create Address.
4. Add Cart Item.
5. Select Cart Item.
6. Checkout Preview.
7. Create Order.
8. Mock Payment Callback nếu đơn online.
9. Get My Orders.
10. Get Order Detail.
11. Get Order Tracking.

## Android Emulator Note

Khi frontend chạy trên Android Emulator và backend chạy local, có thể dùng ADB reverse:

```powershell
& "C:\Users\hokha\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
& "C:\Users\hokha\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
```

Kiểm tra mapping:

```powershell
& "C:\Users\hokha\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse --list
```

Xóa mapping:

```powershell
& "C:\Users\hokha\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse --remove tcp:3000
```
