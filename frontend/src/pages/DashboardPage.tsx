// ============================================================
// pages/DashboardPage.tsx
// ============================================================
import Card from '@/components/ui/Card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Bibit">
          <p className="text-3xl font-bold text-green-700">–</p>
          <p className="text-sm text-gray-500 mt-1">jenis bibit terdaftar</p>
        </Card>
        <Card title="Transaksi Bulan Ini">
          <p className="text-3xl font-bold text-blue-600">–</p>
          <p className="text-sm text-gray-500 mt-1">transaksi tercatat</p>
        </Card>
        <Card title="Kategori">
          <p className="text-3xl font-bold text-orange-500">–</p>
          <p className="text-sm text-gray-500 mt-1">kategori aktif</p>
        </Card>
      </div>
      {/* TODO: tambahkan chart dari recharts di sini */}
    </div>
  );
}

