# Nhật Ký Thay Đổi Dự Án (CHANGELOG)

Tài liệu này ghi nhận toàn bộ các tính năng cốt lõi vừa được bổ sung và cập nhật vào dự án **Sello E-commerce Backend**. Các thay đổi này được thiết kế để nâng cấp tính năng của hệ thống nhưng vẫn bảo toàn tương thích ngược 100% với Frontend cũ đã kết nối trước đó.

---

## 📅 Bản Cập Nhật Mới Nhất: Loại Bỏ Admin Khỏi Danh Sách Nhận Thông Báo Của Admin

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[src/auth/services/mysql-database.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-Ecommerce-Backend/src/auth/services/mysql-database.service.ts)**
*   **Thay đổi**:
    *   **Loại bỏ Admin khỏi danh sách nhận thông báo của Admin**: Cập nhật phương thức `createAdminNotification` để loại bỏ hoàn toàn các tài khoản Admin ra khỏi việc gán/nhận thông báo do Admin tạo ra. Khi `targetScope` là `'all_users'` hoặc `'customer_only'`, câu lệnh SQL chỉ truy vấn và tạo thông báo cho những tài khoản có `role = 'customer'` (bỏ qua `role = 'admin'`). Khi `targetScope` là `'admin_only'`, hệ thống trả về số lượng bản ghi chèn là 0 và không thêm bất kỳ dòng nào vào cơ sở dữ liệu (ngăn chặn việc Admin gửi thông báo cho chính mình hoặc các Admin khác).
    *   **Sửa lỗi cắt ngắn dữ liệu trạng thái đơn hàng (order_status truncation bug)**: Bổ sung phương thức tự động phục hồi schema `ensureOrderStatusSchema` chạy ngay khi khởi động kết nối cơ sở dữ liệu (`checkConnection()`). Lần lượt thực thi các câu lệnh `ALTER TABLE orders MODIFY COLUMN order_status VARCHAR(32) NOT NULL DEFAULT 'pending'` và `ALTER TABLE order_status_histories MODIFY COLUMN status VARCHAR(32) NOT NULL` bọc trong try-catch an toàn. Điều này giải quyết triệt để lỗi MySQL `WARN_DATA_TRUNCATED: Data truncated for column 'order_status'` khi khách hàng thực hiện yêu cầu trả hàng (`'return_requested'`), giúp hệ thống lưu trữ trạng thái mới trơn tru 100%.

---

## 📅 Bản Cập Nhật Trước (Chức Năng Cốt Lõi)

### 1. 🔍 API Tìm Kiếm & Bộ Lọc Sản Phẩm Nâng Cao

Hệ thống đã bổ sung một API công khai mới hoàn toàn cho phép tìm kiếm và lọc sản phẩm linh hoạt để phục vụ cho trang tìm kiếm/danh mục sản phẩm trên Frontend.

* **Endpoint**: `GET /products`
* **Query Parameters (Tùy chọn)**:
  * `search` (string): Tìm kiếm từ khóa theo tên hoặc mô tả sản phẩm (Ví dụ: `?search=Samsung`).
  * `categoryId` (number): Lọc sản phẩm thuộc danh mục cụ thể (Ví dụ: `?categoryId=2`).
  * `brandId` (number): Lọc sản phẩm theo thương hiệu (Ví dụ: `?brandId=1`).
  * `minPrice` (number): Khoảng giá tối thiểu (Ví dụ: `?minPrice=100000`).
  * `maxPrice` (number): Khoảng giá tối đa (Ví dụ: `?maxPrice=500000`).
  * `sortBy` (string): Sắp xếp sản phẩm theo các tiêu chí:
    * `newest` (Mặc định): Mới nhất trước.
    * `price_asc`: Giá tăng dần.
    * `price_desc`: Giá giảm dần.
    * `popularity`: Phổ biến nhất (Dựa trên xếp hạng đánh giá trung bình `avg_rating`).
  * `page` (number): Trang muốn lấy (Ví dụ: `?page=1`).
  * `limit` (number): Số sản phẩm trên một trang (Ví dụ: `?limit=10`).

---

### 📄 2. Cơ Chế Phân Trang Tùy Chọn Tương Thích Ngược (Optional Pagination)

Để giúp hệ thống tải mượt mà hơn khi dữ liệu phình to, cơ chế phân trang đã được tích hợp vào các API danh sách chính. **Đặc biệt: Cơ chế này không gây lỗi (break) cho Frontend cũ**.

* **Các API được nâng cấp**:
  * `GET /orders/me` (Khách hàng xem đơn hàng cá nhân)
  * `GET /admin/users` (Admin xem danh sách User)
  * `GET /admin/orders` (Admin xem danh sách Đơn hàng)
  * `GET /admin/products` (Admin xem danh sách Sản phẩm)
* **Nguyên tắc tương thích ngược**:
  * **Trường hợp 1 (Không truyền tham số phân trang)**:
    Nếu Frontend gọi API theo cách cũ (Ví dụ: `GET /orders/me` không có query string) $\rightarrow$ Server **vẫn trả về một mảng phẳng trực tiếp** `[...]` giống như trước. Code xử lý của Frontend sẽ hoạt động 100% bình thường.
  * **Trường hợp 2 (Có truyền tham số phân trang)**:
    Nếu Frontend truyền kèm `page` và `limit` (Ví dụ: `GET /orders/me?page=1&limit=5`) $\rightarrow$ Server sẽ tự động kích hoạt phân trang và trả về cấu trúc đối tượng bọc có chứa metadata phân trang:
    ```json
    {
      "message": "Orders fetched successfully",
      "data": {
        "items": [ ... ],
        "meta": {
          "total": 25,
          "page": 1,
          "limit": 5,
          "totalPages": 5
        }
      }
    }
    ```

---

### 🔄 3. Quy Trình Đổi Trả & Hoàn Tiền (Returns & Refunds Flow)

Đã bổ sung đầy đủ quy trình yêu cầu đổi trả hàng từ phía Khách hàng và phê duyệt đổi trả từ phía Quản trị viên (Admin).

#### A. Trạng Thái Đơn Hàng mới được bổ sung
* `return_requested` (Yêu cầu trả hàng): Khách hàng gửi yêu cầu đổi trả sau khi nhận hàng.
* `returned` (Đã trả hàng): Admin chấp thuận yêu cầu đổi trả và nhận lại hàng thành công.
* `refunded` (Trạng thái thanh toán mới): Cập nhật trạng thái thanh toán của đơn hàng sang đã hoàn tiền nếu trước đó đã thanh toán online.

#### B. API Khách Hàng gửi yêu cầu đổi trả
* **Endpoint**: `POST /orders/:orderId/return-request`
* **Quyền truy cập**: Yêu cầu Token khách hàng sở hữu đơn hàng.
* **Điều kiện**: Đơn hàng phải có trạng thái hiện tại là `delivered` (Đã giao hàng thành công).
* **Body Request**:
  ```json
  {
    "reason": "Sản phẩm bị nứt vỡ trong quá trình vận chuyển"
  }
  ```
* **Kết quả**: Cập nhật trạng thái đơn hàng sang `return_requested` và ghi lịch sử lý do yêu cầu trả hàng.

#### C. API Admin xử lý yêu cầu đổi trả
* **Endpoint**: `PATCH /admin/orders/:orderId/return-status`
* **Quyền truy cập**: Token quản trị viên (yêu cầu quyền `orders:update`).
* **Body Request**:
  ```json
  {
    "action": "approve", // hoặc "reject"
    "description": "Đồng ý nhận lại hàng và hoàn tiền"
  }
  ```
* **Kết quả**:
  * Nếu chọn `approve`: Đơn hàng chuyển sang trạng thái `returned`, trạng thái thanh toán chuyển sang `refunded` (nếu đơn đã được thanh toán), và gửi thông báo hệ thống tự động tới khách hàng báo tin vui.
  * Nếu chọn `reject`: Đơn hàng quay về trạng thái `delivered` (Không chấp thuận đổi trả) kèm ghi chú lý do từ chối.

---

### 💬 4. Phân Quyền Chat Chuyên Biệt Cho Admin (`chats:read`)

Để xây dựng tính năng chat tập trung tương tự Shopee (tất cả các cấp độ nhân viên/quản trị viên đều có thể xem và phản hồi khách hàng):

* **Tách biệt quyền hạn**: Đã loại bỏ việc tái sử dụng quyền đọc thông tin người dùng (`users:read`) cho việc quản lý chat. Thay vào đó, một quyền hạn mới chuyên biệt là `'chats:read'` đã được định nghĩa.
* **Cấp quyền cho toàn bộ Admin**: Quyền `'chats:read'` đã được gán trực tiếp cho **toàn bộ 3 cấp độ Admin** (Level 1, Level 2, và Level 3) tại Database Service.
* **Cập nhật Endpoint API**:
  * API lấy danh sách phòng chat của khách hàng gửi tới admin (`GET /chat/admin-rooms`) hiện được bảo vệ bằng `@Permissions('chats:read')`.
  * Thay đổi này cho phép mọi Admin, dù thuộc cấp bậc nào, đều có quyền theo dõi và tham gia vào cuộc hội thoại hỗ trợ khách hàng.

