CREATE TABLE users (
                       id uuid PRIMARY KEY,
                       first_name varchar(60) NOT NULL,
                       last_name varchar(60) NOT NULL,
                       email varchar(255) NOT NULL UNIQUE,
                       password_hash varchar(255) NOT NULL,
                       role varchar(20) NOT NULL,
                       email_verified boolean NOT NULL,
                       phone varchar(30),
                       address varchar(500),
                       active boolean NOT NULL,
                       created_at timestamptz NOT NULL
);

CREATE TABLE categories (
                            id uuid PRIMARY KEY,
                            name varchar(255) NOT NULL UNIQUE,
                            description varchar(500),
                            active boolean NOT NULL
);

CREATE TABLE products (
                          id uuid PRIMARY KEY,
                          name varchar(160) NOT NULL,
                          description varchar(4000) NOT NULL,
                          price numeric(12,2) NOT NULL,
                          discount_price numeric(12,2),
                          brand varchar(255) NOT NULL,
                          sku varchar(255) NOT NULL UNIQUE,
                          stock_quantity integer NOT NULL,
                          image_url varchar(500),
                          active boolean NOT NULL,
                          category_id uuid NOT NULL REFERENCES categories(id),
                          version bigint NOT NULL,
                          created_at timestamptz NOT NULL,
                          updated_at timestamptz
);

CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_product_sku ON products(sku);

CREATE TABLE carts (
                       id uuid PRIMARY KEY,
                       user_id uuid NOT NULL UNIQUE REFERENCES users(id)
);

CREATE TABLE cart_items (
                            id uuid PRIMARY KEY,
                            cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
                            product_id uuid NOT NULL REFERENCES products(id),
                            quantity integer NOT NULL,
                            UNIQUE(cart_id, product_id)
);

CREATE TABLE wishlist_items (
                                id uuid PRIMARY KEY,
                                user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                product_id uuid NOT NULL REFERENCES products(id),
                                UNIQUE(user_id, product_id)
);

CREATE TABLE orders (
                        id uuid PRIMARY KEY,
                        user_id uuid NOT NULL REFERENCES users(id),
                        status varchar(30) NOT NULL,
                        payment_status varchar(30) NOT NULL,
                        subtotal numeric(12,2),
                        discount numeric(12,2),
                        tax numeric(12,2),
                        shipping_cost numeric(12,2),
                        total numeric(12,2),
                        shipping_address varchar(1000),
                        created_at timestamptz,
                        updated_at timestamptz
);

CREATE INDEX idx_order_user ON orders(user_id);

CREATE TABLE order_items (
                             id uuid PRIMARY KEY,
                             order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                             product_id uuid NOT NULL REFERENCES products(id),
                             quantity integer NOT NULL,
                             unit_price numeric(12,2)
);

CREATE TABLE payments (
                          id uuid PRIMARY KEY,
                          order_id uuid NOT NULL UNIQUE REFERENCES orders(id),
                          status varchar(30),
                          amount numeric(12,2),
                          created_at timestamptz
);

CREATE TABLE reviews (
                         id uuid PRIMARY KEY,
                         user_id uuid NOT NULL REFERENCES users(id),
                         product_id uuid NOT NULL REFERENCES products(id),
                         rating integer NOT NULL,
                         comment varchar(1000),
                         created_at timestamptz,
                         UNIQUE(user_id, product_id)
);

CREATE TABLE auth_tokens (
                             id uuid PRIMARY KEY,
                             user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                             token varchar(120) NOT NULL UNIQUE,
                             expires_at timestamptz NOT NULL,
                             type varchar(20) NOT NULL,
                             used boolean NOT NULL
);

CREATE INDEX idx_token_value ON auth_tokens(token);

CREATE TABLE audit_logs (
                            id uuid PRIMARY KEY,
                            user_id uuid REFERENCES users(id),
                            action varchar(255),
                            entity_type varchar(255),
                            entity_id varchar(255),
                            description varchar(1000),
                            created_at timestamptz
);
