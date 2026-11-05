# User Flow & Navigation Sitemap

## Sitemap
- Beranda (`#home`)
- Katalog Produk (`#products`)
  - Pencarian produk berdasarkan nama
  - Kartu produk
  - Aksi Detail (placeholder sampai endpoint detail disepakati)
- Tentang BibitUnggul (`#about`)
- Footer / kembali ke atas

## Alur katalog
1. Pengguna membuka halaman BibitUnggul.
2. Frontend meminta daftar produk melalui `GET /products`.
3. Saat request berjalan, UI menampilkan loading.
4. Jika API berhasil, data API ditampilkan.
5. Jika API gagal atau data kosong, data demo digunakan dan pemberitahuan API ditampilkan jika request gagal.
6. Pengguna mengetik kata kunci untuk menyaring nama produk.
7. Jika tidak ada kecocokan, UI menampilkan empty state.

## Catatan
Login, registrasi, checkout, dan detail produk belum menjadi alur aktif; implementasi menunggu kebutuhan dan kontrak endpoint dari tim backend.
