import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductById, getProducts } from '../services/api'
import CheckoutModal from '../components/CheckoutModal'
import OrderSuccessModal from '../components/OrderSuccessModal'

const rupiah = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v) || 0)

const PLANT_EMOJIS = ['🌶️', '🍅', '🍆', '🍈', '🍊', '🥭', '🥬', '🌿']

const VARIATIONS = [
  { id: 'single', name: '1 Polybag (Standar)', multiplier: 1, label: 'Satuan', desc: 'Bibit tunggal siap tanam' },
  { id: 'trio', name: 'Paket 3 Polybag (Hemat 10%)', multiplier: 2.7, label: 'Hemat 10%', desc: '3 polybag bibit pilihan' },
  { id: 'combo', name: 'Paket 5 + Pupuk Organik', multiplier: 4.2, label: '🔥 Paling Laris', desc: '5 bibit + 1 pack pupuk kompos alami' }
]

export default function ProductDetailPage() {
  const { id } = useParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [selectedVar, setSelectedVar] = useState(VARIATIONS[0])
  const [activeThumb, setActiveThumb] = useState(0)
  const [cartToast, setCartToast] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // Checkout & Order State
  const [checkoutData, setCheckoutData] = useState(null)
  const [completedOrder, setCompletedOrder] = useState(null)

  // Live Flash Sale countdown (like Shopee reference)
  const [countdown, setCountdown] = useState({ hours: '00', minutes: '13', seconds: '17' })

  useEffect(() => {
    let totalSec = 13 * 60 + 17
    const interval = setInterval(() => {
      totalSec--
      if (totalSec <= 0) totalSec = 4 * 3600
      const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
      const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
      const s = String(totalSec % 60).padStart(2, '0')
      setCountdown({ hours: h, minutes: m, seconds: s })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let active = true
    getProductById(id)
      .then(res => {
        if (active && res?.data) {
          setProduct(res.data)
        } else {
          // Fallback to fetch all and find
          getProducts().then(r => {
            const list = Array.isArray(r) ? r : r?.data || []
            const found = list.find(p => String(p.id) === String(id)) || list[0]
            if (active && found) setProduct(found)
          })
        }
      })
      .catch(() => {
        getProducts().then(r => {
          const list = Array.isArray(r) ? r : r?.data || []
          const found = list.find(p => String(p.id) === String(id)) || list[0]
          if (active && found) setProduct(found)
        })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf6] flex items-center justify-center text-sm text-gray-500 font-sans">
        Memuat detail produk Shopee Style...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8faf6] flex flex-col items-center justify-center p-4 text-center font-sans">
        <span className="text-4xl mb-2">🌿</span>
        <h2 className="text-lg font-bold text-[#1d3b29]">Produk Tidak Ditemukan</h2>
        <Link to="/" className="mt-4 px-4 py-2 bg-[#315f38] text-white text-xs font-bold rounded-xl">
          ← Kembali ke Beranda
        </Link>
      </div>
    )
  }

  const basePrice = Number(product.price) || 15000
  const currentPrice = Math.round(basePrice * selectedVar.multiplier)
  const originalPrice = Math.round(currentPrice * 1.45)
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
    setCheckoutData({ product: customizedProduct, quantity: qty })
  }

  const thumbnails = [
    { label: 'Tampak Utama', icon: product.image_url ? null : PLANT_EMOJIS[0] },
    { label: 'Akar & Polybag', icon: '🌱' },
    { label: 'Daun Segar', icon: '🌿' },
    { label: 'Hasil Panen', icon: '🌾' }
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#222] font-sans pb-12">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-extrabold text-[#183d29] tracking-tight">
            <span className="text-2xl">🌱</span>
            Bibit<span className="text-[#79a94b]">Unggul</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-[#52744b] font-bold hover:underline">
              ← Kembali ke Katalog
            </Link>
            <a
              href="https://wa.me/6285171189558?text=Halo%20CS%20Admin%20BibitUnggul,%20saya%20ingin%20tanya%20produk."
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-[#25D366] text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
            >
              <span>💬</span> CS WA 0851-7118-9558
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-4">
        {/* Breadcrumbs Bar */}
        <div className="py-2.5 text-xs text-gray-500 flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
          <Link to="/" className="font-semibold text-[#ee4d2d] hover:underline">BibitUnggul</Link>
          <span>&gt;</span>
          <Link to="/" className="hover:underline">Bibit Tanaman</Link>
          <span>&gt;</span>
          <span className="hover:underline">{product.category || 'Sayuran'}</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* Shopee Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 mt-2">
          {/* ================= LEFT COLUMN: GALLERY ================= */}
          <div className="md:col-span-5 flex flex-col items-center">
            {/* Big Main Image */}
            <div className="w-full aspect-square bg-[#fbfdfa] border border-gray-200 rounded-xl relative flex items-center justify-center overflow-hidden group shadow-xs">
              <span className="absolute top-3 left-3 bg-[#ee4d2d] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                -45% OFF
              </span>

              <div className="text-9xl drop-shadow-md group-hover:scale-105 transition-transform duration-300">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{thumbnails[activeThumb].icon || '🌱'}</span>
                )}
              </div>

              <span className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2.5 py-0.5 rounded-full backdrop-blur-xs font-medium">
                BibitUnggul Official
              </span>
            </div>

            {/* Thumbnail Strip */}
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
                >
                  <span>{t.icon || '🌱'}</span>
                  <span className="text-[9px] text-gray-500 font-medium truncate w-full text-center px-0.5">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Favorit & Share */}
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

            {/* Trust Assurance */}
            <div className="w-full mt-3 p-3.5 bg-[#fbfdfa] rounded-xl border border-[#ddead3] flex items-center gap-2.5 text-[11px] text-[#2c5332]">
              <span className="text-xl">🛡️</span>
              <div>
                <span className="font-extrabold block text-[#1d3b29]">Garansi 100% Bibit Hidup</span>
                <span className="text-gray-500 text-[10px]">Ganti bibit baru gratis jika rusak/layu di perjalanan</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PRODUCT DETAIL & BUY ================= */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            {/* Title & Star Rating */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#ee4d2d] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                  Star+
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-[#222] leading-snug">
                  {product.name} | Benih Bibit Unggul Siap Tanam Cepat Berbuah Adaptif Tropis
                </h1>
              </div>

              {/* Rating, Penilaian & Terjual */}
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

            {/* FLASH SALE ORANGE BANNER */}
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

              {/* Price Box */}
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

            {/* Jaminan Shopee / BibitUnggul */}
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

            {/* Pilihan Variasi Paket */}
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

            {/* Cart Toast Notification */}
            {cartToast && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl text-center animate-fade-in">
                ✓ Bibit berhasil ditambahkan ke keranjang belanja Anda!
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleConsultCS}
                className="py-3 px-3.5 bg-[#effaf2] hover:bg-[#dcf4e2] text-[#2c5b32] border border-[#a1d7ad] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span className="text-base">💬</span>
                <span>Chat CS (0851-7118-9558)</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="py-3 px-4 bg-[#ffedea] hover:bg-[#ffdfd8] text-[#ee4d2d] border border-[#ffb6a6] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span className="text-base">🛒</span>
                <span>Keranjang</span>
              </button>

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
      </main>

      {/* Checkout Modal */}
      {checkoutData && (
        <CheckoutModal
          product={checkoutData.product}
          quantity={checkoutData.quantity}
          onClose={() => setCheckoutData(null)}
          onSuccess={(order) => {
            setCheckoutData(null)
            setCompletedOrder(order)
          }}
        />
      )}

      {/* Order Success Modal */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </div>
  )
}
