# Sello E-commerce Mobile App

Ứng dụng mobile frontend cho Sello E-commerce, xây dựng bằng Expo, React Native, Expo Router, NativeWind và TypeScript. App đang kết nối backend thật, không còn dùng mock service cho các luồng chính.

## Tính Năng Chính

- Auth: đăng ký, đăng nhập, OTP, quên mật khẩu, reset mật khẩu, lưu phiên bằng auth context.
- Customer: home, category, search, product list/detail, cart, checkout, orders, profile, address, wishlist, notification, review.
- Customer notification: người dùng xem thông báo tại `/main/notifications`, màn này tự refresh mỗi 10 giây khi đang mở, kéo để làm mới, đánh dấu đã đọc hoặc đã đọc tất cả.
- Contact admin: trong profile có mục “Liên hệ với admin”, gửi nội dung hỗ trợ thành thông báo tới admin active.
- Product detail: chọn variant, số lượng, thêm giỏ hàng, mua ngay, kiểm tra tồn kho theo backend.
- Admin: dashboard, products, orders, reports và admin menu.
- Admin menu: users, system config, categories, vouchers, notifications, reviews theo `user.permissions`.
- Admin category: danh sách, tạo/sửa, tạo nhanh danh mục cha, soft delete.
- Admin voucher: danh sách, tạo/sửa, chọn ngày bằng calendar, điều kiện sử dụng rõ ràng, active/inactive.
- Admin product: tạo/sửa sản phẩm, variants, ảnh URL, giá, tồn kho, trạng thái.
- Admin notification: gửi thông báo theo nhóm người dùng.
- Admin review: lọc, ẩn/hiện/xóa mềm review.

## Công Nghệ

- Expo SDK 54
- React Native 0.81
- React 19
- Expo Router 6
- NativeWind 4
- TypeScript 5.9

## Cài Đặt

```bash
npm install
```

Tạo file `.env` từ `.env.example`:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000
```

Lưu ý khi chọn URL backend:

- Android Emulator có thể dùng `http://127.0.0.1:3000`; app sẽ tự xử lý host emulator nếu service cấu hình hỗ trợ.
- Thiết bị thật phải dùng IP LAN của máy chạy backend, ví dụ `http://192.168.1.10:3000`.
- Sau khi đổi `.env`, hãy restart Expo.

## Chạy App

```bash
npm run start
```

Sau đó chọn:

- `a` để mở Android Emulator.
- Quét QR bằng Expo Go nếu chạy trên thiết bị thật.

Các script khác:

```bash
npm run android
npm run ios
npm run web
npm run lint
npx tsc --noEmit
```

## Backend Cần Chạy

Backend mặc định chạy tại:

```txt
http://localhost:3000
```

Chạy backend từ thư mục `../Sello-Ecommerce-Backend`:

```bash
npm install
npm run start:dev
```

## Routing Chính

- `/` splash/entry.
- `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/otp`, `/auth/reset-password`.
- `/main/home`, `/main/categories`, `/main/search`, `/main/product-list`, `/main/cart`, `/main/orders`, `/main/profile`.
- `/main/notifications`.
- `/product/detail`, `/product/reviews`, `/product/write-review`.
- `/order/[id]`.
- `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/reports`, `/admin/menu`.
- `/admin/categories`, `/admin/category-form`.
- `/admin/vouchers`, `/admin/voucher-form`.
- `/admin/notifications`, `/admin/reviews`.

## Cấu Trúc Thư Mục

```txt
app/                    # Expo Router screens
app/admin/              # Admin pages
app/auth/               # Auth screens
app/main/               # Customer tab screens
app/product/            # Product detail/review screens
components/             # UI components
components/admin/       # Admin-specific components
constants/api.ts        # API endpoints and base URL
contexts/auth-context.tsx
hooks/                  # Data hooks
services/               # API service layer
types/                  # Shared TypeScript types
```

## Phân Quyền Admin

UI admin không hard-code theo role string. App đọc `user.permissions` từ backend để ẩn/hiện action.

- Level 1: toàn quyền, gồm delete/soft-delete, system config, user role.
- Level 2: create/update category, voucher, notification, review moderation; không delete các phần nhạy cảm.
- Level 3: read-only cho các màn admin chính.

## Tiếng Việt

Expo `TextInput` hỗ trợ nhập tiếng Việt sẵn, không cần cài `expo-localization`, `i18next`, `react-i18next` nếu mục tiêu chỉ là nhập/hiển thị tiếng Việt.

Chỉ cài i18n khi app cần đa ngôn ngữ. Nếu thấy chữ Việt bị vỡ encoding, đó là dữ liệu/file đã bị lưu sai trước đó, cần sửa nội dung UTF-8 hoặc convert dữ liệu cũ trong database.

## Kiểm Tra Chất Lượng

```bash
npx tsc --noEmit
npm run lint
```

Khi lint toàn repo bị chặn bởi lỗi cũ không liên quan, có thể lint file đã sửa:

```bash
npx eslint app/admin/vouchers.tsx app/admin/category-form.tsx app/admin/products.tsx app/admin/add-product.tsx services/admin.service.ts
```

## Troubleshooting

- Không kết nối backend: kiểm tra backend có chạy cổng `3000`, `.env` đúng URL, thiết bị thật dùng IP LAN.
- Tạo/sửa voucher không thấy cập nhật: quay lại màn voucher sẽ tự refresh bằng `useFocusEffect`; nếu vẫn không thấy, kiểm tra quyền `vouchers:read`.
- Không thấy thông báo mới: mở icon chuông hoặc kéo refresh ở `/main/notifications`; backend đã tạo notification ngay khi admin gửi.
- Liên hệ admin không gửi được: kiểm tra user đã đăng nhập và backend có ít nhất một admin `active`.
- Tồn kho product không cập nhật: backend cần trả `stockQty` từ variants; frontend hiển thị theo `stockQty`.
- Ngày voucher lỗi: form dùng calendar để tránh ngày không tồn tại; backend cũng validate lại trước khi lưu.
- Android Emulator không gọi được `localhost`: dùng ADB reverse hoặc IP phù hợp.

ADB reverse:

```powershell
& "C:\Users\hokha\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
```
