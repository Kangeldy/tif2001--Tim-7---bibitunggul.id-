-- ============================================================
-- bibitunggul.id - Skema Database Standar Supabase (PostgreSQL)
-- Semua tabel menggunakan id SERIAL PRIMARY KEY, TIMESTAMPTZ,
-- Foreign Key, Check Constraint, Index, Trigger updated_at, & RLS.
-- Cara pakai: Supabase Dashboard > SQL Editor > New query > Run.
-- ============================================================

-- ---------- 1. Tabel Utama ----------

CREATE TABLE IF NOT EXISTS public.users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,            -- simpan HASH bcrypt
    phone       VARCHAR(20),
    role        VARCHAR(20)  NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE,
    slug         VARCHAR(100) NOT NULL UNIQUE,
    description  TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------- 2. Tabel Relasi / Turunan ----------

CREATE TABLE IF NOT EXISTS public.addresses (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_name  VARCHAR(100) NOT NULL,
    phone           VARCHAR(20)  NOT NULL,
    full_address    TEXT         NOT NULL,
    city            VARCHAR(100) NOT NULL,
    postal_code     VARCHAR(10),
    is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id           SERIAL PRIMARY KEY,
    category_id  INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
    name         VARCHAR(150)   NOT NULL,
    slug         VARCHAR(150)   NOT NULL UNIQUE,
    description  TEXT,
    price        NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock        INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url    VARCHAR(255),
    is_active    BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.carts (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id          SERIAL PRIMARY KEY,
    cart_id     INTEGER NOT NULL REFERENCES public.carts(id)    ON DELETE CASCADE,
    product_id  INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES public.users(id)     ON DELETE CASCADE,
    address_id      INTEGER          REFERENCES public.addresses(id) ON DELETE SET NULL,
    order_number    VARCHAR(50)    NOT NULL UNIQUE,
    status          VARCHAR(30)    NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
    total_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    payment_method  VARCHAR(50),
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id            SERIAL PRIMARY KEY,
    order_id      INTEGER        NOT NULL REFERENCES public.orders(id)   ON DELETE CASCADE,
    product_id    INTEGER                 REFERENCES public.products(id) ON DELETE SET NULL,
    product_name  VARCHAR(150)   NOT NULL,        -- salinan nama saat order
    price         NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    quantity      INTEGER        NOT NULL CHECK (quantity > 0),
    subtotal      NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- 3. Index untuk Performa Query & Foreign Key ----------

CREATE INDEX IF NOT EXISTS idx_addresses_user     ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category  ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_carts_user         ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart    ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user        ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_address     ON public.orders(address_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_prod   ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product    ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user       ON public.reviews(user_id);

-- ---------- 4. Auto-update Kolom updated_at ----------

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated    ON public.users;
DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
DROP TRIGGER IF EXISTS trg_carts_updated    ON public.carts;
DROP TRIGGER IF EXISTS trg_orders_updated   ON public.orders;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON public.users    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_carts_updated    BEFORE UPDATE ON public.carts    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated   BEFORE UPDATE ON public.orders   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- 5. Row Level Security (Standar Keamanan Supabase) ----------

ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews     ENABLE ROW LEVEL SECURITY;

-- Kebijakan baca publik untuk katalog & ulasan
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);

-- ---------- 6. Data Contoh (Dummy) ----------

INSERT INTO public.categories (name, slug, description) VALUES
    ('Buah',          'buah',          'Bibit tanaman buah'),
    ('Sayuran',       'sayuran',       'Bibit tanaman sayuran'),
    ('Tanaman Hias',  'tanaman-hias',  'Bibit tanaman hias'),
    ('Rempah',        'rempah',        'Bibit tanaman rempah')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, stock) VALUES
    ((SELECT id FROM public.categories WHERE slug = 'buah'),
     'Bibit Jeruk Santang Madu', 'bibit-jeruk-santang-madu',
     'Bibit jeruk santang madu siap tanam', 25000, 20),
    ((SELECT id FROM public.categories WHERE slug = 'sayuran'),
     'Bibit Cabai Rawit', 'bibit-cabai-rawit',
     'Bibit cabai rawit unggul', 5000, 100),
    ((SELECT id FROM public.categories WHERE slug = 'sayuran'),
     'Bibit Tomat Unggul', 'bibit-tomat-unggul',
     'Bibit tomat unggul siap tanam', 7000, 50)
ON CONFLICT (slug) DO NOTHING;
