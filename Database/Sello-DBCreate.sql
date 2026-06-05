CREATE DATABASE sello_commerce;
USE sello_commerce;

CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    gender ENUM('male','female','other') DEFAULT 'other',
    birth_date DATE,
    role ENUM('customer','admin') DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    email_opt_in BOOLEAN DEFAULT FALSE,
    member_level VARCHAR(50) DEFAULT 'standard',
    status ENUM('active','inactive','blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_otps (
    otp_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NULL,
    target_value VARCHAR(120) NOT NULL,
    purpose ENUM('register','reset_password','login_verify') NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expired_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_otps_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE TABLE categories (
    category_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE,
    image_url VARCHAR(255),
    parent_id BIGINT NULL,
    status ENUM('active','inactive') DEFAULT 'active',
    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id) REFERENCES categories(category_id)
        ON DELETE SET NULL
);

CREATE TABLE brands (
    brand_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE,
    logo_url VARCHAR(255),
    status ENUM('active','inactive') DEFAULT 'active'
);

CREATE TABLE products (
    product_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    brand_id BIGINT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE,
    sku VARCHAR(100) UNIQUE,
    short_description VARCHAR(500),
    description TEXT,
    base_price DECIMAL(12,2) NOT NULL,
    compare_price DECIMAL(12,2),
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_sold INT DEFAULT 0,
    warranty_months INT DEFAULT 0,
    status ENUM('draft','active','out_of_stock','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CONSTRAINT fk_products_brand
        FOREIGN KEY (brand_id) REFERENCES brands(brand_id)
);

CREATE TABLE product_variants (
    variant_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    sku_variant VARCHAR(100) UNIQUE,
    color VARCHAR(50),
    size VARCHAR(30),
    price DECIMAL(12,2) NOT NULL,
    stock_qty INT DEFAULT 0,
    weight DECIMAL(10,2),
    image_url VARCHAR(255),
    status ENUM('active','inactive') DEFAULT 'active',
    CONSTRAINT fk_variants_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);

CREATE TABLE product_images (
    image_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);

CREATE TABLE carts (
    cart_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    status ENUM('active','checked_out','abandoned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE cart_items (
    cart_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    selected BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_cart_items_variant
        FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
        ON DELETE SET NULL
);

CREATE TABLE addresses (
    address_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    detail_address VARCHAR(255) NOT NULL,
    address_type VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_addresses_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE vouchers (
    voucher_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    voucher_type ENUM('product','shipping','cashback') NOT NULL,
    discount_type ENUM('percent','fixed') NOT NULL,
    discount_value DECIMAL(12,2) NOT NULL,
    max_discount_value DECIMAL(12,2),
    min_order_value DECIMAL(12,2) DEFAULT 0,
    usage_limit INT DEFAULT 0,
    used_count INT DEFAULT 0,
    start_at DATETIME,
    end_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE payment_methods (
    payment_method_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    method_code VARCHAR(50) UNIQUE NOT NULL,
    method_name VARCHAR(100) NOT NULL,
    status ENUM('active','inactive') DEFAULT 'active'
);

CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    address_id BIGINT NOT NULL,
    voucher_id BIGINT NULL,
    payment_method_id BIGINT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    shipping_fee DECIMAL(12,2) DEFAULT 0,
    shipping_discount DECIMAL(12,2) DEFAULT 0,
    product_discount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    order_status ENUM('pending','confirmed','packed','shipping','delivered','cancelled','returned') DEFAULT 'pending',
    payment_status ENUM('unpaid','paid','failed','refunded') DEFAULT 'unpaid',
    note VARCHAR(255),
    placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_orders_address
        FOREIGN KEY (address_id) REFERENCES addresses(address_id),
    CONSTRAINT fk_orders_voucher
        FOREIGN KEY (voucher_id) REFERENCES vouchers(voucher_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_orders_payment_method
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id)
);

CREATE TABLE order_items (
    order_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    variant_id BIGINT NULL,
    product_name_snapshot VARCHAR(200) NOT NULL,
    variant_snapshot VARCHAR(150),
    unit_price DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_order_items_variant
        FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
        ON DELETE SET NULL
);

CREATE TABLE order_status_histories (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    updated_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_histories_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_histories_user
        FOREIGN KEY (updated_by) REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE TABLE payments (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL UNIQUE,
    payment_method_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_code VARCHAR(100),
    payment_status ENUM('pending','success','failed','refunded') DEFAULT 'pending',
    paid_at DATETIME,
    fail_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_payments_method
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id)
);

CREATE TABLE shipments (
    shipment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL UNIQUE,
    carrier_name VARCHAR(100),
    tracking_code VARCHAR(100),
    shipping_type VARCHAR(50),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    vehicle_number VARCHAR(30),
    estimated_delivery_at DATETIME,
    shipped_at DATETIME,
    delivered_at DATETIME,
    shipment_status ENUM('pending','picked','shipping','delivered','failed') DEFAULT 'pending',
    CONSTRAINT fk_shipments_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE
);

CREATE TABLE product_reviews (
    review_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_item_id BIGINT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(150),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_order_item
        FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id)
        ON DELETE SET NULL
);

CREATE TABLE review_media (
    media_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    review_id BIGINT NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    media_type ENUM('image','video') DEFAULT 'image',
    CONSTRAINT fk_review_media_review
        FOREIGN KEY (review_id) REFERENCES product_reviews(review_id)
        ON DELETE CASCADE
);

CREATE TABLE wishlists (
    wishlist_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) DEFAULT 'Yêu thích',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlists_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE wishlist_items (
    wishlist_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    wishlist_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_items_wishlist
        FOREIGN KEY (wishlist_id) REFERENCES wishlists(wishlist_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_items_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);

CREATE TABLE notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT,
    notification_type ENUM('promotion','order','system') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE search_histories (
    search_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    keyword VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_search_histories_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- Bảng lưu trữ phiên chat (mỗi user có 1 phiên chat với shop)
CREATE TABLE chat_rooms (
    room_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL, -- ID của khách hàng
    status ENUM('active', 'closed') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

 -- Bảng lưu trữ chi tiết tin nhắn
 CREATE TABLE chat_messages (
	message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
	room_id BIGINT NOT NULL,
	sender_id BIGINT NOT NULL, -- ID người gửi (có thể là User hoặc Admin)
	sender_type ENUM('customer', 'admin') NOT NULL,
	content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

ALTER TABLE chat_rooms
	ADD CONSTRAINT uq_chat_rooms_user UNIQUE (user_id);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_room_read_sender ON chat_messages(room_id, is_read, sender_type);
CREATE INDEX idx_chat_rooms_updated_at ON chat_rooms(updated_at);

ALTER TABLE users
ADD COLUMN admin_level TINYINT NULL;


-- Index cho khóa ngoại
ALTER TABLE products ADD INDEX idx_category_id (category_id);
ALTER TABLE order_items ADD INDEX idx_order_id (order_id);
ALTER TABLE order_items ADD INDEX idx_product_id (product_id);
ALTER TABLE cart_items ADD INDEX idx_cart_id (cart_id);

-- Index cho các trường hay tìm kiếm/lọc
ALTER TABLE products ADD INDEX idx_product_name (name);
-- Lệnh SQL đúng cho bảng orders:
ALTER TABLE orders ADD INDEX idx_order_status (order_status);
