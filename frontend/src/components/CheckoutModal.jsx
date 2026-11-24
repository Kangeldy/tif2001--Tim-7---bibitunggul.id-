import { useState } from 'react'
import { createOrder } from '../services/api'
import { useAuth } from '../context/AuthContext'

const rupiah = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v) || 0)

const BANK_ACCOUNTS = {
  BCA: { bank: 'BCA', no: '827-0192-881', name: 'PT Bibit Unggul Indonesia', logo: '🏦' },
  BRI: { bank: 'BRI', no: '0341-01-002938-53-1', name: 'PT Bibit Unggul Indonesia', logo: '🏛️' },
  Mandiri: { bank: 'Mandiri', no: '137-00-1928374-2', name: 'PT Bibit Unggul Indonesia', logo: '💳' },
  BNI: { bank: 'BNI', no: '089-2182-938', name: 'PT Bibit Unggul Indonesia', logo: '🌐' }
}

export default function CheckoutModal({ product, quantity = 1, onClose, onSuccess }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.user_metadata?.name || '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    paymentMethod: 'cod', // 'cod' | 'transfer'
    bank: 'BCA'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const itemsSubtotal = (Number(product.price) || 0) * quantity
  const shippingFee = itemsSubtotal > 75000 ? 0 : 10000
  const grandTotal = itemsSubtotal + shippingFee

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleCopyAccount = (number) => {
    navigator.clipboard?.writeText(number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('Nama penerima wajib diisi')
    if (!form.phone.trim() || form.phone.length < 8) return setError('Nomor HP/WhatsApp aktif wajib diisi')
    if (!form.address.trim()) return setError('Alamat pengiriman lengkap wajib diisi')

    setLoading(true)
    try {
      const orderData = {
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image_url: product.image_url
        },
        quantity,
        itemsSubtotal,
        shippingFee,
        grandTotal,
        customer: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city || 'Kota Pengiriman',
          notes: form.notes,
          email: user?.email || 'pembeli@bibitunggul.id'
        },
        paymentMethod: form.paymentMethod,
        bankDetails: form.paymentMethod === 'transfer' ? BANK_ACCOUNTS[form.bank] : null
      }

      const res = await createOrder(orderData)
      const finalizedOrder = res?.data || orderData
      onSuccess(finalizedOrder)
    } catch (err) {
      setError(err.message || 'Gagal memproses pesanan. Silakan coba kembali.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#e1e9dc] overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#fbfdf9] border-b border-[#e8eee4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <div>
              <h2 className="text-base font-extrabold text-[#183d29]">Form Pembelian Bibit</h2>
              <p className="text-[11px] text-[#637d68]">Pengiriman langsung dari kebun BibitUnggul</p>
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

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* 1. Ringkasan Bibit yang Dibeli */}
          <div className="p-4 bg-[#f5f9f2] rounded-2xl border border-[#ddead3] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#4f7b44] font-bold uppercase tracking-wider block">Bibit Dipilih</span>
              <h4 className="font-extrabold text-[#1d3b29] text-sm">{product.name}</h4>
              <p className="text-xs text-[#5f7462]">
                {quantity} polybag × {rupiah(product.price)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block">Subtotal</span>
              <span className="text-base font-black text-[#2e6834]">{rupiah(itemsSubtotal)}</span>
            </div>
          </div>

          {/* 2. Informasi Pengiriman */}
          <div>
            <h3 className="text-xs font-black text-[#264e2d] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>📍</span> 1. Data Penerima & Alamat Kirim
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">Nama Lengkap Penerima *</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full border border-[#dce5d6] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#79a94b]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">No. WhatsApp / HP Aktif *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="081234567890"
                  className="w-full border border-[#dce5d6] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#79a94b]"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">Alamat Lengkap Tujuan *</label>
              <textarea
                name="address"
                required
                rows="2"
                value={form.address}
                onChange={handleChange}
                placeholder="Jl. Merdeka No. 12, RT 02 / RW 05, Kelurahan..."
                className="w-full border border-[#dce5d6] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#79a94b] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">Kota / Kabupaten</label>
                <input
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Contoh: Bandung / Surabaya / Jakarta"
                  className="w-full border border-[#dce5d6] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#79a94b]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#2c5b32] mb-1">Catatan Kurir (Opsional)</label>
                <input
                  name="notes"
                  type="text"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Contoh: Titip di pos sekuriti"
                  className="w-full border border-[#dce5d6] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#79a94b]"
                />
              </div>
            </div>
          </div>

          {/* 3. Pilihan Metode Pembayaran (COD vs Transfer) */}
          <div>
            <h3 className="text-xs font-black text-[#264e2d] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>💳</span> 2. Pilih Sistem Pembayaran
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opsi COD */}
              <label
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  form.paymentMethod === 'cod'
                    ? 'border-[#315f38] bg-[#f2f8ee] shadow-xs'
                    : 'border-[#e4ebd9] bg-white hover:bg-[#fafcfa]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    <div>
                      <span className="font-extrabold text-[#1d3b29] text-xs block">COD (Bayar di Tempat)</span>
                      <span className="text-[10px] text-[#4f7b44] font-bold">Bebas Biaya Admin</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="accent-[#315f38] mt-1"
                  />
                </div>
                <p className="text-[10px] text-[#607764] mt-2.5 leading-snug">
                  Bayar tunai kepada kurir saat bibit sampai di rumah Anda. Praktis & aman.
                </p>
              </label>

              {/* Opsi Transfer Bank */}
              <label
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  form.paymentMethod === 'transfer'
                    ? 'border-[#315f38] bg-[#f2f8ee] shadow-xs'
                    : 'border-[#e4ebd9] bg-white hover:bg-[#fafcfa]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏦</span>
                    <div>
                      <span className="font-extrabold text-[#1d3b29] text-xs block">Transfer Bank</span>
                      <span className="text-[10px] text-[#315f38] font-bold">BCA, BRI, Mandiri, BNI</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={form.paymentMethod === 'transfer'}
                    onChange={handleChange}
                    className="accent-[#315f38] mt-1"
                  />
                </div>
                <p className="text-[10px] text-[#607764] mt-2.5 leading-snug">
                  Transfer instan via Mobile Banking / ATM dengan bukti pembayaran.
                </p>
              </label>
            </div>

            {/* Jika Memilih Transfer Bank: Tampilkan Rekening & Pilihan Bank */}
            {form.paymentMethod === 'transfer' && (
              <div className="mt-3 p-4 bg-[#f8fbf5] rounded-2xl border border-[#dbe7d4] space-y-3 animate-fade-in">
                <span className="text-[11px] font-bold text-[#2e5933] block">Pilih Rekening Bank Tujuan:</span>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(BANK_ACCOUNTS).map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, bank: key }))}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        form.bank === key
                          ? 'bg-[#315f38] text-white border-[#315f38] shadow-xs'
                          : 'bg-white text-[#2c5332] border-[#d4e2cc] hover:bg-[#eef5e9]'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                {/* Info Rekening Terpilih */}
                <div className="p-3 bg-white rounded-xl border border-[#d6e4ce] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Bank {BANK_ACCOUNTS[form.bank].bank}</span>
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-[#183d29] tracking-wider block">
                      {BANK_ACCOUNTS[form.bank].no}
                    </span>
                    <span className="text-[10px] text-[#557557]">a.n {BANK_ACCOUNTS[form.bank].name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(BANK_ACCOUNTS[form.bank].no)}
                    className="px-3 py-1.5 bg-[#eff5e9] hover:bg-[#dfeccd] text-[#315f38] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? '✓ Tersalin!' : 'Salin'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Rincian Biaya & Total */}
          <div className="p-4 bg-[#fafcfa] rounded-2xl border border-[#e5edd9] space-y-2 text-xs">
            <div className="flex justify-between text-[#5e7462]">
              <span>Subtotal ({quantity} unit):</span>
              <span className="font-semibold text-[#1d3b29]">{rupiah(itemsSubtotal)}</span>
            </div>
            <div className="flex justify-between text-[#5e7462]">
              <span>Biaya Pengiriman (Ongkir):</span>
              <span className="font-semibold text-[#1d3b29]">
                {shippingFee === 0 ? <span className="text-emerald-600 font-bold">GRATIS</span> : rupiah(shippingFee)}
              </span>
            </div>
            {shippingFee === 0 && (
              <span className="text-[10px] text-emerald-600 font-semibold block">🎉 Promo Gratis Ongkir Pembelian di atas Rp 75.000</span>
            )}
            <div className="pt-2 border-t border-[#e2ebd8] flex justify-between items-center text-sm font-extrabold text-[#1d3b29]">
              <span>Total Tagihan:</span>
              <span className="text-base text-[#285f2f] font-black">{rupiah(grandTotal)}</span>
            </div>
          </div>

          {/* Tanya CS Sebelum Beli */}
          <div className="p-3 bg-[#f2f8ee] border border-[#cfe2c7] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">💬</span>
              <span className="text-[11px] text-[#2c5332] font-semibold">
                Ragu atau butuh konfirmasi langsung sebelum pesan?
              </span>
            </div>
            <a
              href="https://wa.me/6285171189558?text=Halo%20Admin%20BibitUnggul,%20saya%20sedang%20di%20halaman%20checkout%20dan%20ingin%20tanya%20konfirmasi%20pengiriman%20sebelum%20memesan"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-extrabold text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-300 px-2.5 py-1.5 rounded-lg text-center shadow-xs"
            >
              Chat CS (0851-7118-9558) ↗
            </a>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 text-xs font-bold text-[#627765] hover:bg-[#eff4ec] rounded-xl transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 bg-[#315f38] hover:bg-[#23482a] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer text-center"
            >
              {loading ? 'Memproses Pesanan...' : form.paymentMethod === 'cod' ? 'Konfirmasi Pesanan COD 📦' : 'Konfirmasi Pesanan Transfer 💳'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
