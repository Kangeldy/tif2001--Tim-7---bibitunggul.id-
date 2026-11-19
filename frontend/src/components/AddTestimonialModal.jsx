import { useState } from 'react'
import { createTestimonial } from '../services/api'

export default function AddTestimonialModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    city: '',
    product: '',
    rating: 5,
    reviewText: '',
    ssWa: '',
    waSender: '',
    waMessage: ''
  })

  const [previewImg, setPreviewImg] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Harap pilih file gambar (JPG, PNG, WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      setPreviewImg(result)
      setForm(prev => ({ ...prev, ssWa: result }))
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Nama pembeli wajib diisi')
    if (!form.reviewText.trim()) return setError('Ulasan teks wajib diisi')

    setLoading(true)
    try {
      const res = createTestimonial({
        ...form,
        ssWa: form.ssWa || previewImg || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=80'
      })
      onSuccess(res.data)
    } catch (err) {
      setError(err.message || 'Gagal menyimpan testimoni')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#e1e9dc] overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#fbfdfa] border-b border-[#e8eee4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <div>
              <h3 className="font-extrabold text-[#183d29] text-base">Tambah Testimoni "Kata Mereka"</h3>
              <p className="text-[11px] text-[#637d68]">Ulasan teks dan foto screenshot chat WhatsApp pembeli</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f7f0] hover:bg-[#e4ebd9] text-[#58705b] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-[#222] flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Nama & Kota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">Nama Pembeli *</label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Ibu Ratna Dewi"
                className="w-full border border-[#dce5d6] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#79a94b]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">Kota / Daerah Asal</label>
              <input
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Contoh: Bandung, Jawa Barat"
                className="w-full border border-[#dce5d6] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#79a94b]"
              />
            </div>
          </div>

          {/* Bibit yang Dibeli & Rating Bintang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">Bibit yang Dibeli</label>
              <input
                name="product"
                type="text"
                value={form.product}
                onChange={handleChange}
                placeholder="Contoh: Bibit Cabai Rawit & Tomat"
                className="w-full border border-[#dce5d6] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#79a94b]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">Rating Kepuasan</label>
              <select
                name="rating"
                value={form.rating}
                onChange={handleChange}
                className="w-full border border-[#dce5d6] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#79a94b] bg-white font-bold"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 / 5 Sangat Puas)</option>
                <option value="4">⭐⭐⭐⭐ (4 / 5 Puas)</option>
                <option value="3">⭐⭐⭐ (3 / 5 Cukup)</option>
              </select>
            </div>
          </div>

          {/* ULASAN TEXT DI ATASNYA */}
          <div>
            <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">
              📝 Ulasan Teks Pembeli (Ditampilkan di Atas Foto SS WA) *
            </label>
            <textarea
              name="reviewText"
              required
              rows="3"
              value={form.reviewText}
              onChange={handleChange}
              placeholder="Ceritakan kepuasan pembeli mengenai kesegaran bibit, kecepatan kirim, keamanan packing, atau hasil panen..."
              className="w-full border border-[#dce5d6] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#79a94b] resize-none"
            />
          </div>

          {/* INPUT FOTO DARI SS WA (SCREENSHOT CHAT WHATSAPP) */}
          <div className="p-4 bg-[#f8faf6] rounded-2xl border border-[#dce9d5] space-y-3">
            <div>
              <label className="block text-[11px] font-black text-[#1e4425] mb-1">
                📸 Upload Foto Screenshot Chat WhatsApp (SS WA)
              </label>
              <p className="text-[10px] text-gray-500 mb-2">
                Pilih foto bukti tangkapan layar chat WA kepuasan pembeli dari HP atau komputer:
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#315f38] file:text-white hover:file:bg-[#244c2b] file:cursor-pointer"
              />
            </div>

            {/* Opsi URL Gambar Alternatif */}
            <div>
              <span className="text-[10px] text-gray-400 block mb-1">Atau masukkan URL gambar online:</span>
              <input
                name="ssWa"
                type="url"
                value={form.ssWa}
                onChange={e => {
                  handleChange(e)
                  setPreviewImg(e.target.value)
                }}
                placeholder="https://... (URL foto SS WA)"
                className="w-full border border-[#dce5d6] bg-white rounded-xl px-3 py-2 text-xs outline-none focus:border-[#79a94b]"
              />
            </div>

            {/* Pratinjau Foto SS WA */}
            {previewImg && (
              <div className="pt-2">
                <span className="text-[10px] font-bold text-[#2c5b32] block mb-1">Pratinjau Foto SS WA:</span>
                <div className="relative rounded-xl overflow-hidden border border-[#cfe0c7] bg-black/5 max-h-48 flex items-center justify-center">
                  <img src={previewImg} alt="Pratinjau SS WA" className="max-h-48 w-auto object-contain" />
                  <span className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                    ✓ Foto Siap Ditampilkan
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Kutipan Singkat Chat WA (Opsional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">No. Kontak Pengirim (Opsional)</label>
              <input
                name="waSender"
                type="text"
                value={form.waSender}
                onChange={handleChange}
                placeholder="Contoh: +62 813-8821-xxxx"
                className="w-full border border-[#dce5d6] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#79a94b]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">Kutipan Pesan WA (Opsional)</label>
              <input
                name="waMessage"
                type="text"
                value={form.waMessage}
                onChange={handleChange}
                placeholder="Contoh: Bibit cabainya seger banget min!"
                className="w-full border border-[#dce5d6] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#79a94b]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#e8eee4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-bold text-[#627765] hover:bg-[#eff4ec] rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 bg-[#315f38] hover:bg-[#23482a] text-white font-extrabold text-xs rounded-xl shadow-md transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : '✓ Simpan & Publikasikan Testimoni'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
