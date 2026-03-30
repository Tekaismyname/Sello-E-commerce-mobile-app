# 📦 E-Commerce Database & Documentation

## 📌 Overview
This branch contains the **database design** and **documentation** for the E-Commerce application.

The database is designed based on real-world e-commerce workflows, including:
- User management
- Product catalog
- Shopping cart
- Order processing
- Payment & shipping
- Reviews and additional features

---

## 🏗️ Database Structure

The system is organized into multiple logical modules:

### 👤 User Module
- `users`
- `addresses`
- `user_otps`

Handles authentication, profile management, and user-related data.

---

### 🛍️ Product Module
- `categories`
- `brands`
- `products`
- `product_variants`
- `product_images`

Manages product catalog, classification, and variations.

---

### 🛒 Cart & Order Module
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `order_status_histories`

Handles shopping flow from cart to completed order.

---

### 💳 Payment & Shipping Module
- `payments`
- `payment_methods`
- `shipments`
- `vouchers`

Manages payment processing, shipping, and discount logic.

---

### ⭐ Additional Features
- `product_reviews`
- `review_media`
- `wishlists`
- `wishlist_items`
- `notifications`
- `search_histories`

Enhances user experience and system functionality.

---

## 🧩 ERD (Entity Relationship Diagram)

The database follows a structured relationship model:

- One user → many orders  
- One order → many order items  
- One product → many variants  
- One cart → many cart items  


