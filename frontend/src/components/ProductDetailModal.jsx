import { useState, useEffect } from 'react'

const rupiah = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v) || 0)

const PLANT_EMOJIS = ['🌶️', '🍅', '🍆', '🍈', '🍊', '🥭', '🥬', '🌿']

const VARIATIONS = [
  { id: 'single', name: '1 Polybag (Standar)', multiplier: 1, label: 'Satuan', desc: 'Bibit tunggal siap tanam' },
  { id: 'trio', name: 'Paket 3 Polybag (Hemat 10%)', multiplier: 2.7, label: 'Hemat 10%', desc: '3 polybag bibit pilihan' },
  { id: 'combo', name: 'Paket 5 + Pupuk Organik', multiplier: 4.2, label: '🔥 Paling Laris', desc: '5 bibit + 1 pack pupuk kompos alami' }
]

export default function ProductDetailModal({ product, onClose, onBuyNow }) {
  const [qty, setQty] = useState(1)
  const [selectedVar, setSelectedVar] = useState(VARIATIONS[0])
  const [activeThumb, setActiveThumb] = useState(0)
  const [cartToast, setCartToast] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // Live Flash Sale countdown (just like Shopee reference)
  const [countdown, setCountdown] = useState({ hours: '00', minutes: '13', seconds: '17' })

  useEffect(() => {
    let totalSec = 13 * 60 + 17
    const interval = setInterval(() => {
      totalSec--
      if (totalSec <= 0) totalSec = 4 * 3600 // reset loop
      const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
      const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
      const s = String(totalSec % 60).padStart(2, '0')
      setCountdown({ hours: h, minutes: m, seconds: s })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!product) return null

  const basePrice = Number(product.price) || 15000
  const currentPrice = Math.round(basePrice * selectedVar.multiplier)
  const originalPrice = Math.round(currentPrice * 1.45) // Crossed-out original price (45% markup)
  const maxStock = Math.max(1, Number(product.stock) || 45)

  const handleDecrease = () => setQty(prev => Math.max(1, prev - 1))
  const handleIncrease = () => setQty(prev => Math.min(maxStock, prev + 1))

  const subtotal = currentPrice * qty

  const handleConsultCS = () => {
    const text = encodeURIComponent(
      `Halo CS Admin BibitUnggul! Saya ingin tanya/konsultasi mengenai:\n` +
      `Produk: ${product.name}\n` +
      `Variasi: ${selectedVar.name}\n` +
      `Harga Flash Sale: ${rupiah(currentPrice)}\n\n` +
      `Apakah stok masih tersedia dan bisa dikirim dengan sistem COD/Transfer? Terima kasih! 🌱`
    )
    window.open(`https://wa.me/6285171189558?text=${text}`, '_blank')
  }

  const handleAddToCart = () => {
    setCartToast(true)
    setTimeout(() => setCartToast(false), 3000)
  }

  const handleDirectBuy = () => {
    const customizedProduct = {
      ...product,
      name: `${product.name} (${selectedVar.name})`,
      price: currentPrice
    }
    onBuyNow(customizedProduct, qty)
  }

  const thumbnails = [
    { label: 'Tampak Utama', icon: product.image_url ? null : PLANT_EMOJIS[0] },
    { label: 'Akar & Polybag', icon: '🌱' },
    { label: 'Daun Segar', icon: '🌿' },
    { label: 'Hasil Panen', icon: '🌾' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[96vh] flex flex-col text-[#222]">
        {/* Top Header / Breadcrumbs Bar */}
        <div className="px-5 py-3 bg-[#fafafa] border-b border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="font-semibold text-[#ee4d2d] cursor-pointer hover:underline">BibitUnggul</span>
            <span>&gt;</span>
            <span className="cursor-pointer hover:underline">Bibit Tanaman</span>
            <span>&gt;</span>
            <span className="cursor-pointer hover:underline">{product.category || 'Sayuran'}</span>
            <span>&gt;</span>
            <span className="text-gray-700 font-medium truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Modal Main Body (Shopee Style 2-Columns) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white">
          {/* ================= LEFT COLUMN: GALLERY & PREVIEW ================= */}
          <div className="md:col-span-5 flex flex-col items-center">
            {/* Main Picture Frame */}
            <div className="w-full aspect-square bg-[#f8faf7] border border-gray-200 rounded-xl relative flex items-center justify-center overflow-hidden group shadow-xs">
              <span className="absolute top-2.5 left-2.5 bg-[#ee4d2d] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                -45% OFF
              </span>

              {/* Central Emoji / Image Display */}
              <div className="text-8xl drop-shadow-md group-hover:scale-105 transition-transform duration-300">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{thumbnails[activeThumb].icon || '🌱'}</span>
                )}
              </div>

              {/* Watermark / Tag */}
              <span className="absolute bottom-2.5 right-2.5 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs font-medium">
                BibitUnggul Official
              </span>
            </div>

            {/* Thumbnail Selection Strip */}
            <div className="grid grid-cols-4 gap-2 w-full mt-3">
              {thumbnails.map((t, idx) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setActiveThumb(idx)}
                  className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xl transition-all cursor-pointer ${
                    activeThumb === idx
                      ? 'border-[#ee4d2d] bg-[#fff5f3] scale-102'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                  title={t.label}
                >
                  <span>{t.icon || '🌱'}</span>
                  <span className="text-[9px] text-gray-500 font-medium truncate w-full text-center px-0.5">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Social Proof & Share Row */}
            <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'}`}
              >
                <span>{isLiked ? '❤️' : '🤍'}</span>
                <span>Favoritkan ({isLiked ? '1.4RB' : '1.3RB'})</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Bagikan:</span>
                <span className="cursor-pointer hover:opacity-80">📱</span>
                <span className="cursor-pointer hover:opacity-80">💬</span>
                <span className="cursor-pointer hover:opacity-80">🔗</span>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="w-full mt-3 p-3 bg-[#fbfdfa] rounded-xl border border-[#ddead3] flex items-center gap-2.5 text-[11px] text-[#2c5332]">
              <span className="text-lg">🛡️</span>
              <div>
                <span className="font-extrabold block text-[#1d3b29]">Garansi 100% Bibit Segar</span>
                <span className="text-gray-500 text-[10px]">Ganti bibit baru gratis jika mati saat tiba</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: SHOPEE DETAIL & BUY ================= */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            {/* Title & Star Rating */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#ee4d2d] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                  Star+
                </span>
                <h1 className="text-base sm:text-lg font-bold text-[#222] leading-snug">
                  {product.name} | Benih Bibit Unggul Siap Tanam Cepat Berbuah Adaptif Tropis
                </h1>
              </div>

              {/* Rating, Penilaian & Terjual Strip */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <span className="text-[#ee4d2d] font-bold underline">4.9</span>
                  <span className="text-[#ee4d2d]">★★★★★</span>
                </div>
                <span className="text-gray-300">|</span>
                <div>
                  <span className="font-bold text-gray-800 underline">346</span> Penilaian
                </div>
                <span className="text-gray-300">|</span>
                <div>
                  <span className="font-bold text-gray-800">1.2RB</span> Terjual
                </div>
                <span className="text-gray-300">|</span>
                <button type="button" className="text-gray-400 hover:text-gray-600 text-[11px] ml-auto">
                  Laporkan
                </button>
              </div>
            </div>

            {/* FLASH SALE ORANGE BANNER (Exact Shopee Reference) */}
            <div className="rounded-xl overflow-hidden shadow-xs border border-[#ff8359]/30">
              <div className="bg-gradient-to-r from-[#ee4d2d] via-[#ff5722] to-[#ff7a45] px-4 py-2.5 text-white flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-sm tracking-wide">
                  <span className="text-base animate-bounce">⏰</span>
                  <span>FLASH SALE</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-[11px] text-white/90">BERAKHIR DALAM</span>
                  <div className="flex items-center gap-1 font-mono font-black">
                    <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs">{countdown.hours}</span>
                    <span>:</span>
                    <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs">{countdown.minutes}</span>
                    <span>:</span>
                    <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs">{countdown.seconds}</span>
                  </div>
                </div>
              </div>

              {/* Big Price Display Box */}
              <div className="bg-[#fafafa] p-4 flex flex-wrap items-baseline gap-3">
                <span className="text-xs text-gray-400 line-through font-medium">
                  {rupiah(originalPrice)}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#ee4d2d]">
                  {rupiah(currentPrice)}
                </span>
                <span className="bg-[#ffe8e4] text-[#ee4d2d] text-[11px] font-bold px-2 py-0.5 rounded border border-[#ffc8be]">
                  🎟️ Dengan Voucher
                </span>
              </div>
            </div>

            {/* Voucher Toko Row */}
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="w-24 text-gray-400 shrink-0">Voucher Toko</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-[#fff0ed] text-[#ee4d2d] font-bold text-[11px] px-2.5 py-1 rounded border border-[#ffcfc5]">
                  POTONGAN 50%
                </span>
                <span className="bg-[#fff0ed] text-[#ee4d2d] font-bold text-[11px] px-2.5 py-1 rounded border border-[#ffcfc5]">
                  HEMAT RP5.000
                </span>
                <span className="bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-1 rounded border border-emerald-200">
                  GRATIS ONGKIR
                </span>
              </div>
            </div>

            {/* Pengiriman Row */}
            <div className="flex items-start gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <span className="w-24 text-gray-400 shrink-0 pt-0.5">Pengiriman</span>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#1d3b29]">
                  <span className="text-base text-emerald-600">🚚</span>
                  <span>Garansi tiba 2 - 3 Hari &gt;</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Dapatkan voucher s/d Rp10.000 jika pesanan terlambat tiba.
                </p>
                <div className="text-[11px] text-[#2c5b32] font-semibold">
                  Ongkos Kirim: <strong className="text-[#ee4d2d]">Rp0 - Rp10.000</strong> (Mendukung COD & Transfer)
                </div>
              </div>
            </div>

            {/* Jaminan Shopee / BibitUnggul Row */}
            <div className="flex items-start gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <span className="w-24 text-gray-400 shrink-0">Jaminan</span>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-700 font-medium">
                <span className="inline-flex items-center gap-1">
                  <span className="text-[#ee4d2d]">🛡️</span> Bebas Pengembalian
                </span>
                <span>•</span>
                <span className="font-bold text-[#2c5b32]">COD-Cek Dulu</span>
                <span>•</span>
                <span>Garansi Bibit Hidup +</span>
              </div>
            </div>

            {/* Pilihan Variasi Paket (Like Shopee Color / Size selector) */}
            <div className="flex items-start gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <span className="w-24 text-gray-400 shrink-0 pt-1.5">Pilihan Paket</span>
              <div className="flex-1 flex flex-wrap gap-2">
                {VARIATIONS.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVar(v)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-left cursor-pointer flex flex-col ${
                      selectedVar.id === v.id
                        ? 'border-[#ee4d2d] bg-[#fff5f3] text-[#ee4d2d] ring-1 ring-[#ee4d2d]'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {selectedVar.id === v.id && <span>✓</span>}
                      {v.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">{v.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kuantitas Row */}
            <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <span className="w-24 text-gray-400 shrink-0">Kuantitas</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="w-8 h-7 bg-gray-50 hover:bg-gray-100 text-gray-700 font-black text-sm flex items-center justify-center cursor-pointer border-r border-gray-300"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-gray-800">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="w-8 h-7 bg-gray-50 hover:bg-gray-100 text-gray-700 font-black text-sm flex items-center justify-center cursor-pointer border-l border-gray-300"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  Tersisa <strong className="text-gray-700 font-bold">{maxStock}</strong> buah
                </span>
              </div>
            </div>

            {/* Subtotal Preview */}
            <div className="pt-2 flex items-center justify-between text-xs bg-[#fbfdfa] p-3 rounded-xl border border-[#e2ebd8]">
              <span className="text-gray-600 font-medium">Subtotal ({qty} pesanan):</span>
              <span className="text-base font-black text-[#ee4d2d]">{rupiah(subtotal)}</span>
            </div>

            {/* Toast Notification for Add to Cart */}
            {cartToast && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl text-center animate-fade-in">
                ✓ Bibit berhasil ditambahkan ke keranjang belanja Anda!
              </div>
            )}

            {/* BOTTOM ACTION BUTTONS (Shopee Style) */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {/* Chat CS Admin (0851-7118-9558) */}
              <button
                type="button"
                onClick={handleConsultCS}
                className="py-3 px-3.5 bg-[#effaf2] hover:bg-[#dcf4e2] text-[#2c5b32] border border-[#a1d7ad] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Tanya CS WhatsApp Sebelum Beli"
              >
                <span className="text-base">💬</span>
                <span>Chat CS (0851-7118-9558)</span>
              </button>

              {/* Masukkan Keranjang */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-4 bg-[#ffedea] hover:bg-[#ffdfd8] text-[#ee4d2d] border border-[#ffb6a6] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span className="text-base">🛒</span>
                <span>Keranjang</span>
              </button>

              {/* Beli Sekarang (Direct to Checkout Modal COD/Transfer) */}
              <button
                type="button"
                onClick={handleDirectBuy}
                className="flex-1 py-3 px-5 bg-gradient-to-r from-[#ee4d2d] to-[#ff5722] hover:from-[#d73f20] hover:to-[#ee4d2d] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡</span>
                <span>Beli Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
