# Sello E-commerce Mobile App (FE)

Ứng dụng mobile FE cho Sello, xây bằng Expo + React Native + Expo Router + NativeWind.

Trạng thái hiện tại:
- FE đang chạy theo hướng **BE thật (không dùng mock service)**.
- Auth gọi trực tiếp backend auth API.
- Main data (`home/categories/search/product-list`) gọi trực tiếp `GET /home` rồi map dữ liệu cho UI.

## 1. Công nghệ chính

- Expo SDK 54
- React Native 0.81
- Expo Router (file-based routing)
- NativeWind (Tailwind cho React Native)
- TypeScript

## 2. Yêu cầu môi trường

- Node.js 18+ (khuyến nghị Node 20 LTS)
- npm
- Android Studio Emulator hoặc thiết bị thật có Expo Go
- Backend `Sello-Backend-Run` đang chạy

## 3. Cài đặt và chạy nhanh

### Bước 1: Chạy backend

Tại thư mục backend:

```bash
cd ../Sello-Backend-Run
npm install
npm run start:dev
```

Backend mặc định: `http://localhost:3000`

### Bước 2: Cấu hình `.env` cho FE

Tại thư mục này (`Sello-E-commerce-mobile-app`), file `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000
```

Lưu ý:
- Android emulator: nếu đặt `localhost` hoặc `127.0.0.1`, app sẽ tự đổi host sang `10.0.2.2`.
- Thiết bị thật: dùng IP LAN của máy chạy backend, ví dụ `http://192.168.1.10:3000`.

### Bước 3: Chạy FE

```bash
npm install
npm run start
```

Sau đó chọn:
- `a` để mở Android emulator
- quét QR bằng Expo Go nếu chạy trên máy thật

## 4. Scripts hữu ích

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
npx tsc --noEmit
```

## 5. Cấu trúc thư mục

```txt
app/
  auth/           # Login/Register/Forgot Password/OTP/Reset Password
  onboarding/     # Welcome + onboarding
  main/           # Tab chính: home/categories/cart/orders/profile/search/product-list
components/
  auth/           # UI auth
  main/           # Header, tab bar, sections trang main
  product/        # Các component product-list
  ui/             # Component dùng chung
services/
  auth.service.ts # Gọi API auth
  main.service.ts # Gọi API /home + map dữ liệu UI
hooks/
  auth/
  main/
constants/
  api.ts          # Resolve API_BASE_URL + endpoint path
types/
  auth.ts
  main.ts
```

## 6. Routing chính

- `/` -> splash ngắn, sau đó chuyển `/onboarding/onboarding`
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/otp`
- `/auth/reset-password`
- `/main/home`
- `/main/categories`
- `/main/search`
- `/main/product-list`
- `/main/cart`
- `/main/orders`
- `/main/profile`

## 7. API đang dùng

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/verify-otp`
- `POST /auth/reset-password`

### Main

- `GET /home`

FE map từ `/home` cho các màn:
- Home
- Categories
- Search
- Product List

## 8. Trạng thái màn hình theo backend

- Đã nối backend thật:
  - Auth flow
  - Home
  - Categories
  - Search
  - Product List
- Chưa có endpoint riêng từ backend (đang là placeholder UI chờ tích hợp API):
  - Cart
  - Orders
  - Profile

## 9. Lưu ý quan trọng

- Dự án hiện không còn cờ `USE_MOCK_API` trong services.
- `main.service.ts` và `auth.service.ts` đều gọi BE trực tiếp.
- Nếu backend không chạy hoặc URL sai, FE sẽ hiển thị trạng thái lỗi tải dữ liệu.

## 10. Troubleshooting

### Lỗi không kết nối backend

Kiểm tra lần lượt:
- Backend có đang chạy ở cổng `3000` không.
- `.env` có đúng `EXPO_PUBLIC_API_BASE_URL` không.
- Nếu chạy trên thiết bị thật, không dùng `localhost`; dùng IP LAN.
- Nếu đổi `.env`, restart lại Expo (`Ctrl + C` rồi `npm run start`).

### Dữ liệu không lên ở màn main

- Test nhanh endpoint:

```bash
curl http://127.0.0.1:3000/home
```

- Nếu endpoint trả lỗi, xử lý backend trước.

### Kiểm tra chất lượng FE

```bash
npm run lint
npx tsc --noEmit
```

## 11. Gợi ý mở rộng tiếp

- Thêm endpoint backend cho:
  - Cart
  - Orders
  - Profile
- Tạo state auth toàn cục (token storage + auto login)
- Bổ sung loading skeleton và empty state cho các màn main
