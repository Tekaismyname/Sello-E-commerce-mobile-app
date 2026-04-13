use Sello_Commerce;


/* Generate all table in schema*/
SELECT CONCAT('SELECT * FROM ', table_name, ';')
FROM information_schema.tables
WHERE table_schema = 'Sello_Commerce';


/* Find table which inserted data and quanity of that */
SET SESSION group_concat_max_len = 1000000;
SELECT GROUP_CONCAT(
    CONCAT('SELECT "', table_name, '" AS table_name, COUNT(*) AS total FROM ', table_name)
    SEPARATOR ' UNION ALL '
) INTO @sql
FROM information_schema.tables
WHERE table_schema = 'Sello_commerce';

PREPARE stmt FROM @sql;
EXECUTE stmt;

SELECT * FROM addresses;
SELECT * FROM brands;
SELECT * FROM cart_items;
SELECT * FROM carts;
SELECT * FROM categories;
SELECT * FROM notifications;
SELECT * FROM order_items;
SELECT * FROM order_status_histories;
SELECT * FROM orders;
SELECT * FROM payment_methods;
SELECT * FROM payments;
SELECT * FROM product_images;
SELECT * FROM product_reviews;
SELECT * FROM product_variants;
SELECT * FROM products;
SELECT * FROM review_media;
SELECT * FROM search_histories;
SELECT * FROM shipments;
SELECT * FROM user_otps;
SELECT * FROM users;
SELECT * FROM vouchers;
SELECT * FROM wishlist_items;
SELECT * FROM wishlists;


DESCRIBE users;
DESCRIBE user_otps;

UPDATE users
SET role = 'admin',
    status = 'active',
    is_verified = 1,
    admin_level = 1
WHERE email = 'admin@gmail.com';

