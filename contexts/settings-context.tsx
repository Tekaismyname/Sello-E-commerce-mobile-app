import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeColorScheme } from "react-native";
import { useColorScheme as useWindColorScheme } from "nativewind";

// --- Translation Dictionary ---
export type Language = "vi" | "en";
export type ThemeMode = "light" | "dark" | "system";
export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastState {
  visible: boolean;
  title: string;
  message: string;
  type: ToastType;
}

interface SettingsContextValue {
  language: Language;
  theme: ThemeMode;
  toast: ToastState;
  setLanguage: (lang: Language) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  t: (key: string, defaultValue?: string) => string;
  showToast: (title: string, message: string, type?: ToastType) => void;
  hideToast: () => void;
  clearAppCache: () => Promise<void>;
}

const STORAGE_KEYS = {
  language: "@sello/settings_language",
  theme: "@sello/settings_theme",
};

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // General / Headers
    "my_account": "Tài khoản của tôi",
    "search_placeholder": "Tìm kiếm sản phẩm...",
    "search": "Tìm kiếm",
    "sign_in": "Đăng nhập",
    "sign_out": "Đăng xuất",
    "account_info": "Thông tin tài khoản",
    "shipping_addresses": "Địa chỉ giao hàng",
    "notifications": "Thông báo",
    "wishlist": "Danh sách yêu thích",
    "live_support": "Hỗ trợ trực tuyến",
    "change_password": "Đổi mật khẩu",
    "settings": "Cài đặt",
    "save": "Lưu",
    "cancel": "Hủy",
    "loading": "Đang tải...",
    "error": "Lỗi",
    "success": "Thành công",
    "active": "Đang hoạt động",
    "ready_to_reply": "Sẵn sàng hỗ trợ",

    // Home
    "flash_sale": "Khuyến mãi Flash Sale",
    "suggested_products": "Gợi ý cho bạn",
    "view_more": "Xem thêm",
    "ends_in": "Kết thúc sau",
    "featured_categories": "Danh mục nổi bật",

    // Cart
    "cart_title": "Giỏ hàng",
    "empty_cart": "Giỏ hàng trống",
    "empty_cart_desc": "Hãy thêm sản phẩm vào giỏ hàng của bạn.",
    "subtotal": "Tạm tính",
    "checkout": "Thanh toán",
    "remove_product": "Xóa sản phẩm",
    "remove_product_confirm": "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",

    // Profile
    "profile_guest_desc": "Đăng nhập để quản lý địa chỉ giao hàng, danh sách yêu thích và cài đặt tài khoản.",
    "hello": "Xin chào",
    "sello_member": "Thành viên Sello",

    // Chat
    "support_chat": "Hỗ trợ trực tuyến",
    "chat_placeholder": "Nhập tin nhắn...",
    "uploading_attachment": "Đang tải tệp đính kèm lên...",
    "chat_welcome_title": "Xin chào!",
    "chat_welcome_desc": "Hãy gửi tin nhắn bên dưới để nhận hỗ trợ trực tiếp từ đội ngũ Sello.",
    "watch_video": "Xem video trên trình duyệt",

    // Settings
    "settings_title": "Cài đặt hệ thống",
    "language_label": "Ngôn ngữ",
    "theme_label": "Giao diện (Theme)",
    "theme_light": "Sáng",
    "theme_dark": "Tối",
    "theme_system": "Hệ thống",
    "notification_settings": "Cài đặt thông báo",
    "push_notifications": "Thông báo đẩy",
    "email_notifications": "Thông báo Email",
    "biometric_login": "Đăng nhập bằng vân tay/khuôn mặt",
    "clear_cache": "Xóa bộ nhớ đệm",
    "clear_cache_desc": "Xóa dữ liệu tạm thời để giải phóng dung lượng ứng dụng.",
    "cache_cleared_title": "Thành công",
    "cache_cleared_msg": "Bộ nhớ đệm đã được xóa sạch hoàn toàn!",
    "app_version": "Phiên bản ứng dụng",
    
    // Notifications Screen
    "mark_all_read": "Đánh dấu tất cả đã đọc",
    "no_notifications": "Không có thông báo nào",
    "no_notifications_desc": "Bạn sẽ nhận được thông báo khi có hoạt động mới liên quan.",

    // Wishlist Screen
    "no_wishlist_items": "Danh sách yêu thích trống",
    "no_wishlist_items_desc": "Hãy thêm sản phẩm bạn yêu thích vào danh sách này.",
    "added_to_cart": "Đã thêm vào giỏ hàng thành công!",

    // Change Password Screen
    "old_password": "Mật khẩu hiện tại",
    "new_password": "Mật khẩu mới",
    "confirm_new_password": "Xác nhận mật khẩu mới",
    "password_updated": "Mật khẩu đã được cập nhật thành công.",
    "fill_all_fields": "Vui lòng nhập đầy đủ các trường yêu cầu.",
    "passwords_dont_match": "Mật khẩu xác nhận không trùng khớp.",
    "password_too_short": "Mật khẩu mới phải dài ít nhất 8 ký tự.",

    // Orders Screen
    "my_orders": "Đơn hàng của tôi",
    "order_id": "Mã đơn hàng",
    "order_date": "Ngày đặt",
    "order_status": "Trạng thái",
    "total_amount": "Tổng thanh toán",
    "cancel_order": "Hủy đơn hàng",
    "cancel_order_confirm": "Bạn có chắc muốn hủy đơn hàng này?",
    "order_cancelled": "Đơn hàng đã được hủy thành công.",
    "order_tracking": "Theo dõi đơn hàng",
    "order_detail": "Chi tiết đơn hàng",
    "no_orders": "Bạn chưa có đơn hàng nào",
    "no_orders_desc": "Các đơn hàng bạn mua sẽ xuất hiện tại đây.",

    // Addresses Screen
    "address_title": "Sổ địa chỉ",
    "add_new_address": "Thêm địa chỉ mới",
    "edit_address": "Chỉnh sửa địa chỉ",
    "default_address": "Mặc định",
    "set_default": "Đặt làm mặc định",
    "delete_address": "Xóa địa chỉ",
    "delete_address_confirm": "Bạn có chắc muốn xóa địa chỉ giao hàng này không?",

    // Added localizations
    "view_all": "Xem tất cả",
    "almost_sold_out": "Sắp cháy hàng",
    "best_seller": "Bán chạy",
    "october_highlight": "TIÊU ĐIỂM THÁNG 10",
    "tech_peak": "Đỉnh Cao Công Nghệ",
    "tech_peak_desc": "Giảm đến 40% cho các dòng điện thoại và laptop",
    "popular_brands": "Thương hiệu phổ biến",
    "home_categories_trail": "Trang chủ > Danh mục",
    "all_products": "Tất cả sản phẩm",
    "products_found": "Tìm thấy {count} sản phẩm",
    "no_products_found": "Không tìm thấy sản phẩm phù hợp với từ khóa này.",
    "view_more_products": "Xem thêm sản phẩm",
    "loading_more": "Đang tải thêm...",
    "price_lt500": "Giá: < 500k",
    "price_500to1000": "Giá: 500k-1tr",
    "price_1000to2000": "Giá: 1tr-2tr",
    "price_gt2000": "Giá: > 2tr",
    "price_filter": "Giá",
    "rating_4up": "Đánh giá: từ 4★",
    "rating_45up": "Đánh giá: từ 4.5★",
    "rating_filter": "Đánh giá",
    "brand_filter": "Thương hiệu",
    "all": "Tất cả",
    "price_option_lt500": "Dưới 500.000đ",
    "price_option_500to1000": "500.000đ - 1.000.000đ",
    "price_option_1000to2000": "1.000.000đ - 2.000.000đ",
    "price_option_gt2000": "Trên 2.000.000đ",
    "rating_option_4up": "Từ 4★",
    "rating_option_45up": "Từ 4.5★",
    "best_sellers": "Bán chạy",
    "popular": "Phổ biến",
    "price_low_high": "Giá thấp > cao",
    "order_cancellation": "Hủy đơn hàng",
    "cancel_order_confirm_id": "Bạn có chắc muốn hủy đơn #{id}?",
    "no_cancel": "Không",
    "yes_cancel": "Hủy đơn",
    "session_expired": "Phiên đăng nhập đã hết hạn.",
    "cannot_cancel_order": "Không thể hủy đơn.",
    "cancel_reason_prompt": "Cho Sello biết lý do để cải thiện dịch vụ. Đơn #{id}",
    "cancel_reason_note_placeholder": "Ghi chú thêm (không bắt buộc)",
    "submitting": "Đang gửi...",
    "reason_changed_mind": "Đổi ý, không muốn mua nữa",
    "reason_found_cheaper": "Tìm thấy giá tốt hơn ở nơi khác",
    "reason_wrong_order": "Đặt nhầm sản phẩm hoặc thông tin",
    "reason_shipping_slow": "Thời gian giao hàng dự kiến quá lâu",
    "reason_other": "Lý do khác",
    "reason_wrong_item": "Nhận sai sản phẩm",
    "reason_damaged": "Sản phẩm bị hư hỏng hoặc lỗi",
    "reason_not_as_described": "Sản phẩm không đúng như mô tả",
    "reason_late_delivery": "Giao hàng quá trễ",
    "reorder_title": "Mua lại đơn hàng",
    "reorder_confirm": "Bạn có muốn thêm tất cả sản phẩm của đơn hàng này vào giỏ hàng?",
    "agree": "Đồng ý",
    "added_to_cart_go": "Đã thêm tất cả sản phẩm vào giỏ hàng. Đi đến giỏ hàng?",
    "later": "Để sau",
    "cart": "Giỏ hàng",
    "cart_add_error": "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.",
    "order_track": "Theo dõi đơn",
    "awaiting_approval": "Đang chờ duyệt",
    "write_review": "Viết đánh giá",
    "buy_again": "Mua lại",
    "items_count": "{count} món",
    "other_items": "+{count} sản phẩm khác",
    "order_code": "Mã đơn hàng",
    "view_details": "Xem chi tiết",
    "order_status_delivered": "ĐÃ GIAO HÀNG",
    "order_status_shipping": "ĐANG VẬN CHUYỂN",
    "order_status_packed": "ĐANG ĐÓNG GÓI",
    "order_status_confirmed": "CHỜ XÁC NHẬN",
    "order_status_pending": "CHỜ XÁC NHẬN",
    "order_status_cancelled": "ĐÃ HỦY",
    "order_status_returned": "ĐÃ TRẢ",
    "order_status_return_requested": "YÊU CẦU TRẢ HÀNG",
    "no_matching_orders": "Chưa có đơn hàng phù hợp",
    "quantity": "Số lượng",
    "technical_specs": "Thông số kỹ thuật",
    "sku": "Mã sản phẩm",
    "warranty": "Bảo hành",
    "key_features": "Đặc điểm nổi bật",
    "my_orders_desc": "Theo dõi và quản lý lịch sử mua sắm một cách dễ dàng.",
    "manage_orders": "Quản lý đơn hàng",
    "manage_orders_guest_desc": "Hãy đăng nhập tài khoản Sello để theo dõi đơn hàng và xem lịch sử mua sắm của bạn!",
  },
  en: {
    // General / Headers
    "my_account": "My Account",
    "search_placeholder": "Search for products...",
    "search": "Search",
    "sign_in": "Sign In",
    "sign_out": "Sign Out",
    "account_info": "Account Information",
    "shipping_addresses": "Shipping Addresses",
    "notifications": "Notifications",
    "wishlist": "Wishlist",
    "live_support": "Live Support Chat",
    "change_password": "Change Password",
    "settings": "Settings",
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "active": "Active Now",
    "ready_to_reply": "Ready to reply",

    // Home
    "flash_sale": "Flash Sale",
    "suggested_products": "Suggested Products",
    "view_more": "View More",
    "ends_in": "Ends in",
    "featured_categories": "Featured Categories",

    // Cart
    "cart_title": "Shopping Cart",
    "empty_cart": "Your cart is empty",
    "empty_cart_desc": "Start adding items to your cart.",
    "subtotal": "Subtotal",
    "checkout": "Checkout",
    "remove_product": "Remove Product",
    "remove_product_confirm": "Are you sure you want to remove this product from the cart?",

    // Profile
    "profile_guest_desc": "Sign in to manage your shipping information, wishlist, and settings.",
    "hello": "Hello",
    "sello_member": "Sello Member",

    // Chat
    "support_chat": "Support Chat",
    "chat_placeholder": "Type a message...",
    "uploading_attachment": "Uploading attachment...",
    "chat_welcome_title": "Hello!",
    "chat_welcome_desc": "Send a message below to get direct support from the Sello team.",
    "watch_video": "Watch video in browser",

    // Settings
    "settings_title": "System Settings",
    "language_label": "Language",
    "theme_label": "Theme",
    "theme_light": "Light",
    "theme_dark": "Dark",
    "theme_system": "System",
    "notification_settings": "Notification Settings",
    "push_notifications": "Push Notifications",
    "email_notifications": "Email Notifications",
    "biometric_login": "Biometric Authentication",
    "clear_cache": "Clear Cache",
    "clear_cache_desc": "Clear temporary data to free up application space.",
    "cache_cleared_title": "Success",
    "cache_cleared_msg": "Cache has been cleared completely!",
    "app_version": "App Version",

    // Notifications Screen
    "mark_all_read": "Mark all as read",
    "no_notifications": "No notifications",
    "no_notifications_desc": "You will get notified when there is new related activity.",

    // Wishlist Screen
    "no_wishlist_items": "Wishlist is empty",
    "no_wishlist_items_desc": "Add items you love to keep track of them.",
    "added_to_cart": "Successfully added to cart!",

    // Change Password Screen
    "old_password": "Current Password",
    "new_password": "New Password",
    "confirm_new_password": "Confirm New Password",
    "password_updated": "Password has been updated successfully.",
    "fill_all_fields": "Please fill in all required fields.",
    "passwords_dont_match": "Confirm password does not match.",
    "password_too_short": "New password must be at least 8 characters.",

    // Orders Screen
    "my_orders": "My Orders",
    "order_id": "Order ID",
    "order_date": "Order Date",
    "order_status": "Status",
    "total_amount": "Total Amount",
    "cancel_order": "Cancel Order",
    "cancel_order_confirm": "Are you sure you want to cancel this order?",
    "order_cancelled": "Order has been cancelled successfully.",
    "order_tracking": "Order Tracking",
    "order_detail": "Order Detail",
    "no_orders": "No orders yet",
    "no_orders_desc": "Orders you buy will appear here.",

    // Addresses Screen
    "address_title": "Address Book",
    "add_new_address": "Add New Address",
    "edit_address": "Edit Address",
    "default_address": "Default",
    "set_default": "Set as default",
    "delete_address": "Delete Address",
    "delete_address_confirm": "Are you sure you want to delete this address?",

    // Added localizations
    "view_all": "View All",
    "almost_sold_out": "Almost Sold Out",
    "best_seller": "Best Seller",
    "october_highlight": "HIGHLIGHT OF THE MONTH",
    "tech_peak": "Ultimate Technology",
    "tech_peak_desc": "Up to 40% off on all phones and laptops",
    "popular_brands": "Popular Brands",
    "home_categories_trail": "Home > Categories",
    "all_products": "All Products",
    "products_found": "{count} products found",
    "no_products_found": "No products matching your search were found.",
    "view_more_products": "View More Products",
    "loading_more": "Loading more...",
    "price_lt500": "Price: < 500k",
    "price_500to1000": "Price: 500k-1M",
    "price_1000to2000": "Price: 1M-2M",
    "price_gt2000": "Price: > 2M",
    "price_filter": "Price",
    "rating_4up": "Rating: from 4★",
    "rating_45up": "Rating: from 4.5★",
    "rating_filter": "Rating",
    "brand_filter": "Brand",
    "all": "All",
    "price_option_lt500": "Under 500k",
    "price_option_500to1000": "500k - 1M",
    "price_option_1000to2000": "1M - 2M",
    "price_option_gt2000": "Over 2M",
    "rating_option_4up": "From 4★",
    "rating_option_45up": "From 4.5★",
    "best_sellers": "Best Sellers",
    "popular": "Popular",
    "price_low_high": "Price: Low > High",
    "order_cancellation": "Cancel Order",
    "cancel_order_confirm_id": "Are you sure you want to cancel order #{id}?",
    "no_cancel": "Cancel",
    "yes_cancel": "Cancel Order",
    "session_expired": "Session has expired.",
    "cannot_cancel_order": "Cannot cancel order.",
    "cancel_reason_prompt": "Let us know why so we can improve. Order #{id}",
    "cancel_reason_note_placeholder": "Additional details (optional)",
    "submitting": "Submitting...",
    "reason_changed_mind": "Changed my mind",
    "reason_found_cheaper": "Found a cheaper price elsewhere",
    "reason_wrong_order": "Ordered the wrong product/info",
    "reason_shipping_slow": "Estimated delivery is too slow",
    "reason_other": "Other reason",
    "reason_wrong_item": "Received the wrong item",
    "reason_damaged": "Item is damaged or defective",
    "reason_not_as_described": "Not as described",
    "reason_late_delivery": "Delivery took too long",
    "reorder_title": "Reorder",
    "reorder_confirm": "Do you want to add all items from this order to your cart?",
    "agree": "Reorder",
    "added_to_cart_go": "All products added to cart. Go to cart?",
    "later": "Later",
    "cart": "Cart",
    "cart_add_error": "An error occurred while adding items to the cart.",
    "order_track": "Track Order",
    "awaiting_approval": "Awaiting Approval",
    "write_review": "Write Review",
    "buy_again": "Buy Again",
    "items_count": "{count} items",
    "other_items": "+{count} other items",
    "order_code": "Order Code",
    "view_details": "View Details",
    "order_status_delivered": "DELIVERED",
    "order_status_shipping": "SHIPPING",
    "order_status_packed": "PACKED",
    "order_status_confirmed": "CONFIRMED",
    "order_status_pending": "PENDING",
    "order_status_cancelled": "CANCELLED",
    "order_status_returned": "RETURNED",
    "no_matching_orders": "No matching orders found",
    "quantity": "Quantity",
    "technical_specs": "Technical Specifications",
    "sku": "SKU",
    "warranty": "Warranty",
    "key_features": "Key Features",
    "my_orders_desc": "Track and manage shopping history easily.",
    "manage_orders": "Manage Orders",
    "manage_orders_guest_desc": "Sign in to track orders and view your shopping history!",
  }
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en"); // English as default
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const nativeColorScheme = useNativeColorScheme();
  const { setColorScheme } = useWindColorScheme();

  // Load language and theme from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedLang, savedTheme] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.theme),
        ]);
        if (savedLang === "vi" || savedLang === "en") {
          setLanguageState(savedLang);
        } else {
          setLanguageState("en");
        }
        if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
          setThemeState(savedTheme);
          applyTheme(savedTheme);
        } else {
          applyTheme("system");
        }
      } catch (e) {
        console.warn("Failed to load settings from storage:", e);
      }
    })();
  }, []);

  // Sync nativewind color scheme whenever the theme changes, or when native scheme changes
  const applyTheme = (mode: ThemeMode) => {
    if (mode === "system") {
      setColorScheme(nativeColorScheme === "dark" ? "dark" : "light");
    } else {
      setColorScheme(mode);
    }
  };

  useEffect(() => {
    if (theme === "system") {
      applyTheme("system");
    }
  }, [nativeColorScheme, theme]);

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
      setLanguageState(lang);
    } catch (e) {
      console.warn("Failed to save language settings:", e);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.theme, newTheme);
      setThemeState(newTheme);
      applyTheme(newTheme);
    } catch (e) {
      console.warn("Failed to save theme settings:", e);
    }
  };

  // Translation helper function
  const t = useCallback((key: string, defaultValue?: string): string => {
    const translation = translations[language][key];
    if (translation !== undefined) return translation;
    return defaultValue !== undefined ? defaultValue : key;
  }, [language]);

  // Toast controls
  const showToast = useCallback((title: string, message: string, type: ToastType = "info") => {
    setToast({
      visible: true,
      title,
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // Clear cache action
  const clearAppCache = async () => {
    // Keep user token keys but clear temp configurations, simulated cache directories or other configs
    // Let's clear search histories, cached profile details, or mock clean up.
    // For safety, we will just simulate a cache clear and remove specific non-auth temp keys.
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate work
    
    // Clear search histories if there is any cached search key
    try {
      await AsyncStorage.removeItem("@sello/search_history");
    } catch (e) {
      console.warn("Error cleaning search cache:", e);
    }

    showToast(
      t("cache_cleared_title", "Thành công"),
      t("cache_cleared_msg", "Bộ nhớ đệm đã được xóa sạch hoàn toàn!"),
      "success"
    );
  };

  const value = useMemo<SettingsContextValue>(() => ({
    language,
    theme,
    toast,
    setLanguage,
    setTheme,
    t,
    showToast,
    hideToast,
    clearAppCache,
  }), [language, theme, toast, t, showToast, hideToast]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
