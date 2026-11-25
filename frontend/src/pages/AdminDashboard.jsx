import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getProducts, createProduct, updateProduct, deleteProduct, getOrders, getTestimonials, deleteTestimonial } from '../services/api'
import { useAuth } from '../context/AuthContext'
import AddTestimonialModal from '../components/AddTestimonialModal'

const rupiah = v => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v) || 0)

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category: 'Sayuran', image_url: '' }

const CS_PHONE = '085171189558'
const CS_PHONE_INT = '6285171189558'

const CS_TEMPLATES = [
  {
    title: 'Konfirmasi Stok & Kualitas Bibit',
    desc: 'Untuk pembeli yang tanya kesiapan bibit sebelum order',
    text: 'Halo Kak! Bibit tanaman pilihan kami dalam kondisi segar, berakar sehat dalam polybag, dan siap kami kemas dengan pengaman khusus agar tiba dengan aman. Stok saat ini ready ya Kak, silakan bisa langsung diorder!'
  },
  {
    title: 'Konfirmasi Pembayaran COD (Bayar di Tempat)',
    desc: 'Untuk pembeli yang memilih sistem COD',
    text: 'Halo Kak! Pesanan sistem COD (Bayar di Tempat) sudah kami terima. Paket akan segera dikirim oleh kurir. Mohon siapkan uang tunai pas saat kurir tiba di alamat ya Kak. Terima kasih banyak!'
  },
  {
    title: 'Konfirmasi Rekening Resmi Transfer Bank',
    desc: 'Untuk pembeli yang konfirmasi nomor rekening transfer',
    text: 'Halo Kak! Rekening resmi kami adalah BCA: 827-0192-881 a.n PT Bibit Unggul Indonesia. Setelah transfer berhasil, mohon kirimkan bukti transfer di sini agar pesanan Kakak langsung kami proses packing. Terima kasih!'
  },
  {
    title: 'Konsultasi Cara Tanam & Perawatan',
    desc: 'Tips berkebun untuk pemula',
    text: 'Halo Kak! Saat bibit baru tiba, letakkan di tempat teduh selama 1-2 hari agar beradaptasi, lalu siram secukupnya di pagi hari. Setelah segar, bisa dipindahkan ke pot besar atau pekarangan dengan sinar matahari cukup.'
  }
]

// Preset foto bibit variatif
const PRESET_BIBIT_IMAGES = [
  { name: 'Cabai Rawit', url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop&q=80', icon: '🌶️' },
  { name: 'Tomat Ceri', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80', icon: '🍅' },
  { name: 'Jeruk Buah', url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&auto=format&fit=crop&q=80', icon: '🍊' },
  { name: 'Tanaman Terong', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80', icon: '🍆' },
  { name: 'Melon Madu', url: 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=400&auto=format&fit=crop&q=80', icon: '🍈' },
  { name: 'Tanaman Herbal', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&auto=format&fit=crop&q=80', icon: '🌿' }
]

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Navigation tab: 'products' | 'cs' | 'orders' | 'testimonials'
  const [activeTab, setActiveTab] = useState('products')

  // Products state
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [productImgPreview, setProductImgPreview] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')

  // Orders state
  const [orders, setOrders] = useState(() => getOrders())

  // Testimonials state ("Kata Mereka")
  const [testimonials, setTestimonials] = useState(() => getTestimonials())
  const [showAddTestiModal, setShowAddTestiModal] = useState(false)
  const [zoomImg, setZoomImg] = useState(null)

  // CS Quick Messenger State
  const [csTargetPhone, setCsTargetPhone] = useState('')
  const [csCustomMsg, setCsCustomMsg] = useState(CS_TEMPLATES[0].text)
  const [copiedIdx, setCopiedIdx] = useState(null)

  const loadOrders = () => {
    const list = getOrders()
    setOrders(list)
  }

  const loadTestimonials = () => {
    const list = getTestimonials()
    setTestimonials(list)
  }

  const showToastMsg = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getProducts()
      const list = Array.isArray(res) ? res : res?.data || []
      setProducts(list)
    } catch (e) {
      setError('Gagal memuat produk: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/login')
      return
    }
    let isMounted = true
    getProducts()
      .then(res => {
        if (isMounted) {
          const list = Array.isArray(res) ? res : res?.data || []
          setProducts(list)
        }
      })
      .catch(e => {
        if (isMounted) setError('Gagal memuat produk: ' + e.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setProductImgPreview('')
    setEditId(null)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price || '',
      stock: p.stock || '',
      category: p.category || 'Sayuran',
      image_url: p.image_url || ''
    })
    setProductImgPreview(p.image_url || '')
    setEditId(p.id)
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditId(null)
    setProductImgPreview('')
    setForm(EMPTY_FORM)
  }

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // Handler Upload Foto Lokal dari Laptop/HP
  const handleProductImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFormError('Harap pilih file gambar (JPG, PNG, WebP, SVG)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Ukuran file maksimal 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setProductImgPreview(dataUrl)
      setForm(prev => ({ ...prev, image_url: dataUrl }))
      setFormError('')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim()) return setFormError('Nama bibit tanaman wajib diisi')
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) return setFormError('Harga harus berupa angka lebih dari 0')

    setFormLoading(true)
    try {
      const payload = {
        ...form,
        image_url: form.image_url || productImgPreview || '',
        price: Number(form.price),
        stock: Number(form.stock) || 0
      }

      if (editId) {
        await updateProduct(editId, payload)
        showToastMsg(`✓ Berhasil memperbarui data: ${payload.name}`)
      } else {
        await createProduct(payload)
        showToastMsg(`✓ Berhasil menambahkan produk baru: ${payload.name}`)
      }

      await fetchProducts()
      closeForm()
    } catch (e) {
      setFormError(e.message || 'Gagal menyimpan produk')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const target = products.find(p => p.id === id)
      await deleteProduct(id)
      setDeleteId(null)
      showToastMsg(`✓ Produk "${target?.name || ''}" berhasil dihapus`)
      await fetchProducts()
    } catch (e) {
      setError('Gagal menghapus: ' + e.message)
    }
  }

  const handleDeleteTestimonial = (id) => {
    if (!window.confirm('Hapus testimoni ini?')) return
    deleteTestimonial(id)
    loadTestimonials()
    showToastMsg('✓ Testimoni berhasil dihapus')
  }

  const handleCopyTemplate = (text, idx) => {
    navigator.clipboard?.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2500)
  }

  const handleSendDirectWA = (e) => {
    e.preventDefault()
    if (!csTargetPhone) return alert('Silakan masukkan nomor WhatsApp pembeli!')
    let cleanPhone = csTargetPhone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1)
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(csCustomMsg)}`
    window.open(url, '_blank')
  }

  const handleChatCustomerOrder = (order) => {
    const isCod = order.paymentMethod === 'cod'
    let phone = (order.customer?.phone || '').replace(/\D/g, '')
    if (phone.startsWith('0')) phone = '62' + phone.slice(1)
    if (!phone) phone = CS_PHONE_INT

    const msg = encodeURIComponent(
      `Halo Kak ${order.customer?.name}! Ini CS Admin BibitUnggul mengenai pesanan #${order.id} (${order.product?.name}).\n\n` +
      `Metode pembayaran: ${isCod ? 'COD (Bayar di Tempat)' : 'Transfer Bank ' + (order.bankDetails?.bank || '')}.\n` +
      `Total: ${rupiah(order.grandTotal)}.\n` +
      `Alamat: ${order.customer?.address}, ${order.customer?.city}.\n\n` +
      `Apakah ada yang perlu kami konfirmasi kembali sebelum paket dikirim? Terima kasih! 🌱`
    )
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  const filtered = products.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#f4f7f0] text-[#1d3b29] font-sans">
      {/* Top Admin Navbar */}
      <header className="bg-[#14291c] px-6 py-3.5 flex items-center justify-between border-b border-[#24422e] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold tracking-tight text-lg">Bibit<span className="text-[#79a94b]">Unggul</span></span>
              <span className="bg-[#79a94b30] text-[#9bcf6b] text-[10px] font-bold px-2 py-0.5 rounded border border-[#79a94b50]">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-[#719379]">Panel Kontrol, CRUD Produk, Upload Foto Lokal & CS Pembeli</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <span className="block text-xs font-semibold text-white">{user?.user_metadata?.name || 'Administrator'}</span>
            <span className="text-[11px] text-[#719379]">{user?.email}</span>
          </div>
          <Link
            to="/"
            className="text-xs text-[#a3d98b] hover:text-white px-3 py-1.5 rounded-lg border border-[#2b5137] bg-[#1a3524] transition-colors"
          >
            Lihat Web Utama ↗
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-300 hover:text-white px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/40 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Banner Notification / Toast */}
        {toast && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-medium text-sm flex items-center justify-between shadow-sm animate-fade-in">
            <span>{toast}</span>
            <button onClick={() => setToast('')} className="text-emerald-600 font-bold ml-4">✕</button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-800 rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-600 font-bold ml-4">✕</button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-[#e5eee0] rounded-2xl border border-[#d6e3cf] max-w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-[#315f38] text-white shadow-sm'
                : 'text-[#355b38] hover:bg-[#d8e6d1]'
            }`}
          >
            <span>📦</span> Manajemen Produk ({products.length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('testimonials'); loadTestimonials(); }}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'testimonials'
                ? 'bg-[#315f38] text-white shadow-sm'
                : 'text-[#355b38] hover:bg-[#d8e6d1]'
            }`}
          >
            <span>💬</span> Kata Mereka / Testimoni ({testimonials.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cs')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'cs'
                ? 'bg-[#315f38] text-white shadow-sm'
                : 'text-[#355b38] hover:bg-[#d8e6d1]'
            }`}
          >
            <span>📱</span> Pusat CS Admin (0851-7118-9558)
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('orders'); loadOrders(); }}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#315f38] text-white shadow-sm'
                : 'text-[#355b38] hover:bg-[#d8e6d1]'
            }`}
          >
            <span>📋</span> Pesanan Masuk ({orders.length})
          </button>
        </div>

        {/* ===================== TAB 1: CRUD PRODUK ===================== */}
        {activeTab === 'products' && (
          <div>
            {/* Title & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-[#183d29]">Katalog & Manajemen Bibit</h1>
                <p className="text-sm text-[#5f7462]">Kelola data bibit tanaman dengan foto lokal variatif (Create, Read, Update, Delete)</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openCreate}
                  className="px-4 py-2.5 bg-[#315f38] hover:bg-[#254b2b] text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>+</span> Tambah Bibit Baru (Upload Foto)
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-[#e1e9dc] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#eff5e9] flex items-center justify-center text-2xl">📦</div>
                <div>
                  <div className="text-2xl font-extrabold text-[#1d3b29]">{products.length}</div>
                  <div className="text-xs text-[#758474]">Total Bibit Terdaftar</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#e1e9dc] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#eef7ee] flex items-center justify-center text-2xl">🏷️</div>
                <div>
                  <div className="text-2xl font-extrabold text-[#315f38]">
                    {[...new Set(products.map(p => p.category).filter(Boolean))].length}
                  </div>
                  <div className="text-xs text-[#758474]">Kategori Tanaman</div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-[#e1e9dc] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#f5faef] flex items-center justify-center text-2xl">🌱</div>
                <div>
                  <div className="text-2xl font-extrabold text-[#4f803b]">
                    {products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0)}
                  </div>
                  <div className="text-xs text-[#758474]">Total Stok Unit Tersedia</div>
                </div>
              </div>
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-2xl border border-[#e3ebd9] shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#e8eee4] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#fafcfa]">
                <div className="relative flex-1 max-w-sm">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌕</span>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari nama bibit atau kategori..."
                    className="w-full pl-9 pr-4 py-2 border border-[#dce5d6] rounded-xl text-xs sm:text-sm outline-none focus:border-[#79a94b] bg-white"
                  />
                </div>
                <button
                  onClick={fetchProducts}
                  className="text-xs text-[#52744b] font-semibold hover:underline flex items-center gap-1 self-end sm:self-center"
                >
                  🔄 Refresh Data
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-500 text-sm">Memuat data produk...</div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p className="text-base font-semibold text-[#1d3b29]">Tidak ada data bibit</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {search ? `Tidak ada bibit yang cocok dengan "${search}"` : 'Belum ada produk. Tambahkan produk pertama Anda!'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#f5f8f2] text-[#4d6350] text-[11px] font-bold uppercase tracking-wider border-b border-[#e6eee0]">
                        <th className="py-3.5 px-4 w-12">#</th>
                        <th className="py-3.5 px-4">Foto & Nama Bibit</th>
                        <th className="py-3.5 px-4">Kategori</th>
                        <th className="py-3.5 px-4">Harga</th>
                        <th className="py-3.5 px-4">Stok</th>
                        <th className="py-3.5 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf3e8]">
                      {filtered.map((item, index) => (
                        <tr key={item.id} className="hover:bg-[#fcfdfa] transition-colors">
                          <td className="py-4 px-4 text-xs text-[#7b917c] font-medium">{index + 1}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {/* Thumbnail Foto Lokal Produk */}
                              <div className="w-12 h-12 rounded-xl bg-[#eff5e9] border border-[#d6e5cd] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-2xl">🌱</span>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-[#1d3b29] text-sm">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs text-[#718572] line-clamp-1 max-w-xs">{item.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block bg-[#eff6ea] text-[#3e6837] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#d7e8cb]">
                              {item.category || 'Bibit'}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-[#2e5d34]">{rupiah(item.price)}</td>
                          <td className="py-4 px-4">
                            <span className={`font-semibold ${Number(item.stock) === 0 ? 'text-red-600' : 'text-[#1d3b29]'}`}>
                              {item.stock} unit
                            </span>
                            {Number(item.stock) === 0 && <span className="ml-1 text-xs text-red-500 font-bold">(Habis)</span>}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="px-2.5 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteId(item.id)}
                                className="px-2.5 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                              >
                                🗑️ Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: KELOLA TESTIMONI "KATA MEREKA" ===================== */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#183d29]">Kelola Testimoni ("Kata Mereka")</h1>
                <p className="text-sm text-[#5f7462]">
                  Kelola ulasan teks dan foto screenshot chat WhatsApp pembeli yang ditampilkan di beranda web utama.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTestiModal(true)}
                className="px-4 py-2.5 bg-[#315f38] hover:bg-[#254b2b] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start"
              >
                <span>+</span> Tambah Testimoni & SS WA
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(t => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-[#e1ebd8] shadow-xs p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#183d29]">{t.name}</h4>
                        <span className="text-[11px] text-gray-500">{t.city}</span>
                      </div>
                      <span className="text-amber-500 font-bold text-xs">
                        {'★'.repeat(t.rating || 5)}
                      </span>
                    </div>

                    {t.product && (
                      <span className="inline-block text-[10px] font-bold text-[#2d5b32] bg-[#f0f7ec] px-2 py-0.5 rounded border border-[#d3e5cd]">
                        🌱 {t.product}
                      </span>
                    )}

                    <div className="p-3 bg-[#fafcf9] border border-[#eef4ea] rounded-xl text-xs text-[#314a34] italic leading-relaxed">
                      "{t.reviewText}"
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                      Foto Screenshot Chat WhatsApp:
                    </span>
                    {t.ssWa ? (
                      <div
                        onClick={() => setZoomImg(t.ssWa)}
                        className="relative rounded-xl overflow-hidden border border-[#d3e2cd] max-h-36 bg-black/5 cursor-zoom-in group"
                        title="Klik untuk memperbesar"
                      >
                        <img
                          src={t.ssWa}
                          alt={`SS WA ${t.name}`}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-xs font-semibold">
                          🔍 Perbesar
                        </span>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-400 border border-dashed rounded-xl">
                        Tidak ada foto SS WA
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      >
                        🗑️ Hapus Testimoni
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: PUSAT CS ADMIN & WHATSAPP ===================== */}
        {activeTab === 'cs' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#183d29]">Pusat Layanan CS & WhatsApp</h1>
              <p className="text-sm text-[#5f7462]">
                Fitur komunikasi agar pembeli dapat berkonsultasi, tanya stok, dan konfirmasi metode COD / Transfer sebelum membeli.
              </p>
            </div>

            <div className="p-6 bg-linear-to-r from-[#173e27] to-[#255e39] text-white rounded-3xl shadow-lg border border-[#34704b] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-3xl">
                  📱
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-[#9bcf6b]">Customer Service Resmi</span>
                    <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/40">
                      Aktif 🟢
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mt-0.5 font-mono">{CS_PHONE}</h3>
                  <p className="text-xs text-[#b8d6be] mt-1">Nomor ini terpasang di Web Utama, Detail Produk, dan Form Checkout.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/${CS_PHONE_INT}?text=Halo%20Admin%20BibitUnggul,%20saya%20ingin%20tes%20koneksi%20CS%20WhatsApp.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1faa53] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>💬</span> Buka WhatsApp Web ↗
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#e2ebd8] shadow-sm">
                <h3 className="font-extrabold text-[#1d3b29] text-base mb-1 flex items-center gap-2">
                  <span>⚡</span> Kirim Pesan Cepat ke Calon Pembeli
                </h3>
                <p className="text-xs text-[#667e69] mb-4">
                  Hubungi nomor WhatsApp pembeli yang meminta konfirmasi sebelum transaksi:
                </p>

                <form onSubmit={handleSendDirectWA} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2d5232] mb-1">Nomor WhatsApp Pembeli</label>
                    <input
                      type="tel"
                      value={csTargetPhone}
                      onChange={e => setCsTargetPhone(e.target.value)}
                      placeholder="Contoh: 08123456789 atau 628123456789"
                      className="w-full border border-[#dce5d6] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#79a94b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2d5232] mb-1">Isi Pesan Konfirmasi / Bantuan</label>
                    <textarea
                      rows="4"
                      value={csCustomMsg}
                      onChange={e => setCsCustomMsg(e.target.value)}
                      className="w-full border border-[#dce5d6] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#79a94b] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#315f38] hover:bg-[#23482a] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📱</span> Kirim Pesan via WhatsApp Sekarang
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e2ebd8] shadow-sm space-y-3">
                <h3 className="font-extrabold text-[#1d3b29] text-base mb-1 flex items-center gap-2">
                  <span>📋</span> Template Balasan Konfirmasi Sebelum Beli
                </h3>
                <p className="text-xs text-[#667e69] mb-3">
                  Pilih salah satu template untuk dimasukkan ke pesan atau disalin langsung:
                </p>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {CS_TEMPLATES.map((tmpl, idx) => (
                    <div
                      key={tmpl.title}
                      className="p-3.5 rounded-xl border border-[#e4eedb] bg-[#fafcf9] hover:bg-[#f3f8ee] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#1e4425]">{tmpl.title}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCsCustomMsg(tmpl.text)}
                            className="text-[10px] text-[#305934] font-bold px-2 py-1 rounded bg-[#e8f2e4] hover:bg-[#d6e8ce] cursor-pointer"
                          >
                            Pakai
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyTemplate(tmpl.text, idx)}
                            className="text-[10px] text-emerald-800 font-bold px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 cursor-pointer"
                          >
                            {copiedIdx === idx ? '✓ Tersalin' : 'Salin'}
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#5e7762] leading-snug line-clamp-2">{tmpl.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: KELOLA PESANAN MASUK ===================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-[#183d29]">Daftar Pesanan Masuk</h1>
                <p className="text-sm text-[#5f7462]">Pantau pesanan pembeli (COD & Transfer Bank) dan lakukan konfirmasi via WhatsApp</p>
              </div>
              <button
                type="button"
                onClick={loadOrders}
                className="text-xs text-[#315f38] font-bold px-3.5 py-2 bg-white border border-[#cbe0c3] rounded-xl hover:bg-[#eff6ea] self-start"
              >
                🔄 Refresh Pesanan
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#e3ebd9]">
                <span className="text-4xl block mb-2">🌿</span>
                <p className="font-bold text-[#1d3b29]">Belum ada pesanan masuk</p>
                <p className="text-xs text-gray-400 mt-1">
                  Ketika pembeli melakukan checkout dari web utama, pesanan akan langsung muncul di sini.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#e3ebd9] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#f5f8f2] text-[#4d6350] text-[11px] font-bold uppercase tracking-wider border-b border-[#e6eee0]">
                        <th className="py-3 px-4">No. Order</th>
                        <th className="py-3 px-4">Pembeli</th>
                        <th className="py-3 px-4">Bibit Dipesan</th>
                        <th className="py-3 px-4">Metode Bayar</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4 text-center">Konfirmasi WA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf3e8]">
                      {orders.map((ord) => {
                        const isCod = ord.paymentMethod === 'cod'
                        return (
                          <tr key={ord.id} className="hover:bg-[#fcfdfa] transition-colors">
                            <td className="py-4 px-4 font-mono font-bold text-xs text-[#2c5b32]">
                              {ord.id}
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-[#1d3b29] text-xs">{ord.customer?.name}</div>
                              <div className="text-[11px] text-[#6b856f]">{ord.customer?.phone}</div>
                              <div className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">{ord.customer?.address}, {ord.customer?.city}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-semibold text-xs text-[#1d3b29]">{ord.product?.name}</div>
                              <div className="text-[11px] text-gray-400">{ord.quantity} polybag</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                                isCod ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {isCod ? '📦 COD' : `💳 ${ord.bankDetails?.bank || 'Transfer'}`}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-black text-xs text-[#2a6633]">
                              {rupiah(ord.grandTotal)}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleChatCustomerOrder(ord)}
                                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1eb856] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>💬</span> Chat Pembeli
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===================== MODAL FORM: CREATE / EDIT PRODUCT (DENGAN UPLOAD FOTO LOKAL) ===================== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e1e9dc] overflow-hidden my-auto max-h-[95vh] flex flex-col animate-scale-up">
            <div className="px-6 py-4 border-b border-[#e8eee4] flex items-center justify-between bg-[#fbfcf9]">
              <div>
                <h3 className="font-extrabold text-[#1d3b29] text-base">
                  {editId ? '✏️ Edit Data Bibit' : '🌱 Tambah Bibit Tanaman Baru'}
                </h3>
                <p className="text-[11px] text-[#6a836e]">Lengkapi informasi bibit dan upload foto lokal berkualitas</p>
              </div>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-700 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              {/* 1. Nama Bibit */}
              <div>
                <label className="block text-xs font-bold text-[#2c5b32] mb-1">Nama Bibit Tanaman *</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Bibit Cabai Rawit Hibrida Unggul"
                  className="w-full border border-[#dce5d6] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#79a94b]"
                />
              </div>

              {/* 2. UPLOAD FOTO DARI PERANGKAT LOKAL (HP / LAPTOP / PC) */}
              <div className="p-4 bg-[#f8faf6] rounded-2xl border border-[#dbe7d4] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#1e4425]">
                    📸 Foto Produk Bibit (Upload dari File Lokal Komputer/HP)
                  </label>
                  {productImgPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductImgPreview('')
                        setForm(prev => ({ ...prev, image_url: '' }))
                      }}
                      className="text-[10px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      ✕ Hapus Foto
                    </button>
                  )}
                </div>

                {/* Input File Lokal */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  className="w-full text-xs text-gray-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#315f38] file:text-white hover:file:bg-[#244c2b] file:cursor-pointer shadow-xs"
                />

                {/* Pratinjau Foto Langsung */}
                {productImgPreview ? (
                  <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-[#cfe0c7] shadow-xs">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                      <img
                        src={productImgPreview}
                        alt="Pratinjau Foto Produk"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-[#1d3b29] block">✓ Foto Lokal Berhasil Dipilih</span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Foto ini akan langsung tampil di Katalog Beranda, Modal Detail Shopee, dan Struk Pesanan.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">
                    Pilih file foto bibit Anda (.jpg, .png, .webp). Jika belum memilih foto, bisa gunakan pilihan preset bibit di bawah ini:
                  </p>
                )}

                {/* Pilihan Foto Bibit Variatif Siap Pakai */}
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block mb-1.5">
                    Atau gunakan foto bibit variatif siap pakai:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BIBIT_IMAGES.map(pr => (
                      <button
                        key={pr.name}
                        type="button"
                        onClick={() => {
                          setProductImgPreview(pr.url)
                          setForm(prev => ({ ...prev, image_url: pr.url }))
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                          productImgPreview === pr.url
                            ? 'bg-[#315f38] text-white border-[#315f38]'
                            : 'bg-white hover:bg-[#eff6ea] text-[#2d5632] border-[#d2e3cc]'
                        }`}
                      >
                        <span>{pr.icon}</span>
                        <span>{pr.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Kategori & Stok */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2c5b32] mb-1">Kategori</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border border-[#dce5d6] rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#79a94b] bg-white font-medium"
                  >
                    <option value="Sayuran">Sayuran</option>
                    <option value="Buah">Buah</option>
                    <option value="Toga">Toga (Obat)</option>
                    <option value="Bunga">Tanaman Hias / Bunga</option>
                    <option value="Pohon">Pohon Keras</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2c5b32] mb-1">Stok Tersedia (Unit)</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="25"
                    className="w-full border border-[#dce5d6] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#79a94b]"
                  />
                </div>
              </div>

              {/* 4. Harga */}
              <div>
                <label className="block text-xs font-bold text-[#2c5b32] mb-1">Harga Satuan (Rupiah) *</label>
                <input
                  name="price"
                  type="number"
                  min="500"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="15000"
                  className="w-full border border-[#dce5d6] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[#79a94b]"
                />
              </div>

              {/* 5. Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-[#2c5b32] mb-1">Deskripsi & Keunggulan</label>
                <textarea
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Bibit pilihan siap tanam dalam polybag, berakar kuat, adaptif pada iklim tropis, cepat berbuah..."
                  className="w-full border border-[#dce5d6] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#79a94b] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#edf2ea] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-xs font-bold text-[#627765] hover:bg-[#eff4ec] rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#315f38] hover:bg-[#23482a] rounded-xl shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {formLoading ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambahkan Bibit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form: Add Testimonial */}
      {showAddTestiModal && (
        <AddTestimonialModal
          onClose={() => setShowAddTestiModal(false)}
          onSuccess={(newTesti) => {
            setShowAddTestiModal(false)
            setTestimonials(prev => [newTesti, ...prev])
            showToastMsg('✓ Testimoni baru berhasil ditambahkan!')
          }}
        />
      )}

      {/* Modal Konfirmasi Delete Product */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl border border-red-100 animate-scale-up">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
              🗑️
            </div>
            <h4 className="text-base font-extrabold text-[#1d3b29] mb-1">Hapus Bibit Tanaman?</h4>
            <p className="text-xs text-[#718572] mb-6">
              Item yang dihapus tidak dapat dipulihkan kembali dari sistem.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-xs font-bold text-[#627765] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteId)}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Zoom Foto SS WA */}
      {zoomImg && (
        <div
          onClick={() => setZoomImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs cursor-zoom-out"
        >
          <div className="max-w-md w-full text-center">
            <img src={zoomImg} alt="Preview Foto SS WA" className="max-h-[85vh] w-auto mx-auto rounded-2xl shadow-2xl" />
            <p className="text-white text-xs mt-3 font-semibold">Klik di mana saja untuk menutup ✕</p>
          </div>
        </div>
      )}
    </div>
  )
}
