// ============================================================
// pages/bibit/TambahBibitPage.tsx
// ============================================================
import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBibit } from '@/services/bibitService';
import { getKategori } from '@/services/kategoriService';
import type { Kategori } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function TambahBibitPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [form, setForm] = useState({
    name: '', slug: '', stock: '', price: '', description: '', category_id: '',
  });

  useEffect(() => {
    getKategori().then(({ data }) => { if (data) setKategoriList(data); });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await createBibit({
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      stock: Number(form.stock),
      price: Number(form.price),
      description: form.description,
      category_id: Number(form.category_id),
      is_active: true,
    });
    setLoading(false);
    if (error) return setError(error);
    navigate('/bibit');
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800">Tambah Bibit</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bibit</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">-- Pilih Kategori --</option>
              {kategoriList.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Simpan</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/bibit')}>Batal</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

