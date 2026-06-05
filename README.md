# Sello E-commerce Backend

Backend NestJS cho ứng dụng Sello E-commerce, sử dụng cơ sở dữ liệu MySQL và cơ chế xác thực JWT. API phục vụ đồng thời cho cả Customer App (Mobile App) và Admin App (Web Dashboard).

---

## 🚀 Tính Năng Chính

* **Xác thực & Bảo mật (Auth)**: Đăng ký, xác minh OTP qua Email, Đăng nhập, Đăng xuất, Quên mật khẩu, Đặt lại mật khẩu.
* **Đăng nhập Mạng xã hội**: Tích hợp Google OAuth2 và iCloud/Apple placeholder flow.
* **Phân quyền người dùng (RBAC)**: Phân quyền rõ ràng giữa `customer` (Khách hàng) và `admin` (Quản trị viên).
* **Cấp bậc Admin (Hierarchy)**: Quản trị viên phân thành 3 cấp (`admin_level` 1, 2, 3) với ma trận quyền hạn tương ứng.
* **Kiểm soát quyền chi tiết**: Quản lý API Admin thông qua decorator `@Permissions`.
* **Danh mục sản phẩm công khai**: Tìm kiếm & lọc sản phẩm nâng cao, xem chi tiết, đánh giá sản phẩm.
* **Quy trình mua hàng (Customer Flow)**: Giỏ hàng, kiểm tra đơn hàng, áp dụng mã giảm giá (voucher), đặt hàng, hủy đơn, gửi yêu cầu đổi trả (return request), theo dõi trạng thái đơn hàng.
* **Tài khoản cá nhân**: Quản lý hồ sơ, đổi mật khẩu, sổ địa chỉ nhận hàng, danh sách yêu thích, thông báo cá nhân, gửi phản hồi/hỗ trợ tới Admin.
* **Chat thời gian thực (Real-time Chat)**: Chat hỗ trợ trực tiếp giữa Khách hàng và Admin thông qua **Socket.IO** (room-based). Phân quyền chuyên biệt `chats:read` cho mọi cấp độ Admin.
* **Bản đồ theo dõi đơn hàng (Order Tracking)**: Tự động chuyển đổi địa chỉ khách hàng thành tọa độ địa lý (Geocoding) bằng Photon, tính toán khoảng cách và tuyến đường di chuyển bằng OSRM, hiển thị trực quan lộ trình của Shipper trên bản đồ Leaflet + OpenStreetMap ở thiết bị di động.
* **Quản trị hệ thống (Admin Panel)**: Thống kê doanh thu (Dashboard) với phân trang tùy chọn (Optional Pagination), quản lý danh sách người dùng, đơn hàng, sản phẩm, danh mục, mã giảm giá, phê duyệt đánh giá sản phẩm (moderation), duyệt yêu cầu đổi trả (approve/reject return) và gửi thông báo hệ thống.
* **Hỗ trợ Tiếng Việt**: Cấu hình MySQL hỗ trợ hoàn toàn UTF-8/UTF-8MB4 hiển thị tiếng Việt không lỗi font.

---

## 🛠️ Hướng Dẫn Cài Đặt

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Cấu hình môi trường (`.env`)
Tạo file `.env` tại thư mục gốc của dự án dựa trên file mẫu `.env.example`:

```env
PORT=3000
JWT_SECRET=sello-local-secret

# Cấu hình Cơ sở dữ liệu MySQL
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=Sello_commerce
MYSQL_CONNECTION_LIMIT=10
MYSQL_TIMEZONE=Z

# Cấu hình SMTP gửi OTP/Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
SMTP_FROM=Sello Ecommerce <your_email@gmail.com>

# Cấu hình Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
APP_AUTH_REDIRECT_URI=selloecommerce://auth/callback
```

### 3. Khởi động dự án
Chạy Backend ở chế độ Development (tự động reload khi code thay đổi):
```bash
npm run start:dev
```

API mặc định sẽ chạy tại:
```txt
http://localhost:3000
```

---

## 💻 Danh Sách Scripts Chạy Dự Án

* `npm run start` - Khởi động server bình thường.
* `npm run start:dev` - Khởi động server ở chế độ phát triển (watch mode).
* `npm run start:debug` - Khởi động server kèm debugger.
* `npm run start:prod` - Chạy dự án sau khi build thành sản phẩm.
* `npm run build` - Biên dịch dự án NestJS sang mã Javascript (`dist/`).
* `npm run lint` - Kiểm tra và sửa lỗi định dạng code (ESLint).
* `npm run test` - Chạy unit tests.
* `npm run test:e2e` - Chạy các kiểm thử end-to-end.

---

## 💾 Lưu Ý Về Cơ Sở Dữ Liệu

Dự án kết nối trực tiếp đến MySQL qua thư viện `mysql2/promise`. Khi ứng dụng khởi động, Database Service sẽ tự động kiểm tra kết nối và thực hiện tự động phục hồi, nâng cấp schema (Self-healing Migrations) cho các bảng nếu cần thiết:
* Bổ sung các cột tính năng mới (nếu chưa có):
  * `categories.description`
  * `notifications.image_url`
  * `product_reviews.moderation_status`
  * `product_reviews.moderated_by`
  * `product_reviews.moderated_at`
  * `product_reviews.moderation_note`
* Tự động điều chỉnh độ rộng cột (MODIFY COLUMN) an toàn bằng try-catch để ngăn chặn các lỗi cắt ngắn dữ liệu (Data Truncation Error):
  * `orders.order_status` nâng lên kiểu `VARCHAR(32)` để hỗ trợ đầy đủ trạng thái trả hàng `'return_requested'` (16 ký tự, vượt quá giới hạn ENUM cũ).
  * `order_status_histories.status` nâng lên kiểu `VARCHAR(32)` để đồng bộ hóa lịch sử trạng thái đơn hàng.

**Định dạng Tiếng Việt**: Connection pool được thiết lập với `charset: utf8mb4` và thực thi lệnh sql `SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci` ngay khi khởi tạo để hỗ trợ lưu và truy vấn tiếng Việt có dấu. 

### 🔄 Khôi Phục Dữ Liệu Demo (Database Seed Reset)
Khi phát triển hoặc kiểm thử, bạn có thể thiết lập lại toàn bộ dữ liệu sạch bằng script `reset_database.sql` ở thư mục gốc của dự án.
* **Hành vi**: Xóa sạch (Truncate) toàn bộ bảng dữ liệu và chèn lại dữ liệu mẫu bao gồm:
  * 4 danh mục và 5 thương hiệu mẫu.
  * **30 sản phẩm thực tế** được chọn lọc kĩ càng với tên sản phẩm rõ ràng và hình ảnh Unsplash sắc nét tương ứng cho từng loại.
  * Phương thức thanh toán đầy đủ (`COD`, `MOMO`, `CARD`, `PAYPAL`).
* **Thông tin tài khoản mặc định**:
  * Các tài khoản Khách hàng: `a@gmail.com`, `b@gmail.com`, `c@gmail.com` (mật khẩu: `12345678`).
  * Admin Cấp 1 (Quản trị viên tối cao): `admin@gmail.com` (mật khẩu: `12345678`).
  * Admin Cấp 2 (Quản lý vận hành): `admin2@gmail.com` (mật khẩu: `Admin12345`).
  * Admin Cấp 3 (Nhân viên hỗ trợ): `admin3@gmail.com` (mật khẩu: `Admin12345`).

Để reset database, chạy lệnh SQL trong script `reset_database.sql` vào MySQL client của bạn (nhớ cấu hình `USE Sello_commerce;`).

---

## ⏳ Bộ Tự Động Hủy Đơn Hàng & Hoàn Kho (Auto-Cancellation & Stock Recovery)

Hệ thống tích hợp một trình dọn dẹp chạy nền (Background Worker) phục vụ các đơn hàng thanh toán trực tuyến:
* **Thời gian quét**: Định kỳ mỗi **30 giây** (và quét ngay một lần khi server vừa khởi động).
* **Điều kiện hết hạn (TTL)**: Đơn hàng ở phương thức thanh toán trực tuyến (Mock/PayPal) mà giao dịch thanh toán vẫn giữ trạng thái `pending` quá **5 phút** kể từ thời điểm khởi tạo (`expiresAt`).
* **Hành vi tự động**:
  1. Đổi trạng thái thanh toán thành `failed` với lý do `'Payment timeout (expired)'`.
  2. Đổi trạng thái đơn hàng sang `cancelled`.
  3. Ghi nhận nhật ký trạng thái đơn hàng: `Order cancelled automatically due to payment timeout`.
  4. Duyệt qua từng chi tiết đơn hàng, tự động cộng ngược số lượng sản phẩm/biến thể mua trở lại kho (`stock_qty` trong `product_variants`) để đảm bảo không bị thất thoát hàng hóa của cửa hàng.

---

## 📡 Chi Tiết Endpoints API (HTTP)

### 🔓 API Công Khai (Public Endpoints)
```http
GET /                              # Kiểm tra trạng thái hoạt động (Health Check)
GET /home                          # Lấy dữ liệu trang chủ (Banner, sản phẩm nổi bật, danh mục)
GET /products/:productId           # Lấy thông tin chi tiết sản phẩm và các biến thể
GET /products/:productId/reviews   # Xem danh sách đánh giá sản phẩm (Chỉ hiển thị các đánh giá hợp lệ)
POST /auth/register                # Đăng ký tài khoản
POST /auth/verify-otp              # Xác minh mã OTP (khi đăng ký hoặc đặt lại mật khẩu)
POST /auth/login                   # Đăng nhập (Dùng chung cho cả Khách hàng và Admin)
POST /auth/forgot-password         # Yêu cầu gửi mã OTP để đổi mật khẩu mới
POST /auth/reset-password          # Xác nhận đổi mật khẩu mới bằng OTP
POST /auth/logout                  # Đăng xuất tài khoản
GET /auth/google                   # Cổng đăng nhập Google OAuth
GET /auth/icloud                   # Cổng đăng nhập Apple (Giả lập)
GET /payments/paypal/return         # Redirect URL từ PayPal sau khi khách hàng duyệt thanh toán
```

### 🔒 API Cho Khách Hàng (Customer Protected Endpoints)
*Yêu cầu gửi kèm Header `Authorization: Bearer <JWT_Token>`*

```http
GET /auth/me                       # Lấy thông tin tài khoản hiện tại
GET /cart                          # Xem giỏ hàng cá nhân
POST /cart/items                   # Thêm sản phẩm/biến thể vào giỏ hàng
PUT /cart/items/:cartItemId        # Cập nhật số lượng sản phẩm trong giỏ
PATCH /cart/items/:cartItemId/select # Chọn/bỏ chọn sản phẩm để thanh toán
DELETE /cart/items/:cartItemId     # Xóa sản phẩm khỏi giỏ hàng
GET /cart/summary                  # Tổng kết nhanh giỏ hàng (Số lượng, tổng tiền)
POST /checkout/preview             # Xem trước giá trị đơn hàng (Phí ship, thuế, giảm giá...)
POST /checkout/apply-voucher       # Áp dụng mã giảm giá vào đơn hàng
POST /orders                       # Tạo đơn hàng mới
GET /orders/me                     # Danh sách đơn hàng cá nhân
GET /orders/:orderId               # Chi tiết một đơn hàng cụ thể
POST /orders/:orderId/cancel       # Hủy đơn hàng (Chỉ áp dụng khi đơn ở trạng thái Pending hoặc Confirmed)
GET /orders/:orderId/tracking      # Lấy dữ liệu theo dõi tuyến đường vận chuyển (Shipper)
GET /payments/mock/:paymentId/status   # Lấy trạng thái thanh toán giả lập & thời gian hết hạn (expiresAt)
GET /payments/mock/:paymentId/confirm-page # Giao diện Sello Mock Bank
POST /payments/mock/:paymentId/confirm  # Xác nhận thanh toán từ trang ngân hàng giả lập
POST /payments/mock/:paymentId/decline  # Từ chối thanh toán từ trang ngân hàng giả lập
POST /payments/mock/:paymentId/callback # Callback giả lập thanh toán (Đã tắt - khuyến nghị Confirm/Decline)
POST /payments/paypal/capture           # Yêu cầu capture thanh toán PayPal chủ động từ phía Client
GET /me                            # Lấy thông tin cá nhân mở rộng
PUT /me                            # Cập nhật thông tin cá nhân
PUT /me/password                   # Đổi mật khẩu
POST /me/contact-admin             # Gửi thông điệp/yêu cầu hỗ trợ tới toàn bộ Admin
GET /addresses                     # Xem danh sách địa chỉ nhận hàng
POST /addresses                    # Thêm địa chỉ mới
PUT /addresses/:addressId          # Sửa thông tin địa chỉ
PATCH /addresses/:addressId/default # Thiết lập địa chỉ mặc định
DELETE /addresses/:addressId       # Xóa địa chỉ (Không xóa được nếu địa chỉ đã liên kết với đơn hàng cũ)
GET /notifications                 # Danh sách thông báo cá nhân
PATCH /notifications/:notificationId/read # Đánh dấu đã đọc một thông báo
PATCH /notifications/read-all      # Đánh dấu đã đọc tất cả thông báo
POST /wishlist/items               # Thêm sản phẩm vào danh sách yêu thích
GET /wishlist                      # Xem danh sách yêu thích
DELETE /wishlist/items/:wishlistItemId # Xóa sản phẩm khỏi danh sách yêu thích
POST /reviews                      # Viết đánh giá sản phẩm (Yêu cầu đã mua và đơn hàng ở trạng thái Delivered)
```

### 🔑 API Cho Quản Trị Viên (Admin Endpoints)
*Yêu cầu gửi kèm Header `Authorization: Bearer <JWT_Token>` và tài khoản có role `admin`.*

```http
GET /auth/admin/ping               # Kiểm tra quyền Admin chung
GET /auth/admin/operations/ping    # Kiểm tra quyền Admin điều hành
DELETE /auth/users/:userId         # Xóa tài khoản người dùng khỏi hệ thống

# Dashboard & Cấu hình hệ thống
GET /admin/system/dashboard        # Lấy số liệu thống kê tổng quan (Doanh thu, đơn hàng, khách hàng)
PUT /admin/system/config           # Cập nhật cấu hình hệ thống toàn cục

# Quản lý người dùng
GET /admin/users                   # Danh sách người dùng hệ thống
GET /admin/users/:userId           # Chi tiết thông tin người dùng
PATCH /admin/users/:userId/status  # Khóa hoặc mở khóa tài khoản người dùng
PATCH /admin/users/:userId/role    # Thay đổi quyền hạn/vai trò người dùng

# Quản lý đơn hàng
GET /admin/orders                  # Danh sách toàn bộ đơn hàng
GET /admin/orders/:orderId         # Chi tiết đơn hàng của khách hàng
PATCH /admin/orders/:orderId/status # Cập nhật trạng thái đơn hàng (Confirmed, Shipped, Delivered...)

# Quản lý sản phẩm
GET /admin/products                # Danh sách sản phẩm
POST /admin/products               # Tạo sản phẩm mới
GET /admin/products/:productId     # Xem thông tin chi tiết sản phẩm
PUT /admin/products/:productId     # Sửa đổi thông tin sản phẩm
PATCH /admin/products/:productId/status # Bật/tắt trạng thái hiển thị của sản phẩm

# Quản lý danh mục
GET /admin/categories              # Danh sách danh mục sản phẩm
POST /admin/categories             # Tạo danh mục mới
PUT /admin/categories/:categoryId  # Sửa đổi danh mục
PATCH /admin/categories/:categoryId/status # Kích hoạt hoặc ẩn danh mục
DELETE /admin/categories/:categoryId # Xóa danh mục (Soft-delete ẩn danh mục)

# Quản lý mã giảm giá
GET /admin/vouchers                # Danh sách các mã giảm giá
POST /admin/vouchers               # Tạo mã giảm giá mới
PUT /admin/vouchers/:voucherId     # Sửa thông tin mã giảm giá
PATCH /admin/vouchers/:voucherId/status # Kích hoạt hoặc hủy kích hoạt mã giảm giá
DELETE /admin/vouchers/:voucherId   # Xóa mã giảm giá (Soft-delete)

# Gửi thông báo hệ thống
GET /admin/notifications           # Lịch sử các thông báo hệ thống đã gửi
POST /admin/notifications          # Gửi thông báo mới tới người dùng (Hỗ trợ lọc theo đối tượng nhận)

# Kiểm duyệt đánh giá sản phẩm
GET /admin/reviews                 # Xem toàn bộ đánh giá của khách hàng
PATCH /admin/reviews/:reviewId/moderation # Kiểm duyệt ẩn/hiển thị đánh giá

# Báo cáo & Xuất file
GET /admin/reports/overview        # Lấy báo cáo chi tiết theo thời gian
POST /admin/reports/export         # Xuất báo cáo dạng file lưu vào thư mục exports/
```

---

## 💬 Real-time Chat Socket (Socket.IO)

Ứng dụng cung cấp cổng kết nối WebSocket thời gian thực thông qua công nghệ **Socket.IO** để xử lý tính năng chat trực tiếp giữa Khách hàng và Admin.

* **URL kết nối**: `http://localhost:3000` (Socket.IO protocol)
* **Namespace/Path mặc định**: `/socket.io/`

### 📤 Các sự kiện Khách hàng/Admin gửi lên (Publish Events)

#### 1. Sự kiện `joinRoom`
Đăng ký kết nối vào phòng chat cụ thể (mỗi khách hàng có một phòng chat riêng tương ứng).
* **Dữ liệu gửi lên (Payload)**: `roomId` (Số nguyên dương - ID của phòng chat).
* **Phản hồi từ Server (Acknowledgement)**:
  ```json
  {
    "status": "joined",
    "roomId": 1
  }
  ```

#### 2. Sự kiện `sendMessage`
Gửi tin nhắn mới vào phòng chat. Tin nhắn sẽ được tự động lưu vào database trước khi phát tới các thành viên khác trong phòng.
* **Dữ liệu gửi lên (Payload)**:
  ```json
  {
    "roomId": 1,
    "senderId": 5,
    "senderType": "customer", // hoặc "admin"
    "content": "Tôi cần hỗ trợ kỹ thuật!"
  }
  ```
* **Phản hồi từ Server (Acknowledgement)**: Trả về đối tượng tin nhắn đã được lưu trữ thành công trong DB (chứa `message_id`, `created_at`,...).

#### 3. Sự kiện `markAsRead`
Đánh dấu toàn bộ tin nhắn từ phía đối phương trong phòng chat hiện tại là đã đọc.
* **Dữ liệu gửi lên (Payload)**:
  ```json
  {
    "roomId": 1,
    "readerType": "admin" // hoặc "customer"
  }
  ```
* **Phản hồi từ Server (Acknowledgement)**: `{"status": "read", "roomId": 1}`.

### 📥 Các sự kiện Lắng nghe từ Server (Listen Events)

Để nhận dữ liệu thời gian thực, phía Client cần lắng nghe các sự kiện sau:
* **`newMessage`**: Kích hoạt khi có tin nhắn mới được gửi vào phòng chat. Trả về đối tượng chi tiết của tin nhắn.
* **`messagesRead`**: Kích hoạt khi đối phương đã mở phòng chat và đọc tin nhắn. Trả về `{ roomId, readerType }`.

---

## 🔒 Phân Quyền & Bảo Mật

Sau khi đăng nhập thành công qua `POST /auth/login`, Client sẽ nhận được một đối tượng chứa `accessToken`, `refreshToken`, `role`, `adminLevel` và danh sách `permissions` cụ thể.

### 📊 Ma Trận Quyền Hạn Admin

| Chức năng | Cấp 1 (Level 1 - Admin Tổng) | Cấp 2 (Level 2 - Admin Vận Hành) | Cấp 3 (Level 3 - Nhân Viên) |
|---|:---:|:---:|:---:|
| Thống kê Dashboard | Có | Có | Có |
| Thay đổi Cấu hình hệ thống | Có | Không | Không |
| Đọc thông tin User | Có | Có | Có |
| Cập nhật Trạng thái User (Khóa/Mở) | Có | Có | Không |
| Nâng cấp Quyền User (Role) | Có | Không | Không |
| Đọc & Cập nhật Đơn hàng | Có | Có | Có |
| Xem Sản phẩm | Có | Có | Có |
| Thêm/Sửa/Ẩn Sản phẩm | Có | Có | Không |
| Xem Danh mục sản phẩm | Có | Có | Có |
| Thêm/Sửa/Ẩn Danh mục | Có | Có | Không |
| Xóa vĩnh viễn Danh mục | Có | Không | Không |
| Xem & Quản lý Mã giảm giá (Vouchers) | Có | Có | Xem (Có), Sửa/Ẩn (Không) |
| Xóa vĩnh viễn Vouchers | Có | Không | Không |
| Đọc & Tạo thông báo hệ thống | Có | Có | Xem (Có), Tạo mới (Không) |
| Kiểm duyệt đánh giá (Reviews) | Có | Có | Xem (Có), Phê duyệt (Không) |
| Xem Báo cáo & Xuất dữ liệu | Đầy đủ quyền | Chỉ xem báo cáo, không được xuất file | Chỉ xem báo cáo, không được xuất file |

---

## 📝 Nhật Ký Hoạt Động (User Action Logs)

Tất cả hoạt động của người dùng đã được xác thực đều được ghi nhận tự động thông qua một Global Interceptor và xuất ra console phục vụ giám sát hệ thống. Nhật ký bao gồm danh tính người dùng, hành động, API được gọi, mã trạng thái trả về và thời gian xử lý.
*(Thông tin nhạy cảm như nội dung mật khẩu và mã token sẽ tự động bị bỏ qua).*

**Ví dụ log hoạt động:**
```txt
[UserAction] userId=1 role=customer email=a@gmail.com action="view_order_tracking" method=GET path=/orders/12/tracking status=200 durationMs=184
[AuthService] userId=1 role=customer email=a@gmail.com action="login_success"
```

---

## 💳 Quy Trình Thanh Toán Giả Lập (Mock Payment QR Flow)

Hệ thống hỗ trợ quy trình thanh toán giả lập thông qua mã QR để phục vụ môi trường phát triển và kiểm thử mà không mất phí dịch vụ thực tế.

1. **Khởi tạo thanh toán**: Khi khách hàng tạo đơn hàng chọn phương thức thanh toán không phải COD (Thanh toán trực tuyến), Server tạo một mã thanh toán đính kèm token xác thực duy nhất.
2. **Trả về mã QR**: Server trả về dữ liệu chứa mã QR liên kết đến trang web giả lập ngân hàng của Sello:
   ```json
   {
     "paymentUrl": "http://<IP_LAN>:3000/payments/mock/456/confirm-page?token=...",
     "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=..."
   }
   ```
3. **Xác nhận thanh toán**: Khách hàng quét mã QR hoặc truy cập đường dẫn `paymentUrl` để mở giao diện **Sello Mock Bank**. Tại đây có 2 lựa chọn: **Xác nhận thanh toán** hoặc **Từ chối giao dịch**.
4. **Cập nhật trạng thái**: Khi chọn "Xác nhận thanh toán", trang ngân hàng giả lập sẽ kích hoạt callback cập nhật trạng thái đơn hàng thành `paid` và đổi trạng thái vận chuyển sang `confirmed` trên server.

> [!NOTE]  
> Khi chạy ứng dụng trên thiết bị di động thật và backend chạy trên máy tính cá nhân, bạn phải đảm bảo cấu hình địa chỉ IP LAN của máy tính vào biến môi trường `MOCK_PAYMENT_PUBLIC_BASE_URL` trong file `.env` để điện thoại có thể truy cập được trang web ngân hàng giả lập.

---

## 💳 Quy Trình Thanh Toán PayPal (PayPal Payment Flow)

Hệ thống hỗ trợ cổng thanh toán quốc tế PayPal tích hợp đầy đủ quy trình xử lý đơn hàng trực tuyến an toàn.

1. **Khởi tạo đơn hàng**: Khi khách hàng chọn hình thức thanh toán PayPal lúc đặt hàng (`POST /orders`), Backend sẽ gọi API PayPal Sandbox để tạo Order PayPal tương ứng.
2. **Trả về đường link duyệt**: API trả về link thanh toán `paymentUrl` (chứa PayPal Approval Link dạng `https://www.sandbox.paypal.com/checkoutnow?token=EC-XXXXX`).
3. **Thanh toán trên Web**: Khách hàng được dẫn hướng qua trình duyệt Web hoặc WebView để đăng nhập và duyệt giao dịch trên PayPal.
4. **Xử lý Redirect an toàn (Cross-Device Return)**: Sau khi được duyệt, PayPal sẽ redirect trình duyệt của người dùng về backend:
   ```txt
   GET /payments/paypal/return?token=EC-XXXXX
   ```
   * **Đặc thù**: Để tối ưu hóa trải nghiệm người dùng trên các thiết bị di động khác nhau (hoặc các trình duyệt bên thứ ba như Safari/Chrome) mà không phá vỡ luồng WebView, endpoint này sẽ **không tự động thực hiện javascript redirect** về ứng dụng. Thay vào đó, nó hiển thị trang tĩnh thông báo thanh toán thành công/thất bại kèm một nút bấm to, trực quan chứa Custom URI Scheme:
     ```txt
     selloecommerce://checkout/paypal/success?token=EC-XXXXX
     ```
     Khi người dùng click nút này, thiết bị di động sẽ tự động kích hoạt Expo App / App Native để tiếp nhận kết quả thanh toán.
5. **Capture giao dịch**: Mobile App hoặc Client có thể chủ động gọi API `POST /payments/paypal/capture` kèm theo `paymentId` và `paypalOrderId` để hoàn thành capture thanh toán trên Sandbox và đồng bộ trạng thái đơn hàng thành `paid`.

---

## 🗺️ Theo Dõi Đơn Hàng & Bản Đồ (Order Tracking Map)

Khi thiết bị gọi API lấy thông tin vận chuyển đơn hàng (`GET /orders/:orderId/tracking`), hệ thống sẽ trả về tuyến đường di chuyển thực tế từ vị trí người giao hàng đến địa chỉ nhận.

* **Bộ phân giải địa chỉ (Geocoder)**: Hệ thống sử dụng dịch vụ miễn phí **Photon** (`https://photon.komoot.io`) để tìm tọa độ (Vĩ độ - Latitude & Kinh độ - Longitude) từ chuỗi địa chỉ văn bản của khách hàng trong trường hợp địa chỉ đó chưa được lưu tọa độ sẵn.
* **Bộ tính toán lộ trình (Routing)**: Sử dụng **OSRM** (`https://router.project-osrm.org`) để tính toán tuyến đường đi ngắn nhất, thời gian di chuyển dự kiến và khoảng cách thực tế dựa trên dữ liệu giao thông thực.
* **Tuyến đường dự phòng (Fallback Route)**: Nếu một trong các dịch vụ bản đồ công cộng ở trên gặp sự cố hoặc không thể truy cập, API vẫn sẽ hoạt động bình thường bằng cách tự động vẽ một đường thẳng nối trực tiếp từ vị trí Shipper đến địa chỉ khách hàng kèm nhãn nhà cung cấp là `fallback`.

---

## 📱 Kết Nối Thiết Bị Di Động & Android Emulator

Khi chạy ứng dụng Mobile trên Android Emulator và muốn kết nối đến Backend chạy local ở máy tính của bạn, bạn có thể thực hiện ánh xạ cổng kết nối (Port Forwarding) bằng công cụ ADB thông qua các lệnh PowerShell sau:

```powershell
# Xem danh sách thiết bị/máy ảo đang kết nối
& "C:\Users\hokha\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices

# Thực hiện chuyển tiếp cổng 3000 từ máy ảo Android về máy tính
& "C:\Users\hokha\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000

# Xem danh sách các cổng chuyển tiếp đang hoạt động
& "C:\Users\hokha\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse --list

# Xóa cổng chuyển tiếp
& "C:\Users\hokha\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse --remove tcp:3000
```

---

## 🧪 Hướng Dẫn Sử Dụng Postman Để Test Dự Án

File Collection Postman đính kèm dự án: [Sello-Auth.postman_collection.json](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce-Backend/Sello-Auth.postman_collection.json).

### 1. Chu kỳ Test luồng mua hàng thông thường
1. Chạy API **Login Customer** để lưu token.
2. Gọi **Create Address** để tạo một địa chỉ nhận hàng hợp lệ.
3. Gọi **Add Cart Item** để thêm sản phẩm cần mua vào giỏ hàng.
4. Gọi **Select Cart Item** để chọn sản phẩm chuẩn bị checkout.
5. Gọi **Checkout Preview** để kiểm tra tổng số tiền trước khi mua.
6. Gọi **Create Order** để tạo đơn hàng.
7. Mở liên kết thanh toán thu được hoặc chạy **Confirm Mock Bank Payment** để thanh toán.
8. Gọi các API **Get My Orders**, **Get Order Detail** để kiểm tra lại trạng thái đơn hàng.

### 2. Chu kỳ Test Chat thời gian thực (Socket.IO)
Để kiểm tra tính năng Chat, bạn thực hiện qua Postman theo các bước sau:
1. Tạo Request mới trong Postman, chọn định dạng giao thức là **Socket.IO**.
2. Kết nối tới địa chỉ `http://localhost:3000`.
3. Tại tab **Listeners**, cấu hình lắng nghe sự kiện `newMessage`.
4. Tại tab **Publish**, gửi sự kiện `joinRoom` với nội dung là ID phòng chat của bạn (ví dụ: `3`) để tham gia phòng chat.
5. Gửi sự kiện `sendMessage` bằng duy nhất 1 đối số (Arg 1) dưới định dạng JSON:
   ```json
   {
     "roomId": 3,
     "senderId": 5,
     "senderType": "customer",
     "content": "Xin chào, tôi cần hỗ trợ!"
   }
   ```
   *Lưu ý: `roomId` và `senderId` phải là các ID thực tế tồn tại trong cơ sở dữ liệu và thuộc quyền sở hữu của bạn để tránh lỗi xác thực từ máy chủ.*
