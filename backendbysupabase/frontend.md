import pypandoc, os

content = r"""# Panduan Frontend — API Bibitunggul

Dokumen ini menjelaskan cara frontend menggunakan API dari collection **`bibitunggul`**. Panduan dibuat untuk pemula dan berfokus pada dua request yang sudah tersedia:

- `get_products` — mengambil daftar produk.
- `get_categories` — mengambil daftar kategori.

> **Catatan penting:** Collection ini baru berisi request **GET**. Artinya, frontend bisa membaca/menampilkan data produk dan kategori, tetapi belum bisa menambah, mengubah, atau menghapus data melalui request yang ada.

## 1. Gambaran alur aplikasi

Alur sederhananya seperti ini:

1. Pengguna membuka halaman frontend.
2. Frontend mengirim request ke API Supabase.
3. Supabase memeriksa URL, API key, izin akses tabel, dan aturan keamanan tabel (RLS).
4. Jika berhasil, Supabase mengirim data dalam format JSON.
5. Frontend membaca JSON dan menampilkan data ke halaman.
6. Jika gagal, frontend menampilkan pesan kesalahan yang mudah dipahami.

```text
Pengguna
   |
   v
Halaman Frontend
   |
   | GET /products atau GET /categories
   v
API Supabase
   |
   |-- Berhasil --> JSON --> Frontend menampilkan data
   |
   `-- Gagal ----> Pesan error ditampilkan
```

## 2. Endpoint yang tersedia

| Nama request | Method | Endpoint | Kegunaan |
|---|---|---|---|
| `get_products` | `GET` | `<<supa_url>>/products` | Mengambil daftar produk |
| `get_categories` | `GET` | `<<supa_url>>/categories` | Mengambil daftar kategori |

Method **GET** digunakan untuk mengambil data, bukan mengubah data.

### Menyiapkan `supa_url` dan `supa_key`

Ganti placeholder `<<supa_url>>` dan `<<supa_key>>` dengan nilai milik proyek Supabase.

Untuk Supabase REST API standar, format yang umum digunakan adalah:

- `supa_url`: `https://PROJECT_ID.supabase.co/rest/v1`
- `supa_key`: API key yang sesuai untuk aplikasi frontend, biasanya publishable key atau anon key pada proyek yang masih menggunakan format key lama.

Dengan format tersebut, endpoint akhirnya menjadi:

- `https://PROJECT_ID.supabase.co/rest/v1/products`
- `https://PROJECT_ID.supabase.co/rest/v1/categories`

Sesuaikan dengan konfigurasi proyek Anda. Jangan menambahkan `/rest/v1` dua kali jika URL dasar yang Anda simpan sudah memuatnya.

**Penting untuk keamanan:**
- Jangan pernah menaruh `service_role` key atau secret key di kode frontend. Kode frontend dapat dilihat oleh pengguna.
- API key publik bukan pengganti aturan keamanan. Pastikan Row Level Security (RLS) dan policy tabel Supabase sudah dikonfigurasi dengan benar.
- Pada collection, nilai header `apikey` terlihat memiliki spasi di awal (`" <<supa_key>>"`). Hapus spasi tersebut agar nilai header benar.

## 3. Header request

Collection menggunakan header berikut:

| Key | Value | Keterangan |
|---|---|---|
| `apikey` | `supa_key` | API key proyek Supabase |

Pada beberapa konfigurasi Supabase REST, request juga menggunakan header:

```http
Authorization: Bearer YOUR_SUPABASE_KEY
```

Jika request mendapat respons autentikasi atau izin akses, periksa dokumentasi dan konfigurasi proyek Anda; tambahkan header `Authorization` bila diperlukan. Jangan menaruh secret/service-role key di frontend.

## 4. Contoh implementasi JavaScript

Contoh berikut dapat dipakai di JavaScript frontend biasa. Ganti URL dasar dan API key dengan nilai proyek Anda.

```javascript
const SUPABASE_URL = "https://PROJECT_ID.supabase.co/rest/v1";
const SUPABASE_KEY = "YOUR_PUBLIC_SUPABASE_KEY";

async function getProducts() {
  try {
    const response = await fetch(`${SUPABASE_URL}/products`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil produk. Status: ${response.status}`);
    }

    const products = await response.json();
    console.log("Data produk:", products);
    return products;
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil produk:", error);
    return [];
  }
}

async function getCategories() {
  try {
    const response = await fetch(`${SUPABASE_URL}/categories`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil kategori. Status: ${response.status}`);
    }

    const categories = await response.json();
    console.log("Data kategori:", categories);
    return categories;
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil kategori:", error);
    return [];
  }
}
```

> Contoh di atas menggunakan `fetch()` bawaan browser. Jika proyek menggunakan React, Vue, atau framework lain, fungsi pengambilan data ini dapat dipanggil dari komponen atau halaman yang sesuai.

## 5. Cara menampilkan data ke halaman

Fungsi API hanya mengambil data. Setelah data didapatkan, frontend perlu membuat tampilan HTML untuk menunjukkannya.

Contoh sederhana untuk HTML biasa:

```html
<h2>Daftar Produk</h2>
<ul id="product-list"></ul>

<h2>Daftar Kategori</h2>
<ul id="category-list"></ul>

<script>
  const SUPABASE_URL = "https://PROJECT_ID.supabase.co/rest/v1";
  const SUPABASE_KEY = "YOUR_PUBLIC_SUPABASE_KEY";

  async function fetchData(tableName) {
    const response = await fetch(`${SUPABASE_URL}/${tableName}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Request ${tableName} gagal: ${response.status}`);
    }

    return response.json();
  }

  async function tampilkanData() {
    const productList = document.getElementById("product-list");
    const categoryList = document.getElementById("category-list");

    try {
      const products = await fetchData("products");
      productList.replaceChildren();

      products.forEach((product) => {
        const item = document.createElement("li");
        // Sesuaikan nama kolom dengan struktur tabel Supabase Anda.
        item.textContent = product.nama_produk ?? JSON.stringify(product);
        productList.appendChild(item);
      });

      const categories = await fetchData("categories");
      categoryList.replaceChildren();

      categories.forEach((category) => {
        const item = document.createElement("li");
        // Sesuaikan nama kolom dengan struktur tabel Supabase Anda.
        item.textContent = category.nama_kategori ?? JSON.stringify(category);
        categoryList.appendChild(item);
      });
    } catch (error) {
      console.error(error);
      productList.textContent = "Data produk belum bisa dimuat.";
      categoryList.textContent = "Data kategori belum bisa dimuat.";
    }
  }

  tampilkanData();
</script>
```

**Perhatikan:** `nama_produk` dan `nama_kategori` hanyalah contoh nama kolom. Ganti dengan nama kolom yang benar-benar ada di tabel Anda. Jika nama kolom belum diketahui, lihat struktur tabel di dashboard Supabase atau tampilkan sementara objek JSON dengan `console.log(data)`.

## 6. Memahami kode dengan bahasa sederhana

- `fetch(url, options)` mengirim request HTTP ke endpoint.
- `method: "GET"` berarti meminta data.
- `headers` mengirim informasi autentikasi/API key.
- `await` menunggu request selesai sebelum kode berikutnya dijalankan.
- `response.ok` memeriksa apakah respons HTTP berhasil.
- `response.json()` mengubah isi respons JSON menjadi data JavaScript.
- `try...catch` menangani kesalahan agar aplikasi dapat menampilkan pesan saat request gagal.
- `forEach()` menjalankan kode untuk setiap item dalam daftar.
- `document.createElement("li")` membuat elemen daftar HTML.
- `appendChild()` menambahkan elemen ke halaman.

## 7. Urutan pengerjaan untuk frontend pemula

1. Pastikan tabel `products` dan `categories` tersedia di Supabase.
2. Pastikan nama kolom tabel diketahui.
3. Isi `SUPABASE_URL` dan `SUPABASE_KEY` dengan nilai yang benar.
4. Tes endpoint `products` dan `categories` di API client terlebih dahulu.
5. Jalankan frontend dan buka Developer Tools browser (`F12`).
6. Periksa tab **Console** untuk pesan JavaScript dan tab **Network** untuk status request serta respons API.
7. Setelah data berhasil diterima, buat tampilan kartu/tabel sesuai kebutuhan desain.

## 8. Jika API gagal

| Gejala | Hal yang perlu diperiksa |
|---|---|
| `404 Not Found` | URL endpoint salah, nama tabel salah, atau `/rest/v1` belum/terduplikasi |
| `401 Unauthorized` | API key tidak benar atau header autentikasi bermasalah |
| `403 Forbidden` atau pesan permission | Policy/RLS atau izin akses tabel belum mengizinkan operasi tersebut |
| `400 Bad Request` | Parameter atau format request tidak sesuai |
| Error CORS di browser | Periksa konfigurasi akses browser dan origin proyek; jangan mengatasinya dengan menonaktifkan keamanan browser |
| Respons `[]` | Request berhasil, tetapi tidak ada baris yang dapat dilihat oleh key/policy tersebut, atau tabel memang kosong |
| Data ada tetapi nama tidak tampil | Nama kolom di kode berbeda dari nama kolom tabel |

Status HTTP saja belum selalu menjelaskan penyebab lengkap. Baca isi respons error dari Supabase untuk petunjuk lebih lanjut.

## 9. Batasan collection saat ini

Collection `bibitunggul` saat ini hanya memiliki:

- `GET /products`
- `GET /categories`

Belum ada request untuk:

- `POST` — menambah produk/kategori.
- `PATCH` — mengubah data.
- `DELETE` — menghapus data.

Jangan membuat tombol tambah, edit, atau hapus yang menganggap operasi tersebut sudah tersedia. Endpoint dan aturan aksesnya perlu disiapkan terlebih dahulu.

## 10. Checklist sebelum frontend dianggap selesai

- [ ] URL dasar Supabase benar dan tidak menggandakan `/rest/v1`.
- [ ] API key yang digunakan aman untuk frontend.
- [ ] Spasi di awal nilai header `apikey` sudah dihapus.
- [ ] Kedua endpoint dapat dipanggil dan responsnya berupa JSON.
- [ ] Nama kolom di tampilan sesuai struktur tabel.
- [ ] Ada indikator/pesan ketika data sedang dimuat atau gagal dimuat.
- [ ] RLS dan policy Supabase sudah sesuai kebutuhan aplikasi.
- [ ] Tidak ada secret key di repository frontend.

---

**Ringkasnya:** frontend memanggil endpoint `GET`, menerima JSON dari Supabase, lalu mengubah data tersebut menjadi tampilan. Collection Anda sudah menyediakan dua endpoint untuk membaca produk dan kategori; operasi tulis belum tersedia.
"""

output_path = "/mnt/data/panduan_frontend_bibitunggul.md"
pypandoc.convert_text(content, "md", format="md", outputfile=output_path, extra_args=["--standalone"])
print(f"File berhasil dibuat: {output_path}")
