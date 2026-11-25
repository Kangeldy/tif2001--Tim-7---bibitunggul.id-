# Client Validation Rules — BibitUnggul

Validasi dilakukan di sisi browser untuk membantu pengguna; validasi ini tidak menggantikan validasi backend.

| Field | Aturan UI | Pesan kesalahan |
|---|---|---|
| Pencarian katalog | Opsional; string bebas; tidak case-sensitive | Empty state jika tidak cocok |
| Email login/registrasi | Format email sederhana `nama@domain.tld`; trim spasi | Masukkan email dengan format yang benar |
| Password login | Wajib diisi | Password wajib diisi |
| Nama registrasi | Minimal 2 karakter setelah trim | Nama minimal 2 karakter |
| Password registrasi | Minimal 8 karakter | Password minimal 8 karakter |
| Konfirmasi password | Harus sama dengan password | Konfirmasi password belum sama |
| Harga produk | Nilai numerik | Ditampilkan dalam format Rupiah |
| URL gambar | Mengikuti payload API/browser image loader | Gambar tidak tampil bila URL tidak valid |

## Catatan integrasi
- Form Login dan Register saat ini hanya melakukan validasi client-side.
- Setelah validasi sukses, UI menampilkan pemberitahuan bahwa integrasi menunggu endpoint backend.
- Jangan menyimpan password/token di local storage pada tahap ini.
- Validasi server tetap menjadi tanggung jawab backend.