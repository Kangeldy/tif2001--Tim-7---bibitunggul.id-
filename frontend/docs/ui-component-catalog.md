# UI Component Catalog — BibitUnggul

> Dokumentasi baseline komponen. Komponen masih berupa bagian JSX di App.jsx; pemisahan menjadi reusable component dapat dilakukan pada iterasi berikutnya.

| Elemen | Fungsi | Status visual |
|---|---|---|
| Brand / Navbar | Identitas dan navigasi Beranda, Produk, Tentang | Normal, hover, focus |
| Button Primary | CTA menuju katalog | Normal, hover |
| Search Input | Filter katalog berdasarkan nama produk | Empty, typing |
| Product Card | Menampilkan gambar/emoji, kategori, nama, deskripsi, harga | Normal, hover |
| Product Tag | Label kategori produk | Default |
| Loading State | Feedback ketika GET /products berlangsung | Loading |
| API Notice | Informasi API gagal dan katalog demo digunakan | Error / fallback |
| Empty State | Menampilkan pesan ketika pencarian tidak cocok | Empty |
| Footer | Identitas dan navigasi kembali ke atas | Normal |

## Styling
- Warna utama: hijau gelap `#315f38`
- Aksen: hijau `#80a952`
- Background: `#fbfcf8`
- Font: Manrope (heading), DM Sans (body)
- Layout: grid 4 kolom desktop, 2 kolom mobile; breakpoint 900px dan 560px.

## Accessibility
- Navigasi menggunakan elemen `nav` dan link anchor.
- Search input memiliki `aria-label`.
- Tombol detail produk memiliki label aksesibel.
- Status loading/error/empty ditampilkan sebagai teks.
