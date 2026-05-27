# Sello E-commerce Mobile App

Ung dung mobile frontend cho Sello E-commerce, xay dung bang Expo, React Native, Expo Router, NativeWind va TypeScript. App dang ket noi backend that cho cac luong auth, cart, checkout, orders, profile, address, wishlist, notification va admin.

## Tinh Nang Chinh

- Auth: dang ky, dang nhap, OTP, quen mat khau, reset mat khau, luu phien bang auth context.
- Customer: home, category, search, product list/detail, cart, checkout, orders, profile, address, wishlist, notification, review.
- Chat thoi gian thuc: Khach hang lien he ho tro truc tiep va Admin (tat ca level co quyen `chats:read`) doc, reply tin nhan qua Socket.IO va REST API.
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

### Orders & Tracking (Khach hang)

- **Dong bo anh san pham thuc te**: Cac item trong gio hang, chi tiet don hang, va danh sach don hang duoc dong bo lay hinh anh dai dien chinh xac tu backend.
- **Bo cuc danh sach don hang**: Card don hang hien dung anh san pham, ten san pham, phan loai khi mua 1 mon. Neu mua nhieu mon, card hien danh sach liet ke chu dong (san pham A x2, san pham B x1) kem theo badge tong so mon và anh cua san pham dau tien, dat chuan UX giong Shopee.
- Nut hanh dong giu theo trang thai: huy don, theo doi don, mua lai.

### Admin Orders Management (Quan ly don hang Admin kieu Shopee)

- **Thanh trang thai Shopee (Status Tabs)**: Bo loc phia tren duoc chia thanh 7 nhom trang thai bang Tieng Viet (Tất cả, Chờ xác nhận, Chờ lấy hàng, Đang giao, Đã giao, Đã hủy, Trả hàng/Hoàn tiền) kem theo **so luong don hang thuc te cua tung trang thai** hien thi dang badge chu so dong thoi gian thuc.
- **Order Cards cao cap**: Redesign tu dang table chu sang the Card bo tron cao cap. Card hien thi day du ma don, thong tin khach, ngay dat, tong tien, va danh sach cac mat hang da dat kem theo hinh anh thuc te của tung san pham.
- **Nut thao tac nhanh mot cham (Quick Actions)**: Tich hop cac nut dieu chinh nhanh trang thai don hang truc tiep tren moi Card giup Admin xu ly sieu toc ma khong can click vao xem chi tiet:
  - *Cho xac nhan* -> Nut **Xác nhận đơn** (chuyen sang `confirmed`)
  - *Da xac nhan* -> Nut **Gói hàng xong** (chuyen sang `packed`)
  - *Da dong goi* -> Nut **Giao vận chuyển** (chuyen sang `shipping`)
  - *Dang giao* -> Nut **Đã giao xong** (chuyen sang `delivered`)
- Giao dien co phan trang muot ma, loc va tim kiem thong minh theo ID don, ten hoac email khach hang.

## Routing Chinh

- `/` splash/entry
- `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/otp`, `/auth/reset-password`
- `/main/home`, `/main/categories`, `/main/search`, `/main/product-list`, `/main/cart`, `/main/orders`, `/main/chat`, `/main/profile`
- `/main/notifications`
- `/main/order-detail`
- `/main/order-tracking`
- `/main/addresses`, `/main/address-form`
- `/product/detail`, `/product/reviews`, `/product/write-review`
- `/admin/dashboard`, `/admin/products`, `/admin/chats`, `/admin/orders`, `/admin/reports`, `/admin/menu`
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
