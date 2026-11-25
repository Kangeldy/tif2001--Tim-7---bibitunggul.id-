-- ============================================================
-- Migrasi Perbaikan Primary Key (id SERIAL PRIMARY KEY) di Supabase
-- Gunakan script ini di Supabase SQL Editor jika tabel sudah terlanjur
-- dibuat tanpa kolom id SERIAL PRIMARY KEY pada:
-- addresses, carts, products, orders, reviews, cart_items, order_items.
-- ============================================================

DO $$
DECLARE
    tbl TEXT;
    target_tables TEXT[] := ARRAY[
        'addresses',
        'products',
        'carts',
        'cart_items',
        'orders',
        'order_items',
        'reviews'
    ];
    has_pk BOOLEAN;
    has_id_col BOOLEAN;
BEGIN
    FOREACH tbl IN ARRAY target_tables LOOP
        -- Cek apakah kolom id sudah ada
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = tbl
              AND column_name = 'id'
        ) INTO has_id_col;

        IF NOT has_id_col THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN id SERIAL;', tbl);
        ELSE
            -- Pastikan kolom id memakai sequence (SERIAL behavior) jika belum punya default
            EXECUTE format('CREATE SEQUENCE IF NOT EXISTS public.%I_id_seq OWNED BY public.%I.id;', tbl, tbl);
            EXECUTE format(
                'SELECT setval(''public.%I_id_seq'', COALESCE((SELECT MAX(id) FROM public.%I), 0) + 1, false);',
                tbl, tbl
            );
            EXECUTE format(
                'ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT nextval(''public.%I_id_seq'');',
                tbl, tbl
            );
            EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET NOT NULL;', tbl);
        END IF;

        -- Cek apakah tabel sudah memiliki PRIMARY KEY
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints
            WHERE table_schema = 'public'
              AND table_name = tbl
              AND constraint_type = 'PRIMARY KEY'
        ) INTO has_pk;

        IF NOT has_pk THEN
            EXECUTE format('ALTER TABLE public.%I ADD PRIMARY KEY (id);', tbl);
        END IF;
    END LOOP;
END $$;
    w