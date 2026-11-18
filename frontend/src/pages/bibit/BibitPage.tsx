// ============================================================
// pages/bibit/BibitPage.tsx  – Daftar bibit
// ============================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBibit } from '@/services/bibitService';
import type { Bibit } from '@/types';
import { formatRupiah } from '@/utils/format';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Plus } from 'lucide-react';

export default function BibitPage() {
  const [bibit, setBibit] = useState<Bibit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBibit().then(({ data, error }) => {
      if (data) setBibit(data);
      if (error) setError(error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Data Bibit</h1>
        <Link to="/bibit/tambah">
          <Button><Plus size={16} /> Tambah Bibit</Button>
        </Link>
      </div>

      <Card>
        {loading && <p className="text-gray-500">Memuat data...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && bibit.length === 0 && (
          <p className="text-gray-500 text-center py-8">Belum ada data bibit.</p>
        )}
        {bibit.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-gray-600">
                <th className="pb-2">Nama</th>
                <th className="pb-2">Kategori</th>
                <th className="pb-2">Stok</th>
                <th className="pb-2">Harga</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bibit.map(b => (
                <tr key={b.id} className="py-2">
                  <td className="py-3 font-medium">{b.name}</td>
                  <td className="py-3 text-gray-500">{b.categories?.name ?? '-'}</td>
                  <td className="py-3">{b.stock}</td>
                  <td className="py-3">{formatRupiah(b.price)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link to={`/bibit/edit/${b.id}`}>
                      <Button variant="secondary" className="text-xs">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

