# Sello E-commerce Mobile App

Ung dung mobile frontend cho Sello E-commerce, xay dung bang Expo, React Native, Expo Router, NativeWind va TypeScript. App dang ket noi backend that cho cac luong auth, cart, checkout, orders, profile, address, wishlist, notification va admin.

## Tinh Nang Chinh

- Auth: dang ky, dang nhap, OTP, quen mat khau, reset mat khau, luu phien bang auth context, ghi nho/luu thong tin dang nhap tu dong (AsyncStorage). Tích hợp thông báo chào mừng khi đăng nhập thành công.
- Customer: home, category, search, product list/detail, cart, checkout, orders, profile, address, wishlist, notification, review. Hoạt động tương tác mượt mà với banner khuyến mãi có thể nhấn mở danh sách sản phẩm, các hiệu ứng tap scale animation sống động (0.94 - 0.98) cho tất cả thẻ sản phẩm gợi ý và danh mục nổi bật.
- Flash Sale Shopee: Giao diện Flash Sale cực đẹp chuẩn phong cách Shopee với tông màu cam đỏ rực rỡ, đồng hồ đếm ngược đen đặc trưng phân tách bằng dấu hai chấm đỏ, các thẻ sản phẩm Flash Sale hỗ trợ tap scale hoạt ảnh mượt mà dẫn tới trang chi tiết, thanh tiến trình "Đang bán chạy" / "Sắp cháy hàng" được tính toán trực quan.
- Local Notifications: Tiện ích thông báo cục bộ `triggerLocalNotification` thông minh tương thích cả Expo Go (sử dụng fallback Alert) và native builds (sử dụng expo-notifications), tự động kích hoạt thông báo đẩy trên thiết bị khi Đăng nhập thành công, Thêm vào giỏ hàng thành công, Thay đổi danh sách yêu thích, Thêm/sửa địa chỉ mới, Đặt địa chỉ mặc định, Tạo đơn hàng thành công, và Gửi đánh giá sản phẩm thành công.
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
- Shopify FlashList v2.x (Tái sử dụng view cuộn hiệu năng cao)
- Expo Image (Lưu đệm và kết xuất ảnh mượt mà)

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

### Tối Ưu Hóa Hiệu Năng Mobile (Mới nhất)

- **Shopify FlashList**: Refactor màn hình danh sách sản phẩm (`app/main/(catalog)/product-list.tsx`) sử dụng `<FlashList>` v2.x với tính năng tự động tính toán kích thước phần tử và tái sử dụng view (recycling) thay cho `ScrollView` truyền thống, giúp cuộn mượt mà không bị giật lag.
- **Expo Image**: Thay thế component `Image` của React Native bằng `expo-image` trên các component cuộn chính (suggested-product-card, flash-sales-section, home-promo-banner, cart-item-card, product-list-card) để tối ưu bộ nhớ đệm ảnh và giảm chi phí xử lý luồng giao diện.
- **Giải phóng tài nguyên WebView Leaflet**: Điều chỉnh cơ chế mount bản đồ trong form địa chỉ (`components/main/address/address-form.tsx`). WebView bản đồ chỉ được khởi tạo khi modal hiển thị và tự động hủy bỏ hoàn toàn khi đóng modal, tránh tình trạng rò rỉ tài nguyên nền.

### Dang Nhap & Dia Chi (Bản trước)

- **Ghi nho dang nhap tu dong (Remember Login)**: Bo sung checkbox "Ghi nho dang nhap" vao form dang nhap. Khi duoc kich hoat, thong tin dang nhap (Email/Sdt va mat khau) se duoc luu tru an toan bang `AsyncStorage` de tu dong dien (autofill) o cac lan dang nhap tiep theo.
- **Ban do OpenStreetMap qua Leaflet WebView**: Thay the ban do native bang `<WebView>` render Leaflet, hien thi chi tiet, muot ma 100% tren ca Android va iOS ma khong can bat ky Google Maps API Key nao. Dong thoi tich hop tim kiem dia diem Photon co tinh nang tu dong goi y thoi gian thuc (Debounced 600ms) va uu tien vi tri gan nguoi dung (Location bias).
- **Tu dong cap nhat danh sach dia chi (Focus refetch)**: Tich hop hook `useFocusEffect` cua `expo-router` de tu dong tai lai danh sach dia chi moi nhat ngay khi nguoi dung quay ve tu form tao/sua dia chi.

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
