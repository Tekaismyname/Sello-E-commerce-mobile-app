# 📝 Nhật Ký Thay Đổi Chi Tiết (CHANGELOG) - Sello Mobile App

Tài liệu này ghi nhận chi tiết danh sách tất cả các file được chỉnh sửa/thêm mới trong dự án **Sello E-commerce Mobile App (Frontend)** cùng với nội dung thay đổi cụ thể trong từng file.

---

## 📅 Bản Cập Nhật: Tích Hợp Thanh Toán PayPal Sandbox (PayPal Integration)

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[services/customer.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/customer.service.ts)**
*   **Thay đổi**: Bổ sung hàm `capturePaypalOrder` vào `orderService` để gọi API đối soát capture của cổng thanh toán PayPal Sandbox ở backend.

#### 2. **[app/main/(payment)/payment.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/(payment)/payment.tsx)**
*   **Thay đổi**: Tích hợp luồng thanh toán ví điện tử PayPal Sandbox. Khi đơn hàng có loại thanh toán là `paypal`, màn hình sẽ tự động hiển thị mô tả PayPal cùng nút **"Mở cổng thanh toán PayPal"** màu vàng thương hiệu. Khi nhấn nút, ứng dụng sử dụng `WebBrowser.openAuthSessionAsync` để đưa khách hàng sang PayPal đăng nhập thanh toán và tự động bắt deep link callback `selloecommerce://checkout/paypal/success` trả về để khớp lệnh tự động. Các phương thức thanh toán cũ (COD, Mock QR) được giữ nguyên hoàn toàn.

#### 3. **[app/admin/orders.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/admin/orders.tsx)**
*   **Thay đổi**: Thiết kế lại giao diện hộp thoại chi tiết đơn hàng của Admin. Giờ đây, khi Admin xem chi tiết đơn hàng, màn hình sẽ hiển thị đầy đủ:
    1. Thông tin khách hàng đặt đơn.
    2. Chi tiết sản phẩm đã mua (hình ảnh, số lượng, đơn giá, tổng tiền từng dòng).
    3. Thông tin thanh toán (phương thức thanh toán, trạng thái thanh toán có màu sắc trực quan, tổng thanh toán).
    4. Dòng thời gian lịch sử trạng thái giao dịch (Timeline status history) trực quan, liệt kê chi tiết từng thời điểm thay đổi trạng thái kèm mô tả.

---

## 📅 Bản Cập Nhật Mới Nhất: Tăng Tốc Độ Tải Dữ Liệu (API Latency Fix) & Kiểm Soát Quyền Viết Đánh Giá

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[app/product/reviews.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/product/reviews.tsx)**
*   **Thay đổi**: Tích hợp kiểm tra quyền viết đánh giá động. Khi mở danh sách đánh giá của sản phẩm, ứng dụng sẽ gọi API danh sách đơn hàng của người dùng để xác thực xem họ đã mua sản phẩm này và đơn hàng đã được giao thành công (`delivered`) hay chưa. Nút bấm nổi "Viết đánh giá" (`WriteReviewFab`) sẽ tự động ẩn đi đối với người dùng chưa mua sản phẩm này.

#### 2. **[app/main/(order)/order-detail.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/(order)/order-detail.tsx)**
*   **Thay đổi**: Bổ sung nút bấm **"Viết đánh giá"** trực tiếp bên cạnh mỗi sản phẩm trong danh sách "Sản phẩm đã chọn" nếu đơn hàng có trạng thái là đã giao thành công (`delivered`). Điều này giúp khách hàng dễ dàng đánh giá từng sản phẩm đã mua trong lịch sử chi tiết đơn hàng.

#### 3. **[components/main/orders/customer-order-card.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/orders/customer-order-card.tsx)**
*   **Thay đổi**: Đối với thẻ đơn hàng ở màn hình lịch sử có trạng thái đã giao thành công (`delivered`), hệ thống sẽ hiển thị đồng thời hai nút hành động: **"Viết đánh giá"** (để dẫn khách hàng vào xem chi tiết đơn hàng và đánh giá sản phẩm) và **"Mua lại"**.

#### 4. **[app/product/write-review.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/product/write-review.tsx)**
*   **Thay đổi**: Cập nhật giao diện màn hình viết đánh giá để hiển thị đúng tên và hình ảnh thực tế của sản phẩm được truyền qua tham số điều hướng (`productName`, `productImage`) thay vì sử dụng ảnh mẫu giày mặc định, mang lại trải nghiệm UX nhất quán và trực quan hơn.

#### 5. **[components/product/review/write-review-fab.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/product/review/write-review-fab.tsx)**, **[components/product/detail/product-review-overview.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/product/detail/product-review-overview.tsx)**, & **[app/product/detail.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/product/detail.tsx)**
*   **Thay đổi**: Mở rộng truyền dữ liệu tên và hình ảnh đại diện sản phẩm từ màn hình chi tiết sản phẩm qua danh sách đánh giá và dẫn tới form viết đánh giá, phục vụ cho việc hiển thị thông tin động.

#### 6. **[app/_layout.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/_layout.tsx)**
*   **Thay đổi**: Đăng ký component `Image` của `expo-image` với công cụ NativeWind v4 thông qua hàm `cssInterop` (`cssInterop(ExpoImage, { className: "style" })`). Điều này giải quyết triệt để lỗi ảnh sản phẩm không hiển thị (bị ẩn về kích thước 0) do NativeWind v4 không tự động ánh xạ thuộc tính `className` (như `h-[120px]`, `w-full`) sang thuộc tính `style` cho các component của bên thứ ba.

#### 7. **[services/admin.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/admin.service.ts)**, **[services/auth.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/auth.service.ts)**, **[services/chat.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/chat.service.ts)**, **[services/customer.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/customer.service.ts)**, & **[services/main.service.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/services/main.service.ts)**
*   **Thay đổi**: Tích hợp cơ chế tự động ghi nhớ và ưu tiên máy chủ phản hồi làm việc chính (Active API Base URL). Khi một yêu cầu fetch API thành công trên một candidate URL, URL đó sẽ được tự động đưa lên vị trí đầu tiên (index 0) của danh sách `API_BASE_URL_CANDIDATES`. Điều này loại bỏ hoàn toàn việc ứng dụng phải liên tục thử kết nối và chờ đợi timeout (10s+) trên các máy chủ local/máy ảo lỗi ở các request tiếp theo, giúp tăng tốc độ tải dữ liệu tức thì lên gấp nhiều lần.

---

## 📅 Bản Cập Nhật Trước: Tối Ưu Hóa Hiệu Năng Mobile (Shopify FlashList, Expo Image & Giải Phóng Tài Nguyên Bản Đồ)

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[app/main/(catalog)/product-list.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/(catalog)/product-list.tsx)**
*   **Thay đổi**: Refactor từ việc sử dụng `ScrollView` kết hợp với `.map()` sang sử dụng `<FlashList>` của Shopify với cấu hình `numColumns={2}` giúp cải thiện hiệu năng cuộn, tái sử dụng phần tử vẽ (view recycling) hiệu quả. Lược bỏ thuộc tính `estimatedItemSize` do dự án đang dùng **FlashList v2.x** (tự động tính toán kích thước phần tử và tối ưu cho kiến trúc React Native mới).

#### 2. **[components/product/list/product-list-card.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/product/list/product-list-card.tsx)**
*   **Thay đổi**: 
    *   Chuyển đổi thẻ sản phẩm sang sử dụng `w-full` thay vì các giá trị phần trăm cố định để tự động kéo giãn vừa vặn theo chiều rộng của cột FlashList.
    *   Chuyển đổi component hiển thị ảnh sang `expo-image` để tối ưu bộ nhớ đệm và hiển thị ảnh mượt mà, sử dụng `contentFit="cover"` thay cho `resizeMode`.

#### 3. **[components/product/list/suggested-product-card.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/product/list/suggested-product-card.tsx)**
*   **Thay đổi**: Chuyển đổi component `Image` sang `expo-image` để nâng cao hiệu năng lưu đệm hình ảnh và giảm tải thời gian dựng khung hình khi cuộn nhanh.

#### 4. **[components/main/home/flash-sales-section.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/home/flash-sales-section.tsx)**
*   **Thay đổi**: Nâng cấp các thẻ ảnh của sản phẩm Flash Sale sang `expo-image` để giảm thiểu giật lag khi cuộn trang chủ chứa danh sách sản phẩm dài.

#### 5. **[components/main/home/home-promo-banner.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/home/home-promo-banner.tsx)**
*   **Thay đổi**: Thay thế `Image` gốc bằng `expo-image` để hiển thị các banner quảng cáo sắc nét và tải nhanh hơn nhờ bộ nhớ đệm cải tiến.

#### 6. **[components/main/cart/cart-item-card.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/cart/cart-item-card.tsx)**
*   **Thay đổi**: Cải thiện hiệu năng render danh sách giỏ hàng bằng cách đổi ảnh sản phẩm sang `expo-image`, giúp ứng dụng luôn mượt mà khi người dùng thay đổi số lượng hoặc xóa vật phẩm.

#### 7. **[components/main/address/address-form.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/address/address-form.tsx)**
*   **Thay đổi**: Khắc phục triệt để lỗi rò rỉ bộ nhớ và tài nguyên chạy ngầm của WebView chứa bản đồ Leaflet. WebView giờ đây chỉ được mount vào DOM khi Modal hiển thị bản đồ thực sự được mở (`showMap === true`) và tự động unmount/hủy bỏ khi đóng Modal, giúp giải phóng hoàn toàn tài nguyên CPU/RAM chạy ngầm.

---

## 📅 Bản Cập Nhật Trước: Hoàn Thiện Giao Diện Flash Sale Shopee, Animation Tương Tác & Tích Hợp Thông Báo Đẩy Toàn Diện

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[components/main/home/flash-sales-section.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/home/flash-sales-section.tsx)**
*   **Thay đổi**: Sửa đổi tham số điều hướng từ `productId` sang `id` để khớp chính xác với `app/product/detail.tsx`, đảm bảo khi nhấn vào các mặt hàng Flash Sale sẽ điều hướng tới trang chi tiết sản phẩm và hiển thị thông tin thành công.

#### 2. **[components/main/home/featured-categories-section.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/home/featured-categories-section.tsx)**
*   **Thay đổi**: Thêm hiệu ứng co giãn mượt mà khi nhấn vào các danh mục nổi bật (`active scale transition` với tỉ lệ `0.94`) giúp giao diện có phản hồi trực quan sống động.

#### 3. **[components/product/list/suggested-product-card.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/product/list/suggested-product-card.tsx)**
*   **Thay đổi**: Tích hợp hoạt ảnh nhấn co giãn (`scale transition` tỉ lệ `0.97`) khi click vào các thẻ sản phẩm gợi ý, mang lại trải nghiệm bấm mượt mà chuẩn premium app.

#### 4. **[components/product/detail/product-bottom-action-bar.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/product/detail/product-bottom-action-bar.tsx)**
*   **Thay đổi**: 
    *   Tích hợp bộ tiện ích thông báo cục bộ `triggerLocalNotification`.
    *   Kích hoạt thông báo khi người dùng nhấn "Thêm vào giỏ" thành công (`Thêm vào giỏ hàng thành công 🛒`).
    *   Kích hoạt thông báo đẩy khi người dùng thêm hoặc xóa sản phẩm khỏi danh sách yêu thích (`Danh sách yêu thích ❤️`).

#### 5. **[app/auth/login.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/auth/login.tsx)**
*   **Thay đổi**: Tích hợp thông báo đẩy local khi người dùng đăng nhập thành công (`Đăng nhập thành công 🎉`) để chào mừng và tạo sự thân thiện ngay từ màn hình đầu tiên.

#### 6. **[app/product/write-review.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/product/write-review.tsx)**
*   **Thay đổi**: Thêm thông báo đẩy local chúc mừng và cảm ơn khi người dùng gửi đánh giá sản phẩm thành công (`Đánh giá thành công! 🌟`).

#### 7. **[app/_layout.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/_layout.tsx)**
*   **Thay đổi**: Điều chỉnh cơ chế chạy ngầm (background polling) của tài khoản Admin. Thay vì tải toàn bộ danh sách lịch sử thông báo hệ thống (vốn chứa toàn bộ thông báo gửi cho khách hàng), Admin giờ đây chỉ truy vấn và hiển thị thông báo đẩy cho các tin nhắn liên hệ trực tiếp gửi riêng tới Admin. Điều này giải quyết hoàn toàn lỗi các Admin bị nhận thông báo đẩy liên tục cho các sự kiện/thông báo quảng cáo do chính mình tạo ra.

---

## 📅 Bản Cập Nhật Trước: Ghi Nhớ Đăng Nhập Tự Động (Remember Login) & Nâng Cấp Tìm Kiếm Địa Điểm Định Vị Thông Minh

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[app/auth/login.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/auth/login.tsx)**
*   **Thay đổi**:
    *   **Tích hợp Ghi nhớ Đăng nhập (Remember Login)**: Bổ sung ô tích chọn (Checkbox) "Ghi nhớ đăng nhập" được thiết kế custom cực kỳ bắt mắt đồng bộ theo tone màu xanh `#157bb8` của Sello.
    *   **Tự động tải thông tin phiên cũ**: Khi mở màn hình, ứng dụng sử dụng `AsyncStorage` để kiểm tra và tự động điền (autofill) lại thông tin tài khoản & mật khẩu đã lưu trước đó nếu người dùng đã tích chọn ghi nhớ.
    *   **Lưu trữ an toàn khi đăng nhập**: Cập nhật hàm `submitLogin` để lưu lại Email/Sđt và Password vào `AsyncStorage` khi đăng nhập thành công nếu Checkbox được kích hoạt, hoặc xóa bỏ các trường này khỏi bộ nhớ nếu người dùng bỏ tích chọn.

#### 2. **[hooks/customer/use-addresses-view.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/hooks/customer/use-addresses-view.ts)**
*   **Thay đổi**: Bổ sung tham số cấu hình tùy chọn `{ lazy?: boolean }` vào hook `useAddressesView`. Nếu được thiết lập `lazy: true`, hook sẽ bỏ qua việc kích hoạt yêu cầu API danh sách địa chỉ tự động khi mount (`useEffect`), cho phép component bên ngoài tự kiểm soát thời điểm nạp dữ liệu bằng phương thức `fetchAddresses`.

#### 3. **[app/main/(address)/addresses.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/(address)/addresses.tsx)**
*   **Thay đổi**:
    *   Tích hợp hook `useFocusEffect` từ thư viện `expo-router` kết hợp với `useCallback`.
    *   Cấu hình gọi hook `useAddressesView` ở chế độ `{ lazy: true }` để tránh các yêu cầu API bị trùng lặp khi mount màn hình.
    *   Kích hoạt nạp lại danh sách địa chỉ `fetchAddresses()` thông qua `useFocusEffect` mỗi khi người dùng truy cập hoặc quay trở lại màn hình Danh sách địa chỉ từ màn hình Thêm/Sửa địa chỉ, giúp cập nhật tức thời 100% dữ liệu mới mà không cần F5 hoặc tải lại ứng dụng.

#### 4. **[components/main/address/address-form.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/address/address-form.tsx)**
*   **Thay đổi**:
    *   **Loại bỏ hoàn toàn thư viện native `react-native-maps`**: Giải quyết triệt để lỗi màn hình bản đồ bị xám/trắng do thiếu Google Maps API Key khi chạy thử nghiệm trên Android Emulator.
    *   **Tích hợp `react-native-webview` để tải Bản đồ Leaflet + OpenStreetMap**: Tạo và nhúng mã nguồn HTML/JS Leaflet tải các lát gạch bản đồ miễn phí từ OpenStreetMap vào trong một `<WebView>`. Bản đồ hiển thị siêu tốc, mượt mà và hoàn toàn miễn phí mà không cần bất kỳ API Key nào.
    *   **Giữ nguyên trải nghiệm kéo thả cao cấp (Ghim tâm bản đồ)**: Sử dụng cấu trúc ghim Marker tĩnh ở trung tâm màn hình thông qua Absolute Layout và lắng nghe sự kiện di chuyển bản đồ kết thúc (`moveend`) của Leaflet để gửi tọa độ mới về qua cơ chế `window.ReactNativeWebView.postMessage`.
    *   **Cơ chế khóa tọa độ khởi tạo (Initialize Coordinate Locking)**: Triển khai state `initialMapCoords` ghi nhận duy nhất một lần tọa độ hiện tại khi mở Modal bản đồ để gán làm tọa độ tâm khởi tạo cho WebView, ngăn chặn hiện tượng WebView tự động tải lại (reload) liên tục mỗi khi kéo rê bản đồ cập nhật tọa độ.
    *   **Tương tác mượt mà hai chiều**:
        *   Cập nhật tọa độ ghim hiện tại từ bản đồ Leaflet về state `markerPosition` thông qua hàm xử lý `handleMapMessage`.
        *   Tích hợp `injectJavaScript` điều khiển bản đồ dịch chuyển mượt mà tới tâm điểm mới (`window.setCenter`) khi người dùng lựa chọn kết quả tìm kiếm.
    *   **Đồng bộ tọa độ khi lưu**: Cập nhật hàm `onSubmit` trong component Form để thu thập và gửi kèm các trường tọa độ `latitude` và `longitude` chính xác về Backend khi thêm mới hoặc cập nhật địa chỉ.
    *   **Tích hợp giải pháp Giải mã tọa độ ngược Nominatim & Photon (Dual Geocoding Fallbacks)**:
        *   Nâng cấp cơ chế lấy địa chỉ từ tọa độ khi nhấn "Xác nhận vị trí này". Chuyển sang sử dụng **Nominatim (cơ sở dữ liệu chính thức của OpenStreetMap)** làm nguồn chính, có mức độ phân tích địa chỉ cấp phường/xã cực kỳ sâu và chi tiết tại Việt Nam.
        *   Tích hợp thuật toán chống trùng lặp: Tự động phát hiện và loại bỏ phần trùng lặp của các cấp hành chính (như lấy trùng Quận/Huyện cho Phường/Xã) giúp địa chỉ đổ ra form cực kỳ chuẩn xác và sạch sẽ.
        *   Triển khai cơ chế dự phòng (fail-over fallback): Nếu Nominatim gặp lỗi kết nối hoặc bị giới hạn, hệ thống sẽ tự động chuyển sang gọi Photon API làm dự phòng một cách âm thầm, đảm bảo 100% không bao giờ crash hoặc báo lỗi trắng.
    *   **Nâng cấp Tìm kiếm Địa điểm Kết hợp Đa nguồn**:
        *   Đổi mới cơ chế tìm kiếm địa chỉ thời gian thực (Debounced 600ms): Nếu Photon API gặp sự cố hoặc bị nhà mạng chặn tại Việt Nam, hệ thống lập tức tự động truy vấn thay thế qua Nominatim Search API.
        *   Thống nhất cấu trúc trả về dưới dạng định dạng chung `UnifiedSearchResult` giúp giao diện hiển thị mượt mà, đồng bộ và tránh hoàn toàn các lỗi hiển thị do sai cấu trúc dữ liệu.
        *   Bổ sung bộ định vị thông minh (location bias) thông qua tham số `lat` và `lon` của Photon API, tự động ưu tiên các địa điểm gần ghim bản đồ hiện tại nhất để đảm bảo kết quả chính xác 100% tại Việt Nam.
        *   Chuyển đổi icon tìm kiếm thành nút bấm `Pressable` màu xanh thương hiệu giúp người dùng có thể kích hoạt tìm kiếm tức thời một cách rõ ràng.

---

## 📅 Bản Cập Nhật Trước: Chế Độ Khách (Guest Mode) Premium & Chọn Vị Trí Trên Bản Đồ Số (Address Map Picker)

### 📂 Chi tiết các file được bổ sung mới (New Files)

#### 1. **[components/ui/guest-placeholder.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/ui/guest-placeholder.tsx)**
*   **Thay đổi**: Thiết kế và tạo mới UI component `GuestPlaceholder` dùng chung có icon Feather động, cấu trúc hiển thị bo góc, hiệu ứng bóng mờ sang trọng và nút hành động nổi bật dẫn người dùng đi Đăng nhập.

---

### 📂 Chi tiết các file thay đổi (Modified Files)

#### 1. **[components/ui/index.ts](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/ui/index.ts)**
*   **Thay đổi**: Xuất (export) component `GuestPlaceholder` để sử dụng dễ dàng ở toàn bộ mã nguồn.

#### 2. **[app/main/cart.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/cart.tsx)**
*   **Thay đổi**: Kiểm tra trạng thái `!token`, nếu là Khách hàng chưa đăng nhập sẽ hiển thị `GuestPlaceholder` giỏ hàng trống thân thiện thay vì thông báo lỗi thô ráp.

#### 3. **[app/main/(order)/orders.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/(order)/orders.tsx)**
*   **Thay đổi**: 
    *   Kiểm tra trạng thái `!token`, nếu là Khách hàng chưa đăng nhập sẽ hiển thị `GuestPlaceholder` theo dõi đơn hàng bắt mắt.
    *   **Giữ lại phần sản phẩm gợi ý `RecommendedProducts` bên dưới** để kích cầu mua sắm.

#### 4. **[app/main/chat.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/chat.tsx)**
*   **Thay đổi**: Kiểm tra trạng thái `!token`, ẩn hoàn toàn khung chat rỗng và thanh nhập tin nhắn bên dưới (tránh lỗi gửi tin của khách) và thay thế bằng `GuestPlaceholder` chat hỗ trợ toàn màn hình cực kỳ tinh tế.

#### 5. **[app/main/profile.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/app/main/profile.tsx)**
*   **Thay đổi**: Kiểm tra trạng thái `!token`, ẩn toàn bộ các tùy chọn thông tin nhạy cảm của người dùng (Đổi mật khẩu, Địa chỉ, Yêu thích) để tránh lỗi/crash và thay thế bằng `GuestPlaceholder` hồ sơ cá nhân hướng dẫn đăng nhập.

#### 6. **[components/product/detail/product-bottom-action-bar.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/product/detail/product-bottom-action-bar.tsx)**
*   **Thay đổi**: Nâng cấp luồng sự kiện của các nút bấm **"Thêm vào giỏ"**, **"Mua hàng"** và **"Yêu thích"**. Nếu chưa đăng nhập (`!token`), hiển thị popup `Alert` thông minh chuẩn Shopee cho phép người dùng lựa chọn chuyển hướng ngay sang trang Đăng nhập `/auth/login`.

#### 7. **[components/main/address/address-form.tsx](file:///c:/Users/hokha/Dropbox/PC/Downloads/LearningDocuments/DA-TTLT-A/Sello-E-commerce-mobile-app/components/main/address/address-form.tsx)**
*   **Thay đổi**:
    *   Tích hợp nút **"Chọn vị trí trên bản đồ số"** mở Modal chọn bản đồ full screen.
    *   Tích hợp bản đồ số thông minh `react-native-maps` cho phép người dùng kéo rê bản đồ dưới ghim Marker cố định ở chính giữa tâm bản đồ.
    *   Tích hợp thanh tìm kiếm địa điểm và gợi ý nhanh (Search Autocomplete) sử dụng Photon API.
    *   Tích hợp giải mã địa lý ngược (Reverse Geocoding) tự động trích xuất thông tin tọa độ thành các trường: Tỉnh/Thành phố, Quận/Huyện, Phường/Xã và Địa chỉ chi tiết để tự động điền (Autofill) vào Form, hỗ trợ người dùng nhập liệu siêu tốc.
    *   **Tích hợp `UrlTile` hiển thị bản đồ miễn phí OpenStreetMap**: Đè các lát gạch bản đồ miễn phí OpenStreetMap lên trên MapView để đảm bảo bản đồ hiển thị chi tiết đầy đủ 100% trên Android mà không bắt buộc phải cấu hình Google Maps API Key phức tạp ở chế độ phát triển local.
    *   **Chuyển đổi 4 trường địa phương thành Select Box**: Đổi các trường *Tỉnh/Thành phố, Quận/Huyện, Phường/Xã, Loại địa chỉ* từ ô nhập văn bản tự do thành các hộp lựa chọn thông minh.
    *   **Bộ lọc tìm kiếm động (Search In Options)**: Khi nhấn mở Select Box, hiển thị Modal liệt kê tùy chọn kèm ô tìm kiếm nhanh (Search Bar) giúp lọc nhanh trong danh sách 63 tỉnh thành Việt Nam.
    *   **Cơ chế Tự nhập thủ công (Manual Input Dialog) dự phòng**: Để đảm bảo tính linh hoạt 100%, thiết kế thêm nút *"Tự nhập thủ công"* ở đầu danh sách lựa chọn. Nếu địa điểm của người dùng không có trong danh sách định nghĩa sẵn hoặc muốn nhập địa phương khác, một hộp thoại Dialog nhập tay tinh tế sẽ mở ra cho phép họ điền tự do.

---

## 📅 Bản Cập Nhật Trước: Đồng Bộ Ảnh Đơn Hàng & Giao Diện Quản Lý Đơn Hàng Admin Kiểu Shopee

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
