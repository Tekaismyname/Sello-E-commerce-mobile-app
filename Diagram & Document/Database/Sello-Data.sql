use Sello_commerce;


/*USER insert field*/
INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
VALUES
	('Nguyen Van A', 'a@gmail.com', '0900000001', 'hashed_pw', 'customer', TRUE),
	('Tran Thi B', 'b@gmail.com', '0900000002', 'hashed_pw', 'customer', TRUE),
	('Le Van C', 'c@gmail.com', '0900000003', 'hashed_pw', 'customer', TRUE),
	('Admin', 'admin@gmail.com', '0900000009', 'hashed_pw', 'admin', TRUE);

INSERT INTO users
(full_name, email, phone, password_hash, role, status, is_verified, admin_level)
VALUES
(
  'Admin 2',
  'admin2@gmail.com',
  '0911111112',
  '277939e03a6566a41ae1f7c0b0b7d08f:8780d5e57de1acfd7fd4bbb92baefa8b81ded570f98ab6c6a09189a3a5a277db5f93e7eabac245d010b0fcc9e5faa4c1b8403ef9225b327edf620b2313fefa6e',
  'admin',
  'active',
  1,
  2
),
(
  'Admin 3',
  'admin3@gmail.com',
  '0911111113',
  '8fe4b87ae8b967925cec54ded9bfeb4d:dfa51a94b874054aa64448422b21dc0f7eb73661e8bf905e08f3ca056664c8410ede7b770039fcb66a198347036e44e8a4986d85292bf622b458a5d5e47bd0fd',
  'admin',
  'active',
  1,
  3
);




/*CATEGORIES insert field*/
INSERT INTO categories (name) VALUES
	('Áo'),
	('Quần'),
	('Giày'),
	('Phụ kiện');

/*BREAND insert field*/
INSERT INTO brands (name) VALUES
	('Nike'),
	('Adidas'),
	('Uniqlo'),
	('Zara'),
	('Local Brand');
    
/*PRODUCTS insert field*/
INSERT INTO products (category_id, brand_id, name, base_price, status)
VALUES
	(1,1,'Áo thun Nike 1',200000,'active'),
	(1,1,'Áo thun Nike 2',210000,'active'),
	(1,2,'Áo Adidas 1',220000,'active'),
	(1,3,'Áo Uniqlo 1',190000,'active'),
	(2,1,'Quần Nike 1',300000,'active'),
	(2,2,'Quần Adidas 1',320000,'active'),
	(2,3,'Quần Uniqlo 1',280000,'active'),
	(3,1,'Giày Nike 1',800000,'active'),
	(3,2,'Giày Adidas 1',900000,'active'),
	(3,3,'Giày Uniqlo 1',750000,'active'),

	(1,4,'Áo Zara 1',250000,'active'),
	(1,5,'Áo Local 1',180000,'active'),
	(2,4,'Quần Zara 1',350000,'active'),
	(2,5,'Quần Local 1',270000,'active'),
	(3,4,'Giày Zara 1',850000,'active'),

	(1,1,'Áo Nike 3',230000,'active'),
	(1,2,'Áo Adidas 2',240000,'active'),
	(1,3,'Áo Uniqlo 2',210000,'active'),
	(2,1,'Quần Nike 2',310000,'active'),
	(2,2,'Quần Adidas 2',330000,'active'),

	(3,1,'Giày Nike 2',820000,'active'),
	(3,2,'Giày Adidas 2',920000,'active'),
	(3,3,'Giày Uniqlo 2',780000,'active'),

	(4,5,'Mũ Local 1',120000,'active'),
	(4,5,'Túi Local 1',150000,'active'),
	(4,5,'Dây nịt 1',100000,'active'),

	(1,4,'Áo Zara 2',260000,'active'),
	(2,4,'Quần Zara 2',360000,'active'),
	(3,4,'Giày Zara 2',870000,'active'),
	(4,4,'Kính Zara',200000,'active');

/*PRODUCT-IMAGES insert field*/
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
	(1, 'https://picsum.photos/seed/p1a/400/400', TRUE, 1),
	(1, 'https://picsum.photos/seed/p1b/400/400', FALSE, 2),

	(2, 'https://picsum.photos/seed/p2a/400/400', TRUE, 1),
	(2, 'https://picsum.photos/seed/p2b/400/400', FALSE, 2),

	(3, 'https://picsum.photos/seed/p3a/400/400', TRUE, 1),
	(3, 'https://picsum.photos/seed/p3b/400/400', FALSE, 2),

	(4, 'https://picsum.photos/seed/p4a/400/400', TRUE, 1),
	(4, 'https://picsum.photos/seed/p4b/400/400', FALSE, 2),

	(5, 'https://picsum.photos/seed/p5a/400/400', TRUE, 1),
	(5, 'https://picsum.photos/seed/p5b/400/400', FALSE, 2),

	(6, 'https://picsum.photos/seed/p6a/400/400', TRUE, 1),
	(6, 'https://picsum.photos/seed/p6b/400/400', FALSE, 2),

	(7, 'https://picsum.photos/seed/p7a/400/400', TRUE, 1),
	(7, 'https://picsum.photos/seed/p7b/400/400', FALSE, 2),

	(8, 'https://picsum.photos/seed/p8a/400/400', TRUE, 1),
	(8, 'https://picsum.photos/seed/p8b/400/400', FALSE, 2),

	(9, 'https://picsum.photos/seed/p9a/400/400', TRUE, 1),
	(9, 'https://picsum.photos/seed/p9b/400/400', FALSE, 2),

	(10, 'https://picsum.photos/seed/p10a/400/400', TRUE, 1),
	(10, 'https://picsum.photos/seed/p10b/400/400', FALSE, 2),

	(11, 'https://picsum.photos/seed/p11a/400/400', TRUE, 1),
	(11, 'https://picsum.photos/seed/p11b/400/400', FALSE, 2),

	(12, 'https://picsum.photos/seed/p12a/400/400', TRUE, 1),
	(12, 'https://picsum.photos/seed/p12b/400/400', FALSE, 2),

	(13, 'https://picsum.photos/seed/p13a/400/400', TRUE, 1),
	(13, 'https://picsum.photos/seed/p13b/400/400', FALSE, 2),

	(14, 'https://picsum.photos/seed/p14a/400/400', TRUE, 1),
	(14, 'https://picsum.photos/seed/p14b/400/400', FALSE, 2),

	(15, 'https://picsum.photos/seed/p15a/400/400', TRUE, 1),
	(15, 'https://picsum.photos/seed/p15b/400/400', FALSE, 2),

	(16, 'https://picsum.photos/seed/p16a/400/400', TRUE, 1),
	(16, 'https://picsum.photos/seed/p16b/400/400', FALSE, 2),

	(17, 'https://picsum.photos/seed/p17a/400/400', TRUE, 1),
	(17, 'https://picsum.photos/seed/p17b/400/400', FALSE, 2),

	(18, 'https://picsum.photos/seed/p18a/400/400', TRUE, 1),
	(18, 'https://picsum.photos/seed/p18b/400/400', FALSE, 2),

	(19, 'https://picsum.photos/seed/p19a/400/400', TRUE, 1),
	(19, 'https://picsum.photos/seed/p19b/400/400', FALSE, 2),

	(20, 'https://picsum.photos/seed/p20a/400/400', TRUE, 1),
	(20, 'https://picsum.photos/seed/p20b/400/400', FALSE, 2),

	(21, 'https://picsum.photos/seed/p21a/400/400', TRUE, 1),
	(21, 'https://picsum.photos/seed/p21b/400/400', FALSE, 2),

	(22, 'https://picsum.photos/seed/p22a/400/400', TRUE, 1),
	(22, 'https://picsum.photos/seed/p22b/400/400', FALSE, 2),

	(23, 'https://picsum.photos/seed/p23a/400/400', TRUE, 1),
	(23, 'https://picsum.photos/seed/p23b/400/400', FALSE, 2),

	(24, 'https://picsum.photos/seed/p24a/400/400', TRUE, 1),
	(24, 'https://picsum.photos/seed/p24b/400/400', FALSE, 2),

	(25, 'https://picsum.photos/seed/p25a/400/400', TRUE, 1),
	(25, 'https://picsum.photos/seed/p25b/400/400', FALSE, 2),

	(26, 'https://picsum.photos/seed/p26a/400/400', TRUE, 1),
	(26, 'https://picsum.photos/seed/p26b/400/400', FALSE, 2),

	(27, 'https://picsum.photos/seed/p27a/400/400', TRUE, 1),
	(27, 'https://picsum.photos/seed/p27b/400/400', FALSE, 2),

	(28, 'https://picsum.photos/seed/p28a/400/400', TRUE, 1),
	(28, 'https://picsum.photos/seed/p28b/400/400', FALSE, 2),

	(29, 'https://picsum.photos/seed/p29a/400/400', TRUE, 1),
	(29, 'https://picsum.photos/seed/p29b/400/400', FALSE, 2),

	(30, 'https://picsum.photos/seed/p30a/400/400', TRUE, 1),
	(30, 'https://picsum.photos/seed/p30b/400/400', FALSE, 2);

/*PRODUCT-VARIANTS insert field*/
INSERT INTO product_variants (product_id, color, size, price, stock_qty)
VALUES
	(1,'Đen','M',200000,50),
	(1,'Trắng','L',200000,30),
	(2,'Xám','M',210000,40),
	(3,'Đen','L',220000,20),
	(4,'Trắng','S',190000,60),
	(5,'Đen','M',300000,25),
	(6,'Xám','L',320000,30),
	(7,'Trắng','M',280000,35),
	(8,'Đen','42',800000,10),
	(9,'Trắng','43',900000,15);

/*CARTS insert field*/
INSERT INTO carts (user_id) VALUES (1),(2);

/*CART-ITEMS insert field*/
INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
VALUES
	(1,1,2,200000),
	(1,5,1,300000),
	(2,8,1,800000);
    
/*ADDRESSES insert field*/    
INSERT INTO addresses (user_id, recipient_name, phone, province, district, ward, detail_address)
VALUES
	(1,'Nguyen Van A','0900000001','HCM','Q1','Ben Nghe','123 Nguyen Hue'),
	(2,'Tran Thi B','0900000002','HCM','Q3','Vo Thi Sau','456 Cach Mang Thang 8');


/*PAYMENT-METHODS insert field*/
INSERT INTO payment_methods (method_code, method_name)
VALUES
	('COD','Thanh toán khi nhận hàng'),
	('MOMO','Ví MoMo'),
	('CARD','Thẻ ngân hàng');

/*ORDERS insert field*/
INSERT INTO orders 
(order_code, user_id, address_id, payment_method_id, subtotal, total_amount, order_status)
VALUES
	('ORD001',1,1,1,700000,700000,'delivered'),
	('ORD002',2,2,2,800000,800000,'shipping');
  
/*ORDERS-ITEMS insert field*/
INSERT INTO order_items 
(order_id, product_id, product_name_snapshot, unit_price, quantity, line_total)
VALUES
	(1,1,'Áo thun Nike 1',200000,2,400000),
	(1,5,'Quần Nike 1',300000,1,300000),
	(2,8,'Giày Nike 1',800000,1,800000);
    
/*PRODUCT-REVIEWS insert field*/
INSERT INTO product_reviews (product_id, user_id, rating, comment)
VALUES
	(1,1,5,'Sản phẩm rất tốt'),
	(8,2,4,'Giày đẹp, giao nhanh'),
	(5,1,3,'Ổn trong tầm giá');
 
/*NOTIFICATIONS insert field*/
INSERT INTO notifications (user_id, title, content)
VALUES
	(1,'Đơn hàng đã giao','Đơn hàng #1 đã hoàn tất'),
	(2,'Đang giao hàng','Đơn hàng #2 đang trên đường');