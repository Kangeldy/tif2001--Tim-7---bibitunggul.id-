import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts, getOrders, getTestimonials } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ProductDetailModal from '../components/ProductDetailModal'
import CheckoutModal from '../components/CheckoutModal'
import OrderSuccessModal from '../components/OrderSuccessModal'
import OrdersHistoryModal from '../components/OrdersHistoryModal'
import AddTestimonialModal from '../components/AddTestimonialModal'

const demoProducts = [
  { id: 'demo-1', name: 'Bibit Cabai Rawit Unggul', category: 'Sayuran', price: 15000, stock: 35, description: 'Bibit cabai rawit pilihan dengan pertumbuhan optimal dan buah lebat.' },
  { id: 'demo-2', name: 'Bibit Tomat Ceri Organik', category: 'Sayuran', price: 12000, stock: 28, description: 'Bibit tomat manis, segar, cocok ditanam di pot maupun pekarangan.' },
  { id: 'demo-3', name: 'Bibit Terong Ungu Hibrida', category: 'Sayuran', price: 10000, stock: 20, description: 'Bibit terong pilihan tahan hama dengan hasil panen memuaskan.' },
  { id: 'demo-4', name: 'Bibit Melon Madu Cantaloupe', category: 'Buah', price: 20000, stock: 15, description: 'Bibit melon manis kadar gula tinggi untuk kebun rumah dan hidroponik.' },
  { id: 'demo-5', name: 'Bibit Jeruk Santang Madu', category: 'Buah', price: 25000, stock: 18, description: 'Bibit jeruk santang madu berbuah manis dan rajin berbuah sepanjang tahun.' },
]

const rupiah = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v) || 0)

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [orderCount, setOrderCount] = useState(0)

  // Testimonials state ("Kata Mereka")
  const [testimonials, setTestimonials] = useState([])
  const [showAddTestiModal, setShowAddTestiModal] = useState(false)
  const [zoomImg, setZoomImg] = useState(null)

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [checkoutData, setCheckoutData] = useState(null)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [showOrdersHistory, setShowOrdersHistory] = useState(false)

  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    getProducts()
      .then(res => {
        if (active) {
          const list = Array.isArray(res) ? res : res?.data || []
          setProducts(list.length ? list : demoProducts)
        }
      })
      .catch(() => {
        if (active) {
          setApiError(true)
          setProducts(demoProducts)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    // Load orders
    const orders = getOrders()
    setOrderCount(orders.length)

    // Load testimonials
    setTestimonials(getTestimonials())

    return () => { active = false }
  }, [completedOrder])

  const shownProducts = useMemo(() =>
    (products.length ? products : demoProducts).filter(p =>
      (p.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(query.toLowerCase())
    )
  , [products, query])

  const handleLogout = async () => {
    logout()
    navigate('/')
  }

  const handleOpenCheckout = (product, quantity = 1) => {
    setSelectedProduct(null)
    setCheckoutData({ product, quantity })
  }

  return (
    <div className="site-shell">
      {/* Top Navbar */}
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">🌱</span>
          <span>Bibit<span className="brand-accent">Unggul</span></span>
        </a>

        <nav aria-label="Navigasi utama">
          <a href="#home">Beranda</a>
          <a href="#products">Produk</a>
          <a href="#testimonials">Kata Mereka</a>
          <a href="#about">Tentang</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Tombol Riwayat Pesanan */}
          <button
            type="button"
            onClick={() => setShowOrdersHistory(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #d8e5d2',
              borderRadius: '20px',
              padding: '7px 13px',
              background: '#f6faf2',
              color: '#2a5e30',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>📦</span> Pesanan Saya {orderCount > 0 && <span style={{ background: '#79a94b', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '10px' }}>{orderCount}</span>}
          </button>

          {user ? (
            <>
              <span style={{ fontSize: '12px', color: '#2c5b32', fontWeight: 600, padding: '6px 12px', background: '#eff5e9', borderRadius: '20px' }}>
                🌱 {user.user_metadata?.name || user.email?.split('@')[0]}
              </span>
              {isAdmin() && (
                <Link to="/admin/dashboard" style={{ fontSize: '12px', color: '#fff', background: '#315f38', fontWeight: 700, textDecoration: 'none', borderRadius: '20px', padding: '8px 14px' }}>
                  🛡️ Dashboard Admin
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                style={{ border: '1px solid #d8e5d2', borderRadius: '30px', padding: '8px 14px', background: 'none', color: '#a83232', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/admin/login" style={{ color: '#6e8774', textDecoration: 'none', fontSize: '12px', fontWeight: 600, padding: '8px 10px' }}>
                🔐 Admin
              </Link>
              <Link to="/login" className="nav-cta">
                Masuk <span>↗</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" />TUMBUH BERSAMA BIBIT BERKUALITAS</span>
            <h1>Awali kebunmu<br />dari <em>bibit terbaik.</em></h1>
            <p>Temukan bibit tanaman pilihan untuk memulai perjalanan bercocok tanam yang lebih mudah dan menyenangkan dengan sistem pembayaran COD & Transfer Bank.</p>
            <div className="hero-actions">
              <a className="button-primary" href="#products">Jelajahi Produk <span>→</span></a>
              <a className="text-link" href="#testimonials">Lihat Testimoni</a>
            </div>
            <div className="hero-stats">
              <div><strong>🌿</strong><span>Pilihan bibit tanaman</span></div>
              <div><strong>🚚</strong><span>Bisa COD & Transfer Bank</span></div>
            </div>
          </div>
          <div className="hero-visual" aria-label="Ilustrasi tanaman">
            <div className="visual-circle circle-one" />
            <div className="visual-circle circle-two" />
            <div className="plant-card">
              <span className="plant-emoji">🌱</span>
              <span className="plant-label">Mulai dari benih</span>
              <strong>Rawat. Tumbuh.<br />Panen.</strong>
              <span className="plant-sprout">🌿</span>
            </div>
            <span className="floating-note note-top">✦ Pilihan untuk kebunmu</span>
            <span className="floating-note note-bottom">Growing good things</span>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="benefits">
          <div>
            <span>01</span>
            <strong>Beragam Pilihan Bibit</strong>
            <p>Koleksi sayuran, buah, dan toga siap tanam.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Bisa Bayar COD</strong>
            <p>Bayar tunai di tempat saat bibit tiba.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Transfer Bank Resmi</strong>
            <p>BCA, BRI, Mandiri & BNI dengan konfirmasi instan.</p>
          </div>
        </section>

        {/* Products Catalog Section */}
        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">KATALOG PILIHAN</span>
              <h2>Temukan bibit <em>favoritmu.</em></h2>
              <p>Pilih tanaman yang ingin kamu tumbuhkan hari ini.</p>
            </div>
            <label className="search-box">
              <span>⌕</span>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama bibit..." aria-label="Cari produk bibit" />
            </label>
          </div>

          {apiError && <div className="notice">Katalog bibit ditampilkan dalam mode siap beli. Silakan pilih bibit untuk melihat detail dan melakukan pembelian!</div>}

          {loading ? (
            <div className="product-state">Memuat katalog bibit…</div>
          ) : shownProducts.length ? (
            <div className="product-grid">
              {shownProducts.map((p, i) => (
                <article className="product-card" key={p.id || i}>
                  <div
                    className={`product-art art-${i % 4}`}
                    onClick={() => setSelectedProduct(p)}
                    style={{ cursor: 'pointer' }}
                    title="Klik untuk melihat detail produk"
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} />
                    ) : (
                      <span>{['🌶️', '🍅', '🍆', '🍈', '🍊'][i % 5]}</span>
                    )}
                    <span className="product-tag">{p.category || 'Bibit'}</span>
                  </div>
                  <div className="product-info">
                    <h3
                      onClick={() => setSelectedProduct(p)}
                      style={{ cursor: 'pointer' }}
                    >
                      {p.name || 'Produk Bibit'}
                    </h3>
                    <p>{p.description || 'Bibit pilihan untuk memulai budidaya tanaman.'}</p>
                    <div className="product-bottom">
                      <strong>{rupiah(p.price)}</strong>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(p)}
                          aria-label={`Detail ${p.name}`}
                          style={{
                            border: 0,
                            background: '#eff5e9',
                            borderRadius: '20px',
                            padding: '8px 12px',
                            color: '#477344',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Detail <span>↗</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="product-state">Produk dengan kata "{query}" tidak ditemukan. Coba kata kunci lain.</div>
          )}
        </section>

        {/* ===================== SECTION: KATA MEREKA (TESTIMONI DENGAN ULASAN TEKS DI ATAS & FOTO SS WA DI BAWAH) ===================== */}
        <section className="testimonials-section" id="testimonials" style={{ paddingBottom: '90px' }}>
          <div className="section-heading" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />TESTIMONI & BUKTI CHAT WHATSAPP</span>
              <h2>Kata <em>Mereka</em> tentang BibitUnggul</h2>
              <p>Pengalaman nyata pembeli yang telah berkebun dengan bibit segar dan berkualitas dari kami.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTestiModal(true)}
              style={{
                background: '#315f38',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '11px 22px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 18px rgba(49, 95, 56, 0.25)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span>+</span> Tulis Testimoni Anda
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {testimonials.map(t => (
              <article
                key={t.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #edf1e9',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 10px 30px rgba(45, 83, 32, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div>
                  {/* Profil Pembeli & Bintang */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: '#eff6ea',
                          color: '#2c5b32',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '16px',
                          border: '1px solid #cbe0c3'
                        }}
                      >
                        {t.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#1d3b29', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {t.name}
                          <span style={{ fontSize: '10px', background: '#eaf4e5', color: '#38653b', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                            ✓ Pembeli Terverifikasi
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#7a8e79' }}>
                          {t.city} · <span style={{ color: '#9bb582' }}>{t.date}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#f39c12' }}>
                      {'★'.repeat(t.rating || 5)}
                    </div>
                  </div>

                  {/* Badge Bibit Yang Dibeli */}
                  {t.product && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ background: '#f5faef', color: '#315f38', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', border: '1px solid #dcebd4' }}>
                        🌱 Pembelian: {t.product}
                      </span>
                    </div>
                  )}

                  {/* 1. ULASAN TEXT DI ATASNYA */}
                  <div style={{ background: '#fbfcf9', border: '1px solid #eef3ea', borderRadius: '16px', padding: '14px 16px', marginBottom: '16px', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '-10px', left: '16px', fontSize: '20px', color: '#9bb582', background: '#fbfcf9', padding: '0 4px', lineHeight: '1' }}>“</span>
                    <p style={{ fontSize: '12px', lineHeight: '1.7', color: '#334e38', margin: 0, fontStyle: 'italic' }}>
                      {t.reviewText}
                    </p>
                  </div>
                </div>

                {/* 2. FOTO SCREENSHOT CHAT WA (SS WA) DI BAWAH TEKS */}
                {t.ssWa && (
                  <div style={{ border: '1px solid #dbe7d4', borderRadius: '18px', overflow: 'hidden', background: '#f6faf2' }}>
                    <div style={{ padding: '8px 14px', background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💬</span> Bukti Screenshot Chat WA
                      </span>
                      <span style={{ fontSize: '10px', opacity: 0.9 }}>{t.waSender || 'Chat WhatsApp Asli'}</span>
                    </div>

                    <div
                      onClick={() => setZoomImg(t.ssWa)}
                      style={{ position: 'relative', cursor: 'zoom-in', maxHeight: '200px', overflow: 'hidden', background: '#000' }}
                      title="Klik untuk memperbesar foto screenshot WhatsApp"
                    >
                      <img
                        src={t.ssWa}
                        alt={`Screenshot WA ${t.name}`}
                        style={{ width: '100%', height: '190px', objectFit: 'cover', opacity: 0.94, transition: 'transform 0.3s' }}
                      />
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.65)', color: 'white', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', backdropFilter: 'blur(4px)', fontWeight: 600 }}>
                        🔍 Klik Perbesar Foto
                      </div>
                    </div>

                    {t.waMessage && (
                      <div style={{ padding: '8px 12px', background: '#f1f8ee', borderTop: '1px solid #dbe7d4', fontSize: '11px', color: '#27522d' }}>
                        <span style={{ fontWeight: 700 }}>Kutipan WA:</span> "{t.waMessage}"
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="about-section" id="about">
          <div className="about-icon">🌾</div>
          <div>
            <span className="eyebrow">TENTANG BIBITUNGGUL</span>
            <h2>Setiap tanaman hebat<br />berawal dari <em>pilihan kecil.</em></h2>
            <p>BibitUnggul hadir sebagai ruang untuk menemukan bibit tanaman berkualitas tinggi dan memulai langkah menuju kebun yang kamu impikan.</p>
          </div>
          <a className="button-primary" href="#products">Mulai pilih bibit <span>→</span></a>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <a className="brand" href="#home"><span className="brand-mark">🌱</span><span>Bibit<span className="brand-accent">Unggul</span></span></a>
        <span>© {new Date().getFullYear()} BibitUnggul · Tumbuh dari pilihan terbaik.</span>
        <a href="#home">Kembali ke atas ↑</a>
      </footer>

      {/* FLOATING WHATSAPP CS WIDGET */}
      <aside
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        <a
          href="https://wa.me/6285171189558?text=Halo%20CS%20Admin%20BibitUnggul!%20Saya%20ingin%20tanya%20stok%20dan%20konsultasi%20bibit%20sebelum%20membeli."
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: '#25D366',
            color: 'white',
            padding: '12px 18px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '13px',
            boxShadow: '0 10px 25px rgba(37, 211, 102, 0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          title="Hubungi CS Admin via WhatsApp (0851-7118-9558)"
        >
          <span style={{ fontSize: '20px' }}>💬</span>
          <span>Tanya CS Sebelum Beli</span>
          <span
            style={{
              background: 'white',
              color: '#128C7E',
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 800
            }}
          >
            Online
          </span>
        </a>
      </aside>

      {/* MODAL 1: Detail Produk (Shopee Style) */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={handleOpenCheckout}
        />
      )}

      {/* MODAL 2: Form Pembelian & Checkout (COD & Transfer Bank) */}
      {checkoutData && (
        <CheckoutModal
          product={checkoutData.product}
          quantity={checkoutData.quantity}
          onClose={() => setCheckoutData(null)}
          onSuccess={(order) => {
            setCheckoutData(null)
            setCompletedOrder(order)
            setOrderCount(prev => prev + 1)
          }}
        />
      )}

      {/* MODAL 3: Bukti Transaksi Sukses / Invoice */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}

      {/* MODAL 4: Riwayat Pesanan Saya */}
      {showOrdersHistory && (
        <OrdersHistoryModal
          onClose={() => setShowOrdersHistory(false)}
        />
      )}

      {/* MODAL 5: Tambah Testimoni Baru */}
      {showAddTestiModal && (
        <AddTestimonialModal
          onClose={() => setShowAddTestiModal(false)}
          onSuccess={(newTesti) => {
            setShowAddTestiModal(false)
            setTestimonials(prev => [newTesti, ...prev])
          }}
        />
      )}

      {/* MODAL 6: Zoom Foto Screenshot WhatsApp */}
      {zoomImg && (
        <div
          onClick={() => setZoomImg(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'zoom-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <img
              src={zoomImg}
              alt="Perbesar Foto Screenshot WA"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            />
            <p style={{ color: 'white', fontSize: '12px', marginTop: '12px', fontWeight: 600 }}>
              Klik di mana saja untuk menutup pratinjau ✕
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
