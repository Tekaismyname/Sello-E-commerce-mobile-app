# Sello Ecommerce API

Backend NestJS cho Sello Ecommerce, hien dang co:
- Auth flow: register, verify OTP, login, logout, forgot password, reset password
- Social login: Google (OAuth2), iCloud (Apple)
- Role-based access: `customer`, `admin`
- Admin hierarchy via `admin_level` (`1`, `2`, `3`)
- Homepage API: `GET /home`
- Public product detail: `GET /products/:productId`
- Customer flows: cart, checkout, orders, address, profile, wishlist, notifications, reviews
- MySQL integration
- OTP delivery qua `email` hoac `phone`

## Run

```bash
npm install
npm run start:dev
```

API mac dinh chay tai `http://localhost:3000`.
Khi app boot thanh cong, terminal se in ra base URL va nhom auth endpoints.

## Environment

Tao file `.env` tu `.env.example`.

### MySQL

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=Sello_commerce
MYSQL_CONNECTION_LIMIT=10
MYSQL_TIMEZONE=Z
```

Backend auth hien dang dung du lieu MySQL, dac biet la cac bang:
- `users`
- `user_otps`
- `auth_refresh_tokens`  
Bang `auth_refresh_tokens` se duoc tao tu dong neu chua ton tai.

### JWT

```env
JWT_SECRET=sello-local-secret
```

### SMTP

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SMTP_FROM=Sello Ecommerce <your_email@gmail.com>
```

Neu chua cau hinh SMTP:
- OTP qua email se khong gui that
- backend van tra `otpCodePreview` de test local

## Scripts

```bash
npm run start
npm run start:dev
npm run start:prod
npm run build
npm run test
npm run test:e2e
```

## Main Endpoints

### Public

```http
GET /home
GET /
GET /products/:productId
POST /auth/register
POST /auth/verify-otp
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/logout
GET /auth/google
GET /auth/icloud
```

### Protected

```http
GET /auth/me
GET /auth/admin/ping
GET /auth/admin/operations/ping
DELETE /auth/users/:userId
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
PUT /admin/products/:productId
PATCH /admin/products/:productId/status
GET /admin/reports/overview
POST /admin/reports/export
```

## Auth Notes

- `POST /auth/login` la endpoint chung cho ca `customer` va `admin`
- Sau khi login thanh cong, backend tra ve:
  - `accessToken`
  - `refreshToken`
  - `role`
  - `adminLevel`
  - `permissions`
- Endpoint admin duoc bao ve bang `JwtAuthGuard` va `RolesGuard`
- Endpoint theo cap admin duoc bao ve them bang `AdminLevelGuard`
- Quy uoc admin level hien tai:
  - `admin_level = 1`: toan quyen, co the xoa user va quan ly admin khac
  - `admin_level = 2`: van hanh, vao duoc route admin va operations
  - `admin_level = 3`: chi vao duoc route admin co ban
- Route mau theo admin level:
  - `GET /auth/admin/ping`: cho `admin_level` `1`, `2`, `3`
  - `GET /auth/admin/operations/ping`: cho `admin_level` `1`, `2`
  - `DELETE /auth/users/:userId`: chi cho `admin_level = 1`

## Admin Permission Matrix

| Capability | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| `GET /admin/system/dashboard` | Co | Co | Co |
| `PUT /admin/system/config` | Co | Khong | Khong |
| `GET /admin/users` / `GET /admin/users/:id` | Co | Co | Co |
| `PATCH /admin/users/:id/status` | Co | Co | Khong |
| `PATCH /admin/users/:id/role` | Co | Khong | Khong |
| `GET /admin/orders` / `GET /admin/orders/:id` | Co | Co | Co |
| `PATCH /admin/orders/:id/status` | Co | Co | Co |
| `GET /admin/products` | Co | Co | Co |
| `POST /admin/products` | Co | Co | Khong |
| `PUT /admin/products/:id` | Co | Co | Khong |
| `PATCH /admin/products/:id/status` | Co | Co | Khong |
| `GET /admin/reports/overview` | Co | Co | Co |
| `POST /admin/reports/export` | Co | Khong | Khong |

API admin moi duoc to chuc theo sequence:
- System dashboard va config
- User management
- Order management
- Product management
- Report overview va export

## Customer Flow Notes

- `GET /products/:productId`: lay chi tiet san pham cong khai kem variants va reviews
- `POST /cart/items`: them san pham/variant vao gio, neu trung item thi cong don quantity
- `PATCH /cart/items/:cartItemId/select`: danh dau item duoc checkout
- `POST /checkout/preview`: tinh tam subtotal, shipping fee, voucher discount va tra ve dia chi + payment methods
- `POST /checkout/apply-voucher`: validate ma giam gia tren cac selected cart items
- `POST /orders`: tao don hang tu selected cart items
- `POST /payments/mock/:paymentId/callback`: callback mock cho online payment de test local
- `GET /orders/me` va `GET /orders/:orderId`: xem lich su va chi tiet don
- `POST /orders/:orderId/cancel`: chi cho phep huy don o trang thai `pending` hoac `confirmed`
- `GET /orders/:orderId/tracking`: doc shipment + timeline trang thai
- `GET /me`, `PUT /me`, `PUT /me/password`: thong tin ho so va doi mat khau
- `GET /addresses`, `POST /addresses`, `PUT /addresses/:id`, `PATCH /addresses/:id/default`, `DELETE /addresses/:id`: CRUD dia chi giao hang
- `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`: thong bao cua user
- `POST /wishlist/items`, `GET /wishlist`, `DELETE /wishlist/items/:id`: wishlist co check trung item
- `POST /reviews`: chi cho review khi user da mua san pham va don da `delivered`

`POST /admin/reports/export` hien tai se ghi file that vao thu muc `exports/` tai root cua project va tra ve:
- `fileName`
- `filePath`
- `mimeType`

## OTP Notes

`register` va `forgot-password` ho tro:
- `deliveryMethod = email`
- `deliveryMethod = phone`

`verify-otp` xac thuc theo:
- `targetValue`
- `purpose`
- `otpCode`

Voi reset password, client can gui dung `targetValue` da dung de nhan OTP.

## Postman

Collection da duoc tao san tai:

[Sello-Auth.postman_collection.json](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/Sello-Auth.postman_collection.json)

Collection hien co:
- Home Page
- Public Product
- Register Flow
- Login Flow
- Forgot Password Flow
- Logout
- Get Me
- Admin Ping
- Admin Operations Ping
- Admin Management
- Customer Cart & Checkout
- Customer Orders
- Customer Account
- Delete Registered User

Thu tu test nhanh khuyen nghi:
1. `Login Customer`
2. `Public Product -> Get Product Detail`
3. `Customer Account -> Create Address`
4. `Customer Cart & Checkout -> Add Cart Item`
5. `Customer Cart & Checkout -> Select Cart Item`
6. `Customer Cart & Checkout -> Checkout Preview`
7. `Customer Cart & Checkout -> Create Order`
8. Neu don online: `Customer Orders -> Mock Payment Callback Success`
9. `Customer Orders -> Get My Orders`
10. `Customer Orders -> Get Order Detail`
11. `Customer Orders -> Get Order Tracking`

Luu y Postman:
- Collection se tu luu cac bien `cartItemId`, `addressId`, `orderId`, `paymentId`, `notificationId`, `wishlistItemId` tu response gan nhat khi co the.
- Cac request `Create Review` chi thanh cong khi user da co don `delivered` chua san pham do.
- Cac request `Cancel Order` chi thanh cong khi don van o trang thai `pending` hoac `confirmed`.

## Code Structure

- [main.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/main.ts): boot app va kiem tra ket noi MySQL
- [app.module.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/app.module.ts): module goc
- [auth.controller.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/auth/auth.controller.ts): auth endpoints
- [auth.service.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/auth/auth.service.ts): auth business logic
- [mysql-database.service.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/auth/services/mysql-database.service.ts): truy van MySQL
- [catalog.controller.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/catalog/catalog.controller.ts): homepage endpoint
- [catalog.service.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/catalog/catalog.service.ts): homepage data aggregation
