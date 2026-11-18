// ============================================================
// utils/format.ts
// Helper functions untuk formatting
// ============================================================

export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

export function formatTanggal(isoString: string): string {
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

