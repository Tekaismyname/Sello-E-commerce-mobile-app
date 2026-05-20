# Sello E-commerce Mobile App

Ung dung mobile frontend cho Sello E-commerce, xay dung bang Expo, React Native, Expo Router, NativeWind va TypeScript. App dang ket noi backend that cho cac luong auth, cart, checkout, orders, profile, address, wishlist, notification va admin.

## Tinh Nang Chinh

- Auth: dang ky, dang nhap, OTP, quen mat khau, reset mat khau, luu phien bang auth context.
- Customer: home, category, search, product list/detail, cart, checkout, orders, profile, address, wishlist, notification, review.
- Orders: danh sach don hang, chi tiet don, huy don, theo doi don hang, lich su trang thai, hien thi san pham da mua ro rang theo tung order.
- Order tracking map: frontend dung Leaflet trong WebView, nen map tu OpenStreetMap, route geometry va quang duong tu backend.
- Address book: tao, sua, dat mac dinh, xoa dia chi; thong bao loi than thien khi dia chi dang duoc su dung trong don hang.
- Product detail: chon variant, so luong, them gio hang, mua ngay, kiem tra ton kho theo backend.
- Admin: dashboard, products, orders, reports va admin menu.
- Admin menu: users, system config, categories, vouchers, notifications, reviews theo `user.permissions`.
- Admin category: danh sach, tao/sua, tao nhanh danh muc cha, soft delete.
- Admin voucher: danh sach, tao/sua, chon ngay bang calendar, dieu kien su dung ro rang, active/inactive.
- Admin product: tao/sua san pham, variants, anh URL, gia, ton kho, trang thai.
- Admin notification: gui thong bao theo nhom nguoi dung.
- Admin review: loc, an/hien/xoa mem review.

## Cong Nghe

- Expo SDK 55
- React Native 0.83
- React 19
- Expo Router 6
- NativeWind 4
- TypeScript 5.9
- React Native WebView
- Leaflet (render trong WebView)

## Cai Dat

```bash
npm install
```

Tao file `.env` tu `.env.example`:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000
```

Luu y khi chon URL backend:

- Android Emulator co the dung `http://127.0.0.1:3000` neu da `adb reverse`.
- Thiet bi that phai dung IP LAN cua may chay backend, vi du `http://192.168.1.10:3000`.
- Sau khi doi `.env`, hay restart Expo.

## Chay App

```bash
npm run start
```

Sau do chon:

- `a` de mo Android Emulator
- quet QR neu chay tren thiet bi that

Script khac:

```bash
npm run android
npm run ios
npm run web
npm run lint
npx tsc --noEmit
```

## Backend Can Chay

Backend mac dinh chay tai:

```txt
http://localhost:3000
```

Chay backend tu thu muc `../Sello-Ecommerce-Backend`:

```bash
npm install
npm run start:dev
```

## Order Tracking Map

Frontend order tracking su dung dung bo 3 sau:

- Geocoder: Photon
- Router: OSRM
- Base map tiles: OpenStreetMap

Backend tra ve:

- `data.map.origin`
- `data.map.destination`
- `data.map.route.distanceMeters`
- `data.map.route.durationSeconds`
- `data.map.route.geometry.coordinates`

Frontend render:

- Leaflet map trong `WebView`
- OSM tiles lam nen map
- polyline tu `OSRM geometry.coordinates`
- marker shipper va diem giao

Neu OSM tile hoac CDN khong tai duoc, map co the khong hien thi day du tren emulator/thiet bi.

## Cap Nhat UI Gan Day

### Orders

- Card don hang hien ro ma don hang, ngay dat, tong tien va trang thai.
- Neu order chi co 1 san pham, card uu tien hien dung ten san pham va so luong da mua.
- Neu order co nhieu san pham, card hien list san pham kem so luong cu the thay vi chi hien `Don hang #...`.
- Nut hanh dong giu theo trang thai: huy don, theo doi don, mua lai.

### Addresses

- Khi xoa dia chi dang duoc su dung boi don hang, app hien thong bao tieng Viet than thien thay vi raw backend message.
- Vi du:
  `Khong the xoa dia chi nay vi dang duoc su dung trong mot don hang khac.`

### Tracking

- Co the pan va zoom map truc tiep trong man theo doi don hang.
- Route duoc ve bang Leaflet polyline de bam map dung khi di chuyen/zoom.

## Routing Chinh

- `/` splash/entry
- `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/otp`, `/auth/reset-password`
- `/main/home`, `/main/categories`, `/main/search`, `/main/product-list`, `/main/cart`, `/main/orders`, `/main/profile`
- `/main/notifications`
- `/main/order-detail`
- `/main/order-tracking`
- `/main/addresses`, `/main/address-form`
- `/product/detail`, `/product/reviews`, `/product/write-review`
- `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/reports`, `/admin/menu`
- `/admin/categories`, `/admin/category-form`
- `/admin/vouchers`, `/admin/voucher-form`
- `/admin/notifications`, `/admin/reviews`

## Cau Truc Thu Muc

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

## Phan Quyen Admin

UI admin khong hard-code theo role string. App doc `user.permissions` tu backend de an/hien action.

- Level 1: toan quyen, gom delete/soft-delete, system config, user role
- Level 2: create/update category, voucher, notification, review moderation; khong delete cac phan nhay cam
- Level 3: read-only cho cac man admin chinh

## Kiem Tra Chat Luong

```bash
npx tsc --noEmit
npm run lint
```

Khi lint toan repo bi chan boi loi cu khong lien quan, co the lint file da sua:

```bash
npx eslint app/main/\(order\)/order-tracking.tsx
npx eslint components/main/orders/customer-order-card.tsx
npx eslint app/main/\(address\)/addresses.tsx
```

## Troubleshooting

- Khong ket noi backend: kiem tra backend co chay cong `3000`, `.env` dung URL, thiet bi that dung IP LAN.
- Order tracking map khong hien thi: kiem tra emulator/thiet bi co truy cap duoc OSM tiles va CDN Leaflet hay khong.
- Xoa dia chi that bai: neu dia chi dang duoc su dung trong don hang, app se hien thong bao loi than thien.
- Android Emulator khong goi duoc `localhost`: dung ADB reverse hoac IP phu hop.

ADB reverse:

```powershell
& "C:\Users\hokha\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
```
