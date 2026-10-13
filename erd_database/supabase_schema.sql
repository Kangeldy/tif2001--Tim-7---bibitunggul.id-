-- ============================================================
-- bibitunggul.id - Skema database untuk Supabase (PostgreSQL)
-- Cara pakai: Supabase Dashboard > SQL Editor > New query >
-- tempel seluruh isi file ini > Run.
-- Aman dijalankan ulang (memakai IF NOT EXISTS / ON CONFLICT).
-- ============================================================

-- ---------- Tabel ----------

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,            -- simpan HASH bcrypt, bukan password asli
    phone       VARCHAR(20),
    role        VARCHAR(20)  NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin')),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS addresses (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_name  VARCHAR(100) NOT NULL,
    phone           VARCHAR(20)  NOT NULL,
    full_address    TEXT         NOT NULL,
    city            VARCHAR(100) NOT NULL,
    postal_code     VARCHAR(10),
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE,
    slug         VARCHAR(100) NOT NULL UNIQUE,
    description  TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id           SERIAL PRIMARY KEY,
    category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name         VARCHAR(150) NOT NULL,
    slug         VARCHAR(150) NOT NULL UNIQUE,
    description  TEXT,
    price        NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url    VARCHAR(255),
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id          SERIAL PRIMARY KEY,
    cart_id     INTEGER NOT NULL REFERENCES carts(id)    ON DELETE CASCADE,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_id      INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
    order_number    VARCHAR(50) NOT NULL UNIQUE,
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','processing','shipped','completed','cancelled')),
    total_amount    NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method  VARCHAR(50),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id            SERIAL PRIMARY KEY,
    order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name  VARCHAR(150) NOT NULL,          -- salinan nama saat order
    price         NUMERIC(12, 2) NOT NULL,        -- salinan harga saat order
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    subtotal      NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ---------- Index ----------

CREATE INDEX IF NOT EXISTS idx_addresses_user    ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_carts_user        ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart   ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product   ON reviews(product_id);

-- ---------- Auto-update kolom updated_at ----------

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated    ON users;
DROP TRIGGER IF EXISTS trg_products_updated ON products;
DROP TRIGGER IF EXISTS trg_orders_updated   ON orders;
CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- Keamanan: aktifkan Row Level Security ----------
-- Supabase otomatis membuka REST API untuk tabel di schema "public".
-- Tanpa RLS, siapa pun yang punya anon key bisa membaca/mengubah tabel.
-- Backend Express memakai koneksi Postgres langsung (role "postgres"),
-- yang tidak terpengaruh RLS, jadi aplikasi tetap jalan normal.

ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews     ENABLE ROW LEVEL SECURITY;

-- ---------- Data contoh (dummy) untuk testing ----------
-- Harga dan stok hanya contoh. Ganti sesuai data toko yang sebenarnya.

INSERT INTO categories (name, slug, description) VALUES
    ('Buah',          'buah',          'Bibit tanaman buah'),
    ('Sayuran',       'sayuran',       'Bibit tanaman sayuran'),
    ('Tanaman Hias',  'tanaman-hias',  'Bibit tanaman hias'),
    ('Rempah',        'rempah',        'Bibit tanaman rempah')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, price, stock) VALUES
    ((SELECT id FROM categories WHERE slug = 'buah'),
     'Bibit Jeruk Santang Madu', 'bibit-jeruk-santang-madu',
     'Bibit jeruk santang madu siap tanam', 25000, 20),
    ((SELECT id FROM categories WHERE slug = 'sayuran'),
     'Bibit Cabai Rawit', 'bibit-cabai-rawit',
     'Bibit cabai rawit unggul', 5000, 100),
    ((SELECT id FROM categories WHERE slug = 'sayuran'),
     'Bibit Tomat Unggul', 'bibit-tomat-unggul',
     'Bibit tomat unggul siap tanam', 7000, 50)
ON CONFLICT (slug) DO NOTHING;
