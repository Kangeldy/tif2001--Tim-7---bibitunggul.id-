# User Flow & Navigation Sitemap — BibitUnggul

## Sitemap
- Beranda
- Katalog Produk
  - Pencarian nama bibit
  - Kartu produk
  - Aksi Detail (placeholder)
- Masuk
  - Validasi email dan password
- Daftar
  - Validasi nama, email, password, konfirmasi password
- Tentang BibitUnggul
- Footer / kembali ke atas

## Alur katalog
1. Pengguna membuka beranda.
2. Frontend meminta daftar melalui `GET /products`.
3. Saat request berjalan, UI menampilkan loading.
4. Jika API berhasil, produk dari API ditampilkan.
5. Jika API gagal, UI memberi pemberitahuan dan memakai data demo.
6. Pengguna mencari nama bibit; hasil yang tidak cocok menampilkan empty state.

## Alur masuk
1. Pengguna klik **Masuk**.
2. Pengguna mengisi email dan password.
3. Frontend memvalidasi format email dan password wajib.
4. Jika valid, UI memberi status bahwa integrasi menunggu endpoint backend (belum mengirim kredensial).

## Alur daftar
1. Pengguna klik **Daftar**.
2. Pengguna mengisi nama, email, password, dan konfirmasi.
3. Frontend memvalidasi nama minimal 2 karakter, email, password minimal 8 karakter, serta kecocokan konfirmasi.
4. Jika valid, UI memberi status bahwa integrasi menunggu endpoint backend.

## Batas implementasi
Form autentikasi masih UI + validasi client-side; autentikasi JWT, penyimpanan akun, dan proses transaksi tidak dikerjakan pada frontend branch ini.