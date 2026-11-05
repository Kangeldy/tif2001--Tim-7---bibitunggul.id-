# Client Validation Rules

| Input | Aturan saat ini | Implementasi |
|---|---|---|
| Pencarian katalog | Opsional; string bebas; pencarian tidak case-sensitive | React state + filter |
| URL gambar produk | Harus URL valid dari payload API agar gambar dapat dimuat | Browser image loader |
| Harga produk | Nilai numerik; format tampilan Rupiah | Intl.NumberFormat |

## Form autentikasi
Belum ada form login/register di baseline ini. Aturan panjang password, email, dan field wajib harus ditetapkan setelah kontrak kebutuhan/API disepakati; jangan mengarang aturan backend.
