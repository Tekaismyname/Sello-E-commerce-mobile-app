# Sello Ecommerce API

Backend NestJS cho Sello Ecommerce, hien dang co:
- Auth flow: register, verify OTP, login, logout, forgot password, reset password
- Role-based access: `customer`, `admin`
- Homepage API: `GET /home`
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
POST /auth/register
POST /auth/verify-otp
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/logout
```

### Protected

```http
GET /auth/me
GET /auth/admin/ping
DELETE /auth/users/:userId
```

## Auth Notes

- `POST /auth/login` la endpoint chung cho ca `customer` va `admin`
- Sau khi login thanh cong, backend tra ve:
  - `accessToken`
  - `refreshToken`
  - `role`
  - `permissions`
- Endpoint admin duoc bao ve bang `JwtAuthGuard` va `RolesGuard`

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
- Register Flow
- Login Flow
- Forgot Password Flow
- Logout
- Get Me
- Admin Ping
- Delete Registered User

## Code Structure

- [main.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/main.ts): boot app va kiem tra ket noi MySQL
- [app.module.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/app.module.ts): module goc
- [auth.controller.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/auth/auth.controller.ts): auth endpoints
- [auth.service.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/auth/auth.service.ts): auth business logic
- [mysql-database.service.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/auth/services/mysql-database.service.ts): truy van MySQL
- [catalog.controller.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/catalog/catalog.controller.ts): homepage endpoint
- [catalog.service.ts](c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce/src/catalog/catalog.service.ts): homepage data aggregation
