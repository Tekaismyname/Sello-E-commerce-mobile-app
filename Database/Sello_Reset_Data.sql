USE Sello_commerce;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE addresses;
TRUNCATE TABLE auth_refresh_tokens;
TRUNCATE TABLE brands;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE categories;
TRUNCATE TABLE chat_messages;
TRUNCATE TABLE chat_rooms;
TRUNCATE TABLE notifications;
TRUNCATE TABLE order_items;
TRUNCATE TABLE order_status_histories;
TRUNCATE TABLE orders;
TRUNCATE TABLE payment_methods;
TRUNCATE TABLE payments;
TRUNCATE TABLE product_images;
TRUNCATE TABLE product_reviews;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE products;
TRUNCATE TABLE review_media;
TRUNCATE TABLE search_histories;
TRUNCATE TABLE shipments;
TRUNCATE TABLE user_activity_logs;
TRUNCATE TABLE user_otps;
TRUNCATE TABLE users;
TRUNCATE TABLE vouchers;
TRUNCATE TABLE wishlist_items;
TRUNCATE TABLE wishlists;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Chèn dữ liệu Người dùng (Đúng như Sello-Data.sql cũ để giữ nguyên các cấp độ Admin và tài khoản cũ)
INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
VALUES
  ('Nguyen Van A', 'a@gmail.com', '0900000001', '2ce74559806c5adf713122a486583fb2:b647a8733241414cb4f17cba01fa62f14d0cfaef15c1acb74d8365ec80d14d427d3bb7b214a924bc7a28466674476daf0f05c933bb252ff072bc84d6f44a07a1', 'customer', TRUE),
  ('Tran Thi B', 'b@gmail.com', '0900000002', '2ce74559806c5adf713122a486583fb2:b647a8733241414cb4f17cba01fa62f14d0cfaef15c1acb74d8365ec80d14d427d3bb7b214a924bc7a28466674476daf0f05c933bb252ff072bc84d6f44a07a1', 'customer', TRUE),
  ('Le Van C', 'c@gmail.com', '0900000003', '2ce74559806c5adf713122a486583fb2:b647a8733241414cb4f17cba01fa62f14d0cfaef15c1acb74d8365ec80d14d427d3bb7b214a924bc7a28466674476daf0f05c933bb252ff072bc84d6f44a07a1', 'customer', TRUE),
  ('Admin', 'admin@gmail.com', '0900000009', '2ce74559806c5adf713122a486583fb2:b647a8733241414cb4f17cba01fa62f14d0cfaef15c1acb74d8365ec80d14d427d3bb7b214a924bc7a28466674476daf0f05c933bb252ff072bc84d6f44a07a1', 'admin', TRUE);

INSERT INTO users (full_name, email, phone, password_hash, role, status, is_verified, admin_level)
VALUES
(
  'Admin 1',
  'admin1@gmail.com',
  '0911101112',
  '277939e03a6566a41ae1f7c0b0b7d08f:8780d5e57de1acfd7fd4bbb92baefa8b81ded570f98ab6c6a09189a3a5a277db5f93e7eabac245d010b0fcc9e5faa4c1b8403ef9225b327edf620b2313fefa6e',
  'admin',
  'active',
  1,
  1
),
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
-- 2. Chèn dữ liệu Danh mục
INSERT INTO categories (category_id, name, slug, image_url, parent_id, status)
VALUES
  (1, 'Áo Nam/Nữ', 'ao-nam-nu', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=60', NULL, 'active'),
  (2, 'Quần Thời Trang', 'quan-thoi-trang', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=60', NULL, 'active'),
  (3, 'Giày Sneakers', 'giay-sneakers', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=60', NULL, 'active'),
  (4, 'Phụ Kiện', 'phu-kien', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=60', NULL, 'active');

-- 3. Chèn dữ liệu Thương hiệu
INSERT INTO brands (brand_id, name, slug, logo_url, status)
VALUES
  (1, 'Nike', 'nike', 'https://picsum.photos/seed/brand_nike/200/100', 'active'),
  (2, 'Adidas', 'adidas', 'https://picsum.photos/seed/brand_adidas/200/100', 'active'),
  (3, 'Uniqlo', 'uniqlo', 'https://picsum.photos/seed/brand_uniqlo/200/100', 'active'),
  (4, 'Zara', 'zara', 'https://picsum.photos/seed/brand_zara/200/100', 'active'),
  (5, 'Sello Brand', 'sello-brand', 'https://picsum.photos/seed/brand_sello/200/100', 'active');

-- 4. Chèn dữ liệu Phương thức thanh toán
INSERT INTO payment_methods (payment_method_id, method_code, method_name, status)
VALUES
  (1, 'COD', 'Thanh toán khi nhận hàng', 'active'),
  (2, 'MOMO', 'Ví điện tử MoMo', 'active'),
  (3, 'CARD', 'Thẻ ngân hàng (Nội địa/Quốc tế)', 'active'),
  (4, 'PAYPAL', 'Cổng thanh toán quốc tế PayPal', 'active');

-- 5. Chèn dữ liệu 30 Sản phẩm thực tế (Đồng nhất tên và hình ảnh Unsplash)
INSERT INTO products (product_id, category_id, brand_id, name, slug, sku, short_description, description, base_price, compare_price, status)
VALUES
  -- A. ÁO NAM/NỮ (10 sản phẩm: ID 1 - 10)
  (1, 1, 1, 'Áo thun thể thao Nike Dri-FIT Classic', 'ao-thun-the-thao-nike-dri-fit-classic', 'NIKE-TS-001', 'Áo thun Dri-FIT thoáng khí màu trắng năng động.', 'Chất vải thun siêu nhẹ, thấm hút mồ hôi cực tốt thích hợp cho chạy bộ và các hoạt động thể thao ngoài trời.', 550000.00, 650000.00, 'active'),
  (2, 1, 2, 'Áo khoác thể thao Adidas Track Jacket', 'ao-khoac-the-thao-adidas-track-jacket', 'ADI-JK-002', 'Áo khoác Adidas ba sọc cổ điển màu đen.', 'Thiết kế cổ dựng thể thao nam tính, giữ ấm nhẹ nhàng, là biểu tượng thời trang đường phố huyền thoại.', 1250000.00, 1500000.00, 'active'),
  (3, 1, 3, 'Áo phông Uniqlo Supima Cotton Basic', 'ao-phong-uniqlo-supima-cotton-basic', 'UNI-TS-003', 'Áo thun Uniqlo basic dệt từ sợi bông Supima siêu mềm.', 'Kiểu dáng trơn basic phù hợp mặc lót hoặc mặc hàng ngày, bền bỉ và giữ form tốt sau nhiều lần giặt.', 299000.00, 399000.00, 'active'),
  (4, 1, 4, 'Áo sơ mi nam Zara Oxford Casual', 'ao-so-mi-nam-zara-oxford-casual', 'ZARA-SH-004', 'Áo sơ mi vải Oxford dày dặn đứng dáng lịch thiệp.', 'Thích hợp cho phong cách thường nhật lẫn công sở lịch sự, mang lại cảm giác dễ chịu thoáng mát.', 799000.00, 950000.00, 'active'),
  (5, 1, 1, 'Áo hoodie Nike Sportswear Club Fleece', 'ao-hoodie-nike-sportswear-club-fleece', 'NIKE-HD-005', 'Áo hoodie nỉ Nike ấm áp kèm mũ trùm tiện lợi.', 'Chất vải nỉ bông mịn, dày dặn giữ nhiệt hiệu quả trong thời tiết se lạnh, phong cách trẻ trung năng động.', 1450000.00, 1750000.00, 'active'),
  (6, 1, 2, 'Áo gió Adidas Windbreaker chống nước', 'ao-gio-adidas-windbreaker-chong-nuoc', 'ADI-WB-006', 'Áo khoác gió Adidas nhẹ chống tia nước và cản gió.', 'Được trang bị lớp phủ chống thấm nhẹ, mũ trùm gấp gọn, hoàn hảo cho các chuyến phượt dã ngoại.', 1100000.00, 1350000.00, 'active'),
  (7, 1, 3, 'Áo thun cổ Polo Uniqlo Dry-Ex', 'ao-thun-co-polo-uniqlo-dry-ex', 'UNI-PL-007', 'Áo thun Polo thể thao thanh lịch, vải thun lạnh khô nhanh.', 'Công nghệ Dry-Ex dệt lưới thoáng khí phần lưng, phù hợp cho người chơi golf, tennis hoặc đi làm.', 499000.00, 599000.00, 'active'),
  (8, 1, 4, 'Áo khoác măng tô dạ Zara Wool Coat', 'ao-khoac-mang-to-da-zara-wool-coat', 'ZARA-WC-008', 'Áo khoác dạ dáng dài sang trọng phong cách Ý.', 'Chất liệu len dạ cao cấp giúp giữ ấm vượt trội, đứng form dáng, tôn lên nét quý phái và thanh lịch.', 2450000.00, 2900000.00, 'active'),
  (9, 1, 3, 'Áo len cổ lọ Uniqlo Cashmere Premium', 'ao-len-co-lo-uniqlo-cashmere-premium', 'UNI-SW-009', 'Áo len cổ lọ dệt từ sợi Cashmere tự nhiên siêu ấm.', 'Chất liệu len lông cừu mềm mại, không gây ngứa cổ, giữ ấm tuyệt đối cho mùa đông.', 990000.00, 1200000.00, 'active'),
  (10, 1, 5, 'Áo thun Sello Graphic Streetwear Tee', 'ao-thun-sello-graphic-streetwear-tee', 'SEL-GT-010', 'Áo thun Local Brand Sello in họa tiết cá tính.', 'Form áo Oversize rộng rãi xu hướng unisex năng động, hình in sắc nét bền bỉ không bong tróc.', 350000.00, 450000.00, 'active'),

  -- B. QUẦN THỜI TRANG (8 sản phẩm: ID 11 - 18)
  (11, 2, 1, 'Quần Jogger Nike Tech Fleece Sporty', 'quan-jogger-nike-tech-fleece-sporty', 'NIKE-JG-011', 'Quần jogger thun nỉ ôm dáng thể thao năng động.', 'Thiết kế thon gọn ở cổ chân giúp tôn dáng giày thể thao, túi dây khóa kéo zip hông tiện lợi.', 1850000.00, 2100000.00, 'active'),
  (12, 2, 2, 'Quần Short nỉ thể thao Adidas Essentials', 'quan-short-ni-the-thao-adidas-essentials', 'ADI-SH-012', 'Quần đùi nỉ Adidas ba sọc chạy bộ tập gym.', 'Chất liệu thun nỉ da cá thoáng mát, dây rút cạp chun co giãn tối đa cho các buổi tập thể lực.', 590000.00, 690000.00, 'active'),
  (13, 2, 4, 'Quần Jeans nam Zara Slim Fit Denim', 'quan-jeans-nam-zara-slim-fit-denim', 'ZARA-JN-013', 'Quần bò nam Zara dáng ôm nhẹ màu xanh retro.', 'Chất denim co giãn nhẹ thoải mái khi vận động đứng lên ngồi xuống, màu wax nhẹ trẻ trung.', 999000.00, 1250000.00, 'active'),
  (14, 2, 4, 'Quần âu nam Zara Smart Tailored Pants', 'quan-au-nam-zara-smart-tailored-pants', 'ZARA-TP-014', 'Quần tây nam ôm chân thanh lịch kiểu dáng công sở.', 'Vải tuyết mưa đứng dáng, chống nhăn tốt, thích hợp phối với áo sơ mi hoặc áo polo đi làm.', 899000.00, 1050000.00, 'active'),
  (15, 2, 3, 'Quần Kaki Uniqlo Chino Slim Fit', 'quan-kaki-uniqlo-chino-slim-fit', 'UNI-CH-015', 'Quần kaki dáng đứng chất vải cotton bền đẹp.', 'Thiết kế túi xéo basic lịch sự phù hợp với nhiều lứa tuổi, vải kaki dệt mật độ cao ít bám bụi.', 799000.00, 950000.00, 'active'),
  (16, 2, 1, 'Quần đùi chạy bộ Nike Dri-FIT Challenger', 'quan-dui-chay-bo-nike-dri-fit-challenger', 'NIKE-RC-016', 'Quần short siêu nhẹ tích hợp quần sịp lót trong.', 'Thiết kế xẻ tà bên đùi giúp bước chạy thoải mái, túi ẩn phía sau tiện lợi đựng chìa khóa/thẻ.', 650000.00, 750000.00, 'active'),
  (17, 2, 2, 'Quần thể thao dài Adidas Tiro Track Pants', 'quan-the-thao-dai-adidas-tiro-track-pants', 'ADI-TR-017', 'Quần thun dài sọc trắng bó ống ôm thể thao.', 'Chất vải thun hai da dầy dặn co giãn bốn chiều, khóa kéo gấu quần tiện lợi tháo lắp khi mang giày.', 950000.00, 1150000.00, 'active'),
  (18, 2, 5, 'Quần túi hộp Sello Cargo Streetwear', 'quan-tui-hop-sello-cargo-streetwear', 'SEL-CG-018', 'Quần cargo kaki túi hộp cá tính bụi bặm.', 'Trang bị 6 túi hộp đa năng phong cách hiphop đường phố độc đáo, gấu quần bo chun năng động.', 480000.00, 580000.00, 'active'),

  -- C. GIÀY SNEAKERS (7 sản phẩm: ID 19 - 25)
  (19, 3, 1, 'Giày chạy bộ Nike Air Zoom Pegasus 40', 'giay-chay-bo-nike-air-zoom-pegasus-40', 'NIKE-PG-019', 'Giày chạy bộ quốc dân êm ái đàn hồi cao.', 'Đệm bọt React phản hồi lực tốt kết hợp túi khí đệm gót và mũi chân bảo vệ khớp gối runner tốt.', 3490000.00, 3990000.00, 'active'),
  (20, 3, 2, 'Giày thể thao Adidas Ultraboost Light', 'giay-the-thao-adidas-ultraboost-light', 'ADI-UB-020', 'Đệm Boost êm ái siêu nhẹ cho hoạt động cả ngày.', 'Sử dụng hạt đệm Boost cải tiến giảm trọng lượng 30% đem lại cảm giác êm chân tối đa.', 4800000.00, 5200000.00, 'active'),
  (21, 3, 4, 'Giày tây Zara Smart Chunky Leather', 'giay-tay-zara-smart-chunky-leather', 'ZARA-LS-021', 'Giày da nam Zara cổ thấp đế dày phong cách lịch lãm.', 'Chất liệu da bò thật mềm mịn, đế cao su chunky đúc cao 4cm hack dáng thanh lịch thời thượng.', 1690000.00, 1990000.00, 'active'),
  (22, 3, 3, 'Giày vải Uniqlo Canvas Slip-on Classic', 'giay-vai-uniqlo-canvas-slip-on-classic', 'UNI-SO-022', 'Giày lười vải canvas năng động đi học đi chơi.', 'Thiết kế slip-on xỏ chân nhanh chóng, chất vải canvas dày dặn thoáng mát, đế cao su chống trượt.', 499000.00, 599000.00, 'active'),
  (23, 3, 1, 'Giày thời trang Nike Air Force 1 Low All White', 'giay-thoi-trang-nike-air-force-1-low-all-white', 'NIKE-AF1-023', 'Giày sneaker Nike AF1 trắng trứ danh mọi thời đại.', 'Thiết kế da toàn bộ bền bỉ, lỗ thoáng khí mũi chân, phù hợp phối với mọi loại trang phục.', 2900000.00, 3200000.00, 'active'),
  (24, 3, 2, 'Giày thể thao Adidas Stan Smith Originals', 'giay-the-thao-adidas-stan-smith-originals', 'ADI-SS-024', 'Giày sneaker da trơn cổ điển thanh lịch gọn chân.', 'Gót giày phối xanh lục biểu tượng, chất liệu da nhân tạo Primegreen bảo vệ môi trường.', 2300000.00, 2600000.00, 'active'),
  (25, 3, 5, 'Giày thể thao Sello Sporty Runner Basic', 'giay-the-thao-sello-sporty-runner-basic', 'SEL-SR-025', 'Giày chạy bộ thời trang phom dáng gọn nhẹ êm ái.', 'Đế giữa bằng hạt xốp EVA đàn hồi cao kết hợp vải dệt Primeknit ôm khít bàn chân co giãn.', 690000.00, 850000.00, 'active'),

  -- D. PHỤ KIỆN (5 sản phẩm: ID 26 - 30)
  (26, 4, 1, 'Mũ lưỡi trai thể thao Nike Heritage86', 'mu-luoi-trai-the-thao-nike-heritage86', 'NIKE-CP-026', 'Mũ lưỡi trai kaki mềm điều chỉnh quai kim loại.', 'Form nón Heritage mềm ôm form đầu, logo kim loại Nike nhỏ góc mũ tạo nét tinh tế thời trang.', 380000.00, 450000.00, 'active'),
  (27, 4, 2, 'Balo thể thao Adidas Classic Backpack', 'balo-the-thao-adidas-classic-backpack', 'ADI-BP-027', 'Balo học sinh du lịch nhiều ngăn rộng rãi.', 'Trang bị ngăn đựng laptop chống sốc chuyên dụng, chất liệu polyester chống nước mưa nhẹ.', 750000.00, 890000.00, 'active'),
  (28, 4, 4, 'Kính râm Zara Retro Square Sunglasses', 'kinh-ram-zara-retro-square-sunglasses', 'ZARA-SG-028', 'Kính râm gọng vuông cổ điển chống tia cực tím UV400.', 'Mắt kính phân cực polaroid chống lóa tốt dưới ánh nắng hè, gọng đen bóng thời thượng cá tính.', 499000.00, 599000.00, 'active'),
  (29, 4, 4, 'Thắt lưng da nam Zara Leather Belt', 'that-lung-da-nam-zara-leather-belt', 'ZARA-BT-029', 'Dây nịt da bò Zara khóa kim loại chải xước sang trọng.', 'Mặt khóa làm bằng hợp kim không gỉ bền bỉ, bản dây 3.5cm phù hợp cho cả quần tây lẫn quần jeans.', 590000.00, 690000.00, 'active'),
  (30, 4, 5, 'Túi đeo chéo Sello Mini Streetwear Bag', 'tui-deo-cheo-sello-mini-streetwear-bag', 'SEL-MB-030', 'Túi đeo chéo mini vải Oxford chống thấm đựng điện thoại.', 'Phù hợp đeo chéo trước ngực phong cách bụi bặm, ngăn khóa kéo an toàn để bóp ví, điện thoại.', 290000.00, 390000.00, 'active');

-- 6. Chèn Hình ảnh sản phẩm (Hình ảnh đồng nhất từ Unsplash mô tả chính xác tên sản phẩm)
INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
VALUES
  -- 1. Áo thun Nike Dri-FIT Classic (White t-shirt)
  (1, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  (1, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60', FALSE, 2),
  -- 2. Áo khoác Adidas Track Jacket (Black sporty jacket)
  (2, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  (2, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=60', FALSE, 2),
  -- 3. Áo phông Uniqlo Supima Cotton Basic (Plain basic tee)
  (3, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 4. Áo sơ mi nam Zara Oxford Casual (Oxford shirt)
  (4, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 5. Áo hoodie Nike Sportswear Club Fleece (Hoodie)
  (5, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 6. Áo gió Adidas Windbreaker (Adidas windbreaker jacket)
  (6, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 7. Áo thun cổ Polo Uniqlo Dry-Ex (Black polo)
  (7, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 8. Áo khoác dạ Zara Wool Coat (Wool long overcoat)
  (8, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 9. Áo len cổ lọ Uniqlo Cashmere (Wool sweater)
  (9, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 10. Áo thun Sello Graphic Streetwear Tee (Graphic street tee)
  (10, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=60', TRUE, 1),

  -- 11. Quần Jogger Nike Tech Fleece (Sweatpants/Joggers)
  (11, 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 12. Quần Short nỉ Adidas Essentials (Sporty shorts)
  (12, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 13. Quần Jeans nam Zara Slim Fit (Blue denim jeans)
  (13, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 14. Quần âu nam Zara Smart Tailored (Formal trousers)
  (14, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 15. Quần Kaki Uniqlo Chino (Kaki/chino pants)
  (15, 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 16. Quần đùi chạy bộ Nike Dri-FIT (Running shorts)
  (16, 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 17. Quần thể thao dài Adidas Tiro (Tracksuit pants)
  (17, 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 18. Quần túi hộp Sello Cargo (Cargo pockets pants)
  (18, 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=600&auto=format&fit=crop&q=60', TRUE, 1),

  -- 19. Giày chạy bộ Nike Air Zoom Pegasus 40 (Nike running sneaker)
  (19, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 20. Giày thể thao Adidas Ultraboost Light (Adidas boost sneaker)
  (20, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 21. Giày tây Zara Smart Chunky Leather (Chunky black leather shoe)
  (21, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 22. Giày vải Uniqlo Canvas Slip-on (Canvas slipon shoe)
  (22, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 23. Giày thời trang Nike Air Force 1 Low (AF1 white sneaker)
  (23, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 24. Giày thể thao Adidas Stan Smith (Stan smith white sneaker)
  (24, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 25. Giày thể thao Sello Sporty Runner (Sporty red/black running shoe)
  (25, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60', TRUE, 1),

  -- 26. Mũ lưỡi trai Nike (Baseball cap)
  (26, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 27. Balo Adidas (Adidas backpack)
  (27, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 28. Kính râm Zara (Zara sunglasses)
  (28, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 29. Thắt lưng da Zara (Leather belt)
  (29, 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?w=600&auto=format&fit=crop&q=60', TRUE, 1),
  -- 30. Túi đeo chéo Sello (Crossbody strap bag)
  (30, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=60', TRUE, 1);

-- 7. Chèn Phiên bản sản phẩm (Variants) cho cả 30 sản phẩm để đảm bảo khả năng chọn mua
INSERT INTO product_variants (product_id, sku_variant, color, size, price, stock_qty)
VALUES
  -- Áo (ID 1-10)
  (1, 'NIKE-TS-BLK-M', 'Đen', 'M', 550000.00, 100),
  (1, 'NIKE-TS-WHT-L', 'Trắng', 'L', 550000.00, 80),
  (2, 'ADI-JK-BLK-L', 'Đen', 'L', 1250000.00, 45),
  (2, 'ADI-JK-GRY-XL', 'Xám', 'XL', 1250000.00, 30),
  (3, 'UNI-TS-WHT-S', 'Trắng', 'S', 299000.00, 150),
  (3, 'UNI-TS-BLK-M', 'Đen', 'M', 299000.00, 120),
  (4, 'ZARA-SH-WHT-M', 'Trắng', 'M', 799000.00, 60),
  (4, 'ZARA-SH-BLU-L', 'Xanh nhạt', 'L', 799000.00, 50),
  (5, 'NIKE-HD-BLK-M', 'Đen', 'M', 1450000.00, 40),
  (5, 'NIKE-HD-GRY-L', 'Xám', 'L', 1450000.00, 50),
  (6, 'ADI-WB-BLK-L', 'Đen', 'L', 1100000.00, 35),
  (7, 'UNI-PL-NVY-M', 'Xanh navy', 'M', 499000.00, 75),
  (8, 'ZARA-WC-BRW-L', 'Nâu', 'L', 2450000.00, 15),
  (9, 'UNI-SW-BLK-M', 'Đen', 'M', 990000.00, 40),
  (10, 'SEL-GT-WHT-M', 'Trắng', 'M', 350000.00, 100),
  (10, 'SEL-GT-BLK-L', 'Đen', 'L', 350000.00, 90),

  -- Quần (ID 11-18)
  (11, 'NIKE-JG-GRY-M', 'Xám', 'M', 1850000.00, 50),
  (11, 'NIKE-JG-BLK-L', 'Đen', 'L', 1850000.00, 40),
  (12, 'ADI-SH-BLK-M', 'Đen', 'M', 590000.00, 80),
  (13, 'ZARA-JN-BLU-30', 'Xanh', '30', 999000.00, 45),
  (13, 'ZARA-JN-BLK-32', 'Đen', '32', 999000.00, 40),
  (14, 'ZARA-TP-BLK-31', 'Đen', '31', 899000.00, 60),
  (15, 'UNI-CH-BEI-30', 'Beige', '30', 799000.00, 50),
  (16, 'NIKE-RC-BLK-S', 'Đen', 'S', 650000.00, 100),
  (17, 'ADI-TR-BLK-M', 'Đen', 'M', 950000.00, 70),
  (18, 'SEL-CG-GRN-L', 'Xanh rêu', 'L', 480000.00, 60),

  -- Giày (ID 19-25)
  (19, 'NIKE-PG-BLK-42', 'Đen', '42', 3490000.00, 20),
  (19, 'NIKE-PG-WHT-43', 'Trắng', '43', 3490000.00, 15),
  (20, 'ADI-UB-WHT-42', 'Trắng', '42', 4800000.00, 10),
  (20, 'ADI-UB-BLK-43', 'Đen', '43', 4800000.00, 12),
  (21, 'ZARA-LS-BLK-41', 'Đen', '41', 1690000.00, 25),
  (22, 'UNI-SO-BLK-40', 'Đen', '40', 499000.00, 50),
  (23, 'NIKE-AF1-WHT-41', 'Trắng', '41', 2900000.00, 30),
  (23, 'NIKE-AF1-WHT-42', 'Trắng', '42', 2900000.00, 35),
  (24, 'ADI-SS-WHT-42', 'Trắng', '42', 2300000.00, 25),
  (25, 'SEL-SR-RED-42', 'Đỏ', '42', 690000.00, 40),

  -- Phụ kiện (ID 26-30)
  (26, 'NIKE-CP-BLK-F', 'Đen', 'FreeSize', 380000.00, 150),
  (26, 'NIKE-CP-WHT-F', 'Trắng', 'FreeSize', 380000.00, 100),
  (27, 'ADI-BP-BLK-F', 'Đen', 'FreeSize', 750000.00, 80),
  (28, 'ZARA-SG-BLK-F', 'Đen', 'FreeSize', 499000.00, 75),
  (29, 'ZARA-BT-BRW-F', 'Nâu', 'FreeSize', 590000.00, 50),
  (30, 'SEL-MB-BLK-F', 'Đen', 'FreeSize', 290000.00, 120);

-- 8. Chèn địa chỉ mặc định cho Khách hàng
INSERT INTO addresses (user_id, recipient_name, phone, province, district, ward, detail_address, address_type, is_default, latitude, longitude)
VALUES
  (1, 'Nguyễn Văn Khách', '0900000001', 'Hồ Chí Minh', 'Quận 1', 'Bến Nghé', '123 Nguyễn Huệ', 'home', TRUE, 10.7769, 106.7009),
  (2, 'Trần Thị Khách', '0900000002', 'Hồ Chí Minh', 'Quận 3', 'Võ Thị Sáu', '456 Cách Mạng Tháng 8', 'office', TRUE, 10.7825, 106.6850);

-- 9. Chèn Giỏ hàng trống mặc định cho mỗi người dùng (Bắt buộc phải có để tránh lỗi API khi truy cập màn giỏ hàng)
INSERT INTO carts (user_id, status)
VALUES
  (1, 'active'),
  (2, 'active');

-- 10. Chèn Mã giảm giá (Vouchers) mẫu
INSERT INTO vouchers (code, name, description, voucher_type, discount_type, discount_value, max_discount_value, min_order_value, usage_limit, used_count, start_at, end_at, is_active)
VALUES
  ('SELLONEW', 'Chào mừng thành viên mới', 'Giảm ngay 10% cho đơn hàng đầu tiên tối đa 50k', 'product', 'percent', 10.00, 50000.00, 100000.00, 1000, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
  ('FREESHIP', 'Mã Miễn Phí Vận Chuyển', 'Giảm phí vận chuyển lên tới 30k', 'shipping', 'fixed', 30000.00, 30000.00, 200000.00, 5000, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE);
