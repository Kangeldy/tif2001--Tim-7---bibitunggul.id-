# BibitUnggul — Frontend

Frontend aplikasi katalog/penjualan bibit tanaman, dibangun dengan React + Vite.

## Teknologi
- React 19, Vite
- Fetch API untuk integrasi REST
- CSS responsive (mobile-first)

## Menjalankan di lokal
1. Pastikan Node.js versi LTS terpasang.
2. Masuk ke folder frontend:
   ```bash
   cd frontend
   npm install
   ```
3. Salin `.env.example` menjadi `.env` dan sesuaikan URL API:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
4. Jalankan `npm run dev`, lalu buka URL localhost dari Vite.

## Pemeriksaan
```bash
npm run lint
npm run build
npm run preview
```

## Fitur frontend
- Landing page dan navigasi.
- Katalog produk dengan pencarian nama.
- Fetch `GET /products`, loading state, demo fallback, dan pesan error API.
- Responsive desktop/mobile.

## Kontrak integrasi
- Base URL dari `VITE_API_BASE_URL`.
- Produk: `GET /products`.
- UI menerima array atau object `{ products: [] }`; field name/nama, price/harga, category/kategori, description/deskripsi, image/image_url.
- Detail, login, dan register menunggu kontrak endpoint dari backend.

## Ownership
Perubahan dokumentasi dan kode di sini hanya workspace `frontend/`. Backend, database, dan CI/CD dikelola role terkait.
