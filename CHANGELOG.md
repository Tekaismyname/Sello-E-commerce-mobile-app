# 📝 Nhật Ký Thay Đổi Chi Tiết (CHANGELOG) - Sello Mobile App

Tài liệu này ghi nhận chi tiết danh sách tất cả các file được chỉnh sửa/thêm mới trong dự án **Sello E-commerce Mobile App (Frontend)** cùng với nội dung thay đổi cụ thể trong từng file.

---

## 📅 Bản Cập Nhật Mới Nhất: Đồng Bộ Ảnh Đơn Hàng & Giao Diện Quản Lý Đơn Hàng Admin Kiểu Shopee

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[types/admin.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/types/admin.ts)**
*   **Thay đổi**: Cập nhật kiểu dữ liệu `AdminOrder` để đính kèm thêm trường `productImage` vào kiểu dữ liệu các mặt hàng (`items`) của đơn hàng.

#### 2. **[services/admin.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/admin.service.ts)**
*   **Thay đổi**: Cập nhật hàm `mapOrder` của Admin để tự động ánh xạ trường `productImage` từ API Backend vào cấu trúc dữ liệu Frontend.

#### 3. **[services/customer.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/customer.service.ts)**
*   **Thay đổi**: Cập nhật hàm `mapOrderItem` của khách hàng để bổ sung thuộc tính `productImage`, phục vụ việc hiển thị hình ảnh đại diện của sản phẩm thực tế trong đơn hàng.

#### 4. **[hooks/admin/use-admin-orders-view.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/hooks/admin/use-admin-orders-view.ts)**
*   **Thay đổi**:
    *   Mở rộng kiểu bộ lọc `AdminOrderFilter` từ 3 trạng thái lên **7 nhóm trạng thái Shopee** đầy đủ bao gồm: `all`, `pending` (Chờ xác nhận & Đã xác nhận), `packed` (Chờ lấy hàng), `shipping` (Đang giao), `delivered` (Đã giao), `cancelled` (Đã hủy), và `return` (Trả hàng/Hoàn tiền).
    *   Tính toán đếm số lượng đơn hàng tự động cho mỗi trạng thái thông qua `counts` map trong `metrics` useMemo và truyền trực tiếp vào bộ lọc.

#### 5. **[components/admin/orders/admin-order-filters.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/admin/orders/admin-order-filters.tsx)**
*   **Thay đổi**:
    *   Chuyển đổi hoàn toàn nhãn bộ lọc sang Tiếng Việt phong cách Shopee trực quan.
    *   Tích hợp đếm số lượng hiển thị động ngay bên cạnh nhãn bộ lọc dạng Badge hình tròn nhỏ cực kỳ bắt mắt.
    *   Cấu hình màu sắc đồng bộ với Sello (Sky Blue `#0369A1` cho tab được chọn).

#### 6. **[components/admin/orders/admin-order-table.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/admin/orders/admin-order-table.tsx)**
*   **Thay đổi**:
    *   Thiết kế lại hoàn toàn cấu trúc hiển thị danh sách từ dạng Table tĩnh đơn điệu thành **Hệ thống thẻ đơn hàng (Order Cards) bo tròn cao cấp kiểu Shopee**.
    *   Hiển thị thông tin khách hàng, mã đơn hàng kèm Status Huy hiệu nổi bật có màu sắc trực quan (Ví dụ: Chờ xác nhận màu vàng, Đang giao màu xám, Đã giao màu xanh lá, Yêu cầu trả màu đỏ).
    *   Liệt kê chi tiết danh sách sản phẩm trong đơn hàng kèm theo hình ảnh sản phẩm đại diện chính xác, số lượng, phân loại và đơn giá bán.
    *   Tích hợp **Nút hành động nhanh (Quick Action Buttons)** một chạm chuyển đổi trạng thái đơn hàng (Xác nhận đơn, Gói hàng xong, Giao vận chuyển, Đã giao xong) giúp Admin xử lý nhanh chóng mà không cần click mở Modal.

#### 7. **[app/admin/orders.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/admin/orders.tsx)**
*   **Thay đổi**:
    *   Triển khai hàm cập nhật nhanh trạng thái đơn hàng `handleQuickUpdateStatus` và truyền xuống `AdminOrderTable`.
    *   Cập nhật truyền thuộc tính `counts` map từ metrics xuống cho `AdminOrderFilters`.

#### 8. **[app/main/(order)/order-detail.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/(order)/order-detail.tsx)**
*   **Thay đổi**: Nâng cấp giao diện hiển thị danh sách sản phẩm trong đơn hàng chi tiết của Khách hàng, tích hợp thêm thẻ ảnh sản phẩm `Image` bo tròn tinh tế và hiển thị theo dạng hàng ngang (Flex Row) cực kỳ sang trọng.

---

## 📅 Bản Cập Nhật: Tích Hợp Bộ Chọn Ngày Tháng Cho Voucher (Voucher DateTime Picker)

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[package.json](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/package.json)**
*   **Thay đổi**: Cài đặt bổ sung thư viện chính thức `"@react-native-community/datetimepicker"` hỗ trợ chọn ngày tháng trực tiếp qua giao diện trực quan của hệ thống thay vì nhập văn bản thủ công.

#### 2. **[components/admin/vouchers/admin-voucher-form.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/admin/vouchers/admin-voucher-form.tsx)**
*   **Thay đổi**:
    *   Loại bỏ hoàn toàn 2 trường nhập text input gõ tay chuỗi ngày tháng ISO phức tạp dễ sai sót cho `Ngày bắt đầu` và `Ngày kết thúc`.
    *   Tạo giao diện dạng nút bấm (Pressable) dropdown đẹp mắt, tự động định dạng ngày tháng sang tiếng Việt chuẩn (`toLocaleDateString` dạng `DD/MM/YYYY hh:mm`) để hiển thị trực quan.
    *   Tích hợp component chọn ngày native `DateTimePicker` từ `@react-native-community/datetimepicker`.
    *   Thiết kế thêm nút Xóa (biểu tượng thùng rác màu đỏ `"trash-2"`) để người dùng dễ dàng khôi phục ngày bắt đầu về "Bắt đầu ngay lập tức" hoặc ngày kết thúc về "Vô thời hạn" chỉ với một lần nhấn.

---

## 📅 Bản Cập Nhật: Hiển Thị Badge Số Lượng & Đẩy Thông Báo local (Expo Notifications)

### 📂 Chi tiết các file được bổ sung mới (New Files)

#### 1. **[utils/notification-store.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/utils/notification-store.ts)**
*   **Thay đổi**:
    *   Tạo mới cửa hàng lưu trữ trạng thái badge thông báo toàn cục `notificationStore` để đồng bộ số lượng tin nhắn chưa đọc giữa tiến trình chạy ngầm và giao diện.
    *   Cung cấp hook `useNotificationCount(type)` hỗ trợ tự động re-render Header khi số lượng thông báo thay đổi mà không cần tạo nhiều yêu cầu API trùng lặp.

---

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[package.json](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/package.json)**
*   **Thay đổi**: Cài đặt thêm thư viện gốc `"expo-notifications"` tương thích với SDK 55 để kích hoạt quyền đẩy thông báo local trên điện thoại của cả Khách hàng và Admin.

#### 2. **[app/_layout.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/_layout.tsx)**
*   **Thay đổi**:
    *   Cấu hình `Notifications.setNotificationHandler` để cho phép phát âm thanh, hiển thị biểu ngữ (banner), danh sách và badge số lượng ngay cả khi ứng dụng đang chạy ở chế độ foreground.
    *   Yêu cầu quyền đẩy thông báo gốc khi khởi chạy ứng dụng (`getPermissionsAsync` và `requestPermissionsAsync` với xử lý kiểu ép kiểu an toàn TS).
    *   Khởi chạy hiệu ứng chạy ngầm (interval polling mỗi 12 giây) để truy vấn thông báo mới từ API Backend dựa theo vai trò (`user.role === 'admin'` dùng `adminService.listNotifications`, ngược lại dùng `notificationService.getNotifications`).
    *   Phát hiện tin nhắn mới chưa từng xuất hiện (so sánh ID với Set `seenIds`) và kích hoạt thông báo đẩy local lập tức bằng `Notifications.scheduleNotificationAsync`.
    *   Đồng bộ cập nhật số lượng unread vào `notificationStore` tương ứng.

#### 3. **[components/main/sello-header.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/sello-header.tsx)**
*   **Thay đổi**:
    *   Tích hợp hook `useNotificationCount` để lấy số lượng thông báo chưa đọc của khách hàng.
    *   Hiển thị badge hình tròn màu đỏ tinh tế (chữ số trắng) góc trên bên phải icon hình chuông khi số lượng thông báo unread lớn hơn 0 (hiển thị `"99+"` nếu lớn hơn 99).

#### 4. **[components/admin/shared/admin-header.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/admin/shared/admin-header.tsx)**
*   **Thay đổi**:
    *   Tích hợp badge số lượng thông báo chưa đọc tương tự giao diện của khách hàng trên icon hình chuông.
    *   Kết nối sự kiện nhấn vào icon hình chuông của Admin để chuyển hướng trực tiếp tới màn hình soạn thảo và lịch sử thông báo hệ thống `/admin/notifications`.

---

## 📅 Bản Cập Nhật: Điều Chỉnh Navigation & Phân Quyền Admin

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[app/admin/_layout.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/admin/_layout.tsx)**
*   **Thay đổi**: 
    *   Chuyển đổi route `/admin/orders` (Quản lý đơn hàng) từ chế độ ẩn (`href: null`) thành tab hiển thị chính trên thanh điều hướng dưới của Admin.
    *   Chuyển đổi route `/admin/reports` (Báo cáo) sang trạng thái ẩn (`href: null`) để thay thế bằng tab đơn hàng.

#### 2. **[components/admin/shared/admin-tab-bar.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/admin/shared/admin-tab-bar.tsx)**
*   **Thay đổi**: 
    *   Cập nhật danh sách tab của Admin: Loại bỏ tab `"reports"` (Report) và thay thế bằng tab `"orders"` (Orders) sử dụng biểu tượng `"truck"`.
    *   Thêm thuộc tính `permission` vào định nghĩa kiểu `TabMeta`.
    *   Sử dụng hook `usePermissions` để lọc danh sách tab hiển thị theo quyền hạn thực tế của tài khoản Admin hiện tại (`products:read`, `chats:read`, `orders:read`, `system:dashboard:read`).
    *   Thay đổi cơ chế ẩn tab: Trả về `null` thay vì render một Spacer View rỗng nếu route không được phân quyền hoặc ẩn, giúp giao diện co giãn đều đặn và không để lại khoảng trống trắng.

---

## 📅 Bản Cập Nhật: Đổi Trả Hàng & Tìm Kiếm Lọc Sản Phẩm Động

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[constants/api.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/constants/api.ts)**
*   **Thay đổi**: 
    *   Bổ sung endpoint API yêu cầu trả hàng dành cho khách hàng: `orders.requestReturn` (`/orders/:orderId/return-request`).
    *   Bổ sung endpoint API phê duyệt yêu cầu trả hàng dành cho admin: `admin.updateReturnStatus` (`/admin/orders/:orderId/return-status`).
    *   Thêm endpoint danh sách sản phẩm động: `products.list` (`/products`).

#### 2. **[types/customer.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/types/customer.ts)**
*   **Thay đổi**: Thêm trạng thái `"return_requested"` vào kiểu tập hợp trạng thái đơn hàng `OrderStatus` của Khách hàng.

#### 3. **[types/admin.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/types/admin.ts)**
*   **Thay đổi**: Thêm trạng thái `"return_requested"` vào kiểu tập hợp trạng thái đơn hàng `AdminOrderStatus` của Admin.

#### 4. **[services/customer.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/customer.service.ts)**
*   **Thay đổi**: 
    *   Triển khai phương thức gửi yêu cầu trả hàng `requestOrderReturn(token, orderId, reason)`.
    *   Cập nhật hàm `mapOrderStatus` để nhận diện và ánh xạ đúng trạng thái `"return_requested"`.

#### 5. **[services/admin.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/admin.service.ts)**
*   **Thay đổi**: 
    *   Triển khai phương thức duyệt/từ chối yêu cầu trả hàng `processOrderReturn(token, orderId, action, description)`.
    *   Cập nhật hàm `mapOrder` để ánh xạ chính xác trạng thái `"return_requested"` từ API backend.

#### 6. **[services/main.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/main.service.ts)**
*   **Thay đổi**: 
    *   Triển khai hàm `getProducts(params)` để gọi API `GET /products` lấy danh sách sản phẩm được tìm kiếm, lọc và phân trang từ Backend.
    *   Triển khai hàm `getFilterMetadata(token)` để lấy danh mục và thương hiệu phục vụ cho bộ lọc động.

#### 7. **[hooks/main/use-product-list-filters.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/hooks/main/use-product-list-filters.ts)**
*   **Thay đổi**: 
    *   Viết lại toàn bộ hook để chuyển đổi từ cơ chế lọc tĩnh trên máy sang kết nối và gọi API Backend động.
    *   Xử lý đồng bộ các bộ lọc tìm kiếm (`search`), khoảng giá (`minPrice`/`maxPrice`), danh mục (`categoryId`), thương hiệu (`brandId`), phân trang và nối tiếp dữ liệu khi cuộn trang tiếp theo.

#### 8. **[app/main/(catalog)/product-list.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/(catalog)/product-list.tsx)**
*   **Thay đổi**: Kết nối giao diện người dùng trực tiếp với các trạng thái mới của hook `useProductListFilters` bao gồm: hiển thị trạng thái đang tải (Loading), thông báo lỗi và cơ chế tải thêm sản phẩm khi cuộn xuống cuối màn hình.

#### 9. **[app/main/(order)/order-detail.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/(order)/order-detail.tsx)**
*   **Thay đổi**: 
    *   Tích hợp nút **"Yêu cầu trả hàng"** chỉ xuất hiện khi đơn hàng ở trạng thái đã giao (`delivered`).
    *   Thiết kế Modal nhập lý do trả hàng chi tiết và gửi yêu cầu lên backend thông qua dịch vụ `customerService.requestOrderReturn`.

#### 10. **[components/main/orders/customer-order-card.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/orders/customer-order-card.tsx)**
*   **Thay đổi**: Cập nhật ánh xạ nhãn hiển thị và màu sắc phù hợp cho trạng thái đơn hàng `"return_requested"`.

#### 11. **[components/main/orders/order-hero-status-card.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/orders/order-hero-status-card.tsx)**
*   **Thay đổi**: Cập nhật nhãn và mô tả hướng dẫn trực quan cho khách hàng khi đơn hàng chuyển sang trạng thái `"return_requested"`.

#### 12. **[app/admin/orders.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/admin/orders.tsx)**
*   **Thay đổi**: 
    *   Trong Modal xem chi tiết đơn hàng của Admin, bổ sung giao diện hiển thị lý do trả hàng do khách gửi (nếu có trạng thái `return_requested`).
    *   Thêm khung nhập ghi chú phản hồi từ Admin (bắt buộc).
    *   Thiết kế 2 nút **"Phê duyệt"** (thông qua API duyệt trả hàng hành động `approve`) và **"Từ chối"** (hành động `reject`).

#### 13. **[components/admin/orders/admin-order-table.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/admin/orders/admin-order-table.tsx)**
*   **Thay đổi**: Bổ sung badge hiển thị trạng thái `"Return Requested"` trên bảng danh sách quản lý đơn hàng của Admin.

#### 14. **[components/main/orders/order-status-pill.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/orders/order-status-pill.tsx)**
*   **Thay đổi**: Thêm nhãn `"Yêu cầu trả hàng"` và cấu hình màu sắc tương ứng cho viên thuốc trạng thái (Status Pill).

#### 15. **[hooks/use-theme-color.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/hooks/use-theme-color.ts)**
*   **Thay đổi**: Sửa lỗi crash kiểu dữ liệu bằng cách tự động chuẩn hóa giá trị `ColorSchemeName` từ hệ thống, loại bỏ lỗi biên dịch liên quan đến giá trị `"unspecified"`.

---

## 📅 Bản Cập Nhật: Tích Hợp Chat Thời Gian Thực & Tin Nhắn Đa Phương Tiện

### 📂 Chi tiết các file được bổ sung mới (New Files)

#### 1. **[types/chat.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/types/chat.ts)**
*   **Thay đổi**: Định nghĩa các Interface dữ liệu cốt lõi bao gồm `ChatMessage` (cấu trúc tin nhắn) và `ChatRoom` (cấu trúc phòng chat cá nhân/admin).

#### 2. **[services/chat.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/chat.service.ts)**
*   **Thay đổi**: Thiết lập tầng kết nối HTTP Client để truy xuất danh sách phòng chat cá nhân khách hàng (`getMyRoom`), danh sách toàn bộ phòng chat của admin (`getAdminRooms`) và tải lịch sử hội thoại (`getHistory`).

#### 3. **[app/main/chat.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/chat.tsx)**
*   **Thay đổi**: 
    *   Tạo mới màn hình hỗ trợ chat trực tuyến thời gian thực của Khách hàng sử dụng Socket.IO.
    *   Hỗ trợ đính kèm hình ảnh và video từ thư viện ảnh (`expo-image-picker`).
    *   Tự động tải file đa phương tiện lên máy chủ trung gian qua HTTP POST Multipart và gửi link kết quả dưới cấu trúc định dạng tin nhắn tin cậy `[image]url` hoặc `[video]url`.
    *   Thiết lập cơ chế dự phòng phát video an toàn: Tự động dùng trình mở web (`expo-web-browser`) phát video nếu thiết bị không tương thích module phát gốc `expo-av`.

#### 4. **[app/admin/chats.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/admin/chats.tsx)**
*   **Thay đổi**: 
    *   Tạo mới màn hình trung tâm quản lý hỗ trợ khách hàng của Admin.
    *   Tích hợp chế độ **Chọn nhiều (Selection Mode)** khi nhấn giữ lâu (Long Press) hoặc nhấn nút checkbox ở Header.
    *   Triển khai tính năng **Đánh dấu đã đọc hàng loạt (Bulk Mark as Read)**: Phát tín hiệu Socket.IO để chuyển đổi đồng loạt trạng thái tin nhắn chưa đọc của các phòng chat đã chọn và reload danh sách tức thì.
    *   Tích hợp tính năng gửi ảnh/video tương tự giao diện khách hàng.

---

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[constants/api.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/constants/api.ts)**
*   **Thay đổi**: Khai báo bổ sung nhóm endpoint `chat.myRoom`, `chat.adminRooms` và `chat.history` vào cấu trúc cấu hình API hệ thống.

#### 2. **[components/main/sello-tab-bar.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/sello-tab-bar.tsx)**
*   **Thay đổi**: Bổ sung tab **"Hỗ trợ"** sử dụng biểu tượng tin nhắn vào thanh điều hướng dưới Bottom Tab Bar của khách hàng.

#### 3. **[app/main/_layout.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/_layout.tsx)**
*   **Thay đổi**: Khai báo Route `/chat` trong sơ đồ định tuyến Tabs Layout của khách hàng.

#### 4. **[app/main/profile.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/profile.tsx)**
*   **Thay đổi**: Thêm lối tắt **"Hỗ trợ trực tuyến (Chat)"** vào danh sách tùy chọn trong màn hình quản lý tài khoản để giúp người dùng mở nhanh màn hình hỗ trợ.

#### 5. **[components/admin/shared/admin-tab-bar.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/admin/shared/admin-tab-bar.tsx)**
*   **Thay đổi**: Đăng ký tab chat `"chats"` vào danh sách tab hiển thị dưới Bottom Tab Bar của quản trị viên.

#### 6. **[app/admin/_layout.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/admin/_layout.tsx)**
*   **Thay đổi**: Đăng ký màn hình `chats` trong cấu hình Tabs Layout chính của Admin.

#### 7. **[app/admin/menu.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/admin/menu.tsx)**
*   **Thay đổi**: Bổ sung mục quản trị `"Chat Support"` bảo vệ trực tiếp bằng quyền hạn chuyên biệt `'chats:read'`.

#### 8. **[package.json](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/package.json)**
*   **Thay đổi**: Cài đặt thêm 2 gói thư viện phục vụ chọn tệp và xử lý đa phương tiện tương thích SDK 55: `"expo-image-picker"` và `"expo-av"`.

#### 9. **[app/onboarding/welcome.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/onboarding/welcome.tsx)**
*   **Thay đổi**: Cân chỉnh lại kích thước hiển thị của Logo thương hiệu, các nút đăng nhập bằng Google, tối ưu khoảng đệm nút để giao diện cân đối trên mọi kích cỡ màn hình di động.
