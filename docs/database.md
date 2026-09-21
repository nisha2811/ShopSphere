# Database

Core tables: users, categories, products, carts, cart_items, wishlist_items, orders, order_items, payments, reviews, auth_tokens and audit_logs.

Products belong to categories. Users own carts/wishlists/orders/reviews. Orders snapshot item unit prices so historical totals do not change when a product price changes. Foreign keys and unique constraints protect ownership and duplicate relationships.
