# Dokumentasi Backend - bibitunggul.id (Pertemuan 11)

Dokumentasi ini mencakup endpoint CRUD lengkap, dukungan kueri dinamis (`ILIKE`, filter rentang, sorting), paginasi (`LIMIT`/`OFFSET`), metadata paginasi JSON, dan standardisasi skema database Supabase.

---

## 1. Menjalankan Server & Testing

```bash
# Masuk ke direktori backend
cd backend

# Menjalankan unit & integration test
npm test

# Menjalankan server development
npm run dev
```

---

## 2. Standardisasi Database Supabase (9 Tabel)

Seluruh tabel telah distandardisasi menggunakan `id SERIAL PRIMARY KEY`, `TIMESTAMPTZ`, index Foreign Key, trigger `updated_at`, dan Row Level Security (RLS):
1. `users` (id SERIAL PK, email UNIQUE, role customer/admin)
2. `categories` (id SERIAL PK, slug UNIQUE)
3. `addresses` (id SERIAL PK, user_id FK users)
4. `products` (id SERIAL PK, category_id FK categories, slug UNIQUE, price, stock)
5. `carts` (id SERIAL PK, user_id FK users UNIQUE)
6. `cart_items` (id SERIAL PK, cart_id FK carts, product_id FK products)
7. `orders` (id SERIAL PK, user_id FK users, address_id FK addresses, order_number UNIQUE)
8. `order_items` (id SERIAL PK, order_id FK orders, product_id FK products)
9. `reviews` (id SERIAL PK, product_id FK products, user_id FK users)

File skema & migrasi:
- `erd_database/supabase_schema.sql` (Skema DDL lengkap)
- `erd_database/fix_primary_keys_supabase.sql` (Script migrasi penyesuaian PK)

---

## 3. Spesifikasi Endpoint & Kueri Dinamis

### A. Products CRUD

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/api/products` | Mendapatkan daftar produk (filter, search, paginasi) | Public |
| `GET` | `/api/products/:id` | Mendapatkan detail produk berdasarkan ID | Public |
| `POST` | `/api/products` | Menambahkan produk baru | Admin |
| `PUT` | `/api/products/:id` | Memperbarui seluruh/sebagian data produk | Admin |
| `PATCH`| `/api/products/:id` | Memperbarui sebagian data produk | Admin |
| `DELETE`| `/api/products/:id`| Menghapus produk berdasarkan ID | Admin |

#### Query Parameters Dinamis `GET /api/products`:
- `search` / `q` : Pencarian berbasis teks dinamis dengan PostgreSQL `ILIKE` pada `name` dan `description`.
- `category` : Filter kategori tanaman berbasis `ILIKE`.
- `minPrice` : Filter batas bawah harga (`gte`).
- `maxPrice` : Filter batas atas harga (`lte`).
- `inStock=true` : Hanya menampilkan produk dengan stok > 0.
- `sortBy` : Kolom sorting (`id`, `name`, `price`, `stock`, `created_at`). Default: `id`.
- `sortOrder` : Urutan (`asc` atau `desc`). Default: `desc`.
- `page` & `limit` : Paginasi berbasis nomor halaman (misal `page=2&limit=10`).
- `offset` & `limit` : Paginasi langsung berbasis `LIMIT/OFFSET` (misal `limit=10&offset=20`).

#### Format Respons JSON & Metadata Paginasi:
```json
{
  "success": true,
  "message": "Berhasil mengambil data produk",
  "data": [
    {
      "id": 1,
      "name": "Bibit Jeruk Santang Madu",
      "category": "Buah",
      "price": 25000,
      "stock": 20
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "page": 1,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### B. Orders CRUD

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/api/orders` | Mengambil daftar pesanan (dengan paginasi & filter) | Customer / Admin |
| `GET` | `/api/orders/:id` | Mengambil detail order (ID atau order_number) | Customer / Admin |
| `POST` | `/api/orders` | Membuat pesanan baru | Public / Auth |
| `PUT` | `/api/orders/:id` | Memperbarui status / metode bayar pesanan | Admin |
| `PATCH`| `/api/orders/:id` | Memperbarui sebagian atribut pesanan | Admin |
| `DELETE`| `/api/orders/:id`| Menghapus data pesanan | Admin |

#### Query Parameters `GET /api/orders`:
- `status` : Filter status pesanan menggunakan `ILIKE` (`pending`, `paid`, `processing`, dll).
- `search` : Filter pencarian nomor order (`order_number`) menggunakan `ILIKE`.
- `email` : Filter pesanan milik user tertentu.
- `page`, `limit`, `offset` : Paginasi dengan metadata JSON lengkap.
