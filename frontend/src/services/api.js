const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '')

export const INITIAL_DEMO_PRODUCTS = [
  { id: 'prod-1', name: 'Bibit Tomat Unggul', category: 'Sayuran', price: 7000, stock: 50, description: 'Bibit tomat unggul siap tanam dalam polybag, berbuah lebat dan segar.' },
  { id: 'prod-2', name: 'Bibit Cabai Rawit', category: 'Sayuran', price: 5000, stock: 45, description: 'Bibit cabai rawit unggul tahan hama dan berbuah lebat.' },
  { id: 'prod-3', name: 'Bibit Jeruk Santang Madu', category: 'Buah', price: 25000, stock: 20, description: 'Bibit jeruk santang madu siap tanam berbuah manis dan rajin berbuah.' },
  { id: 'prod-4', name: 'Bibit Terong Ungu Hibrida', category: 'Sayuran', price: 10000, stock: 25, description: 'Bibit terong ungu pilihan cepat panen dan tahan penyakit.' },
  { id: 'prod-5', name: 'Bibit Melon Madu Cantaloupe', category: 'Buah', price: 20000, stock: 15, description: 'Bibit melon manis kadar gula tinggi cocok untuk greenhouse.' },
  { id: 'prod-6', name: 'Bibit Mangga Arumanis Super', category: 'Buah', price: 60000, stock: 12, description: 'Bibit mangga okulasi cepat berbuah dan rasa sangat manis.' },
]

// Deleted IDs tracker so deleted items never reappear even if backend has stale records
export function getDeletedIds() {
  try {
    const raw = localStorage.getItem('bibitunggul_deleted_ids')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveDeletedIds(ids) {
  try {
    localStorage.setItem('bibitunggul_deleted_ids', JSON.stringify(ids))
  } catch {}
}

// Helper for local mock storage
export function getLocalProducts() {
  try {
    const saved = localStorage.getItem('bibitunggul_products')
    if (saved !== null) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  try {
    localStorage.setItem('bibitunggul_products', JSON.stringify(INITIAL_DEMO_PRODUCTS))
  } catch {}
  return [...INITIAL_DEMO_PRODUCTS]
}

export function saveLocalProducts(products) {
  try {
    localStorage.setItem('bibitunggul_products', JSON.stringify(products))
  } catch (err) {
    console.warn('LocalStorage quota or storage error:', err)
  }
}

const getToken = () => localStorage.getItem('token')

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Fast timeout (1800ms) so frontend stays snappy even if backend port is closed
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 1800)

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal })
    clearTimeout(timeoutId)
    if (res.status === 204) return null
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || `Request gagal: ${res.status}`)
    return json
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

// Auth
export const loginUser = async (email, password) => {
  try {
    // Attempt real backend call
    return await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  } catch (backendError) {
    // Graceful Fallback for Frontend development / demo when Supabase or backend is unreachable
    console.warn('Backend/Supabase tidak merespons, beralih ke sesi Frontend Demo:', backendError.message)

    const isDemoAdmin = email.toLowerCase().includes('admin')
    const userRole = isDemoAdmin ? 'admin' : 'user'

    return {
      success: true,
      isDemo: true,
      message: `Login berhasil (${isDemoAdmin ? 'Admin' : 'Pelanggan'} Demo)`,
      user: {
        id: isDemoAdmin ? 'demo-admin-id' : 'demo-user-id',
        email: email || (isDemoAdmin ? 'admin@bibitunggul.id' : 'pelanggan@bibitunggul.id'),
        role: userRole,
        app_metadata: { role: userRole },
        user_metadata: { name: isDemoAdmin ? 'Administrator Demo' : 'Pelanggan BibitUnggul' }
      },
      session: {
        access_token: 'demo-token-' + Date.now(),
        token_type: 'bearer'
      }
    }
  }
}

export const registerUser = async (email, password, name) => {
  try {
    return await request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) })
  } catch (backendError) {
    console.warn('Backend registrasi tidak terhubung, simulasi registrasi lokal:', backendError.message)
    return {
      success: true,
      isDemo: true,
      message: 'Registrasi simulasi berhasil! Anda dapat langsung login.',
      user: { id: 'reg-demo-' + Date.now(), email }
    }
  }
}

export const logoutUser = async () => {
  try {
    await request('/auth/logout', { method: 'POST' })
  } catch {}
  return { success: true }
}

// Products CRUD (Unified Dual-Sync: Instant Local + Resilient Backend)
export const getProducts = async (params = {}) => {
  const deletedIds = getDeletedIds()
  let backendProducts = []

  try {
    const q = new URLSearchParams(params).toString()
    const res = await request(`/products${q ? '?' + q : ''}`)
    backendProducts = Array.isArray(res) ? res : res?.data || []
  } catch {
    // Backend offline / failed - continue with local
  }

  const localProducts = getLocalProducts()
  const seenIds = new Set()
  const merged = []

  // 1. Add local products first (includes newly added / edited items)
  for (const p of localProducts) {
    const sId = String(p.id)
    if (!deletedIds.includes(sId) && !seenIds.has(sId)) {
      seenIds.add(sId)
      merged.push(p)
    }
  }

  // 2. Add backend products if not deleted and not seen
  for (const p of backendProducts) {
    const sId = String(p.id)
    if (!deletedIds.includes(sId) && !seenIds.has(sId)) {
      seenIds.add(sId)
      merged.push(p)
    }
  }

  let result = merged
  if (params.category) {
    result = result.filter(p => (p.category || '').toLowerCase() === params.category.toLowerCase())
  }
  if (params.search) {
    const s = params.search.toLowerCase()
    result = result.filter(p => (p.name || '').toLowerCase().includes(s) || (p.description || '').toLowerCase().includes(s))
  }

  return { data: result }
}

export const getProductById = async (id) => {
  const sId = String(id)
  const deletedIds = getDeletedIds()
  if (deletedIds.includes(sId)) return { data: null }

  // Check local first
  const local = getLocalProducts()
  const found = local.find(p => String(p.id) === sId)
  if (found) return { data: found }

  // Check backend
  try {
    const res = await request(`/products/${encodeURIComponent(id)}`)
    if (res?.data) return res
  } catch {}

  return { data: null }
}

export const createProduct = async (data) => {
  const local = getLocalProducts()
  const newProd = {
    ...data,
    id: 'prod-' + Date.now(),
    price: Number(data.price) || 0,
    stock: Number(data.stock) || 0,
    created_at: new Date().toISOString()
  }

  // Save to local storage immediately
  const updatedLocal = [newProd, ...local]
  saveLocalProducts(updatedLocal)

  // Asynchronously try to create in backend
  try {
    const res = await request('/products', { method: 'POST', body: JSON.stringify(data) })
    if (res?.data?.id) {
      const idx = updatedLocal.findIndex(p => p.id === newProd.id)
      if (idx !== -1) {
        updatedLocal[idx] = { ...updatedLocal[idx], id: res.data.id }
        saveLocalProducts(updatedLocal)
        return { success: true, data: updatedLocal[idx], message: 'Produk berhasil ditambahkan' }
      }
    }
  } catch (err) {
    console.warn('Backend insert sync fallback to local:', err.message)
  }

  return { success: true, isLocal: true, data: newProd, message: 'Produk berhasil ditambahkan' }
}

export const updateProduct = async (id, data) => {
  const sId = String(id)
  const local = getLocalProducts()
  const idx = local.findIndex(p => String(p.id) === sId)
  let updatedItem = null

  if (idx !== -1) {
    local[idx] = {
      ...local[idx],
      ...data,
      price: data.price !== undefined ? Number(data.price) : local[idx].price,
      stock: data.stock !== undefined ? Number(data.stock) : local[idx].stock,
      updated_at: new Date().toISOString()
    }
    updatedItem = local[idx]
    saveLocalProducts(local)
  }

  try {
    const res = await request(`/products/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
    if (res?.data) return res
  } catch (err) {
    console.warn('Backend update sync fallback to local:', err.message)
  }

  if (updatedItem) {
    return { success: true, data: updatedItem, message: 'Produk berhasil diperbarui' }
  }
  return { success: true, data: { id, ...data }, message: 'Produk berhasil diperbarui' }
}

export const deleteProduct = async (id) => {
  const sId = String(id)

  // 1. Permanently track in deleted IDs so it never comes back from backend
  const deletedIds = getDeletedIds()
  if (!deletedIds.includes(sId)) {
    deletedIds.push(sId)
    saveDeletedIds(deletedIds)
  }

  // 2. Remove immediately from local products
  const local = getLocalProducts()
  const filtered = local.filter(p => String(p.id) !== sId)
  saveLocalProducts(filtered)

  // 3. In background, attempt backend delete
  try {
    await request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
  } catch (err) {
    console.warn('Backend delete sync note:', err.message)
  }

  return { success: true, message: 'Produk berhasil dihapus' }
}

// Order Management (COD & Bank Transfer)
export const createOrder = async (orderData) => {
  try {
    // Attempt backend orders endpoint if exists
    return await request('/orders', { method: 'POST', body: JSON.stringify(orderData) })
  } catch {
    // Seamless frontend order storage
    const existing = getOrders()
    const newOrder = {
      ...orderData,
      id: 'BU-' + Date.now().toString().slice(-6),
      orderDate: new Date().toISOString(),
      status: orderData.paymentMethod === 'cod' ? 'diproses' : 'menunggu_pembayaran'
    }
    const updated = [newOrder, ...existing]
    try {
      localStorage.setItem('bibitunggul_orders', JSON.stringify(updated))
    } catch {}
    return { success: true, isLocal: true, data: newOrder }
  }
}

export const getOrders = () => {
  try {
    const saved = localStorage.getItem('bibitunggul_orders')
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

// Testimonials Management ("Kata Mereka")
const INITIAL_TESTIMONIALS = [
  {
    id: 'testi-1',
    name: 'Ibu Ratna Dewi',
    city: 'Bandung, Jawa Barat',
    product: 'Bibit Cabai Rawit & Tomat Ceri',
    rating: 5,
    date: '2 hari yang lalu',
    reviewText: 'Alhamdulillah bibit cabai rawit dan tomatnya sampai masih sangat segar dan daunnya hijau lebat. Pengemasan dengan polybag aman sekali pakai kardus tebal. Seller juga sangat ramah diajarin cara tanam awal lewat WA. Sangat memuaskan!',
    ssWa: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=80',
    waSender: '+62 813-8821-xxxx',
    waMessage: 'Paket bibit cabai dan tomat sudah sampai min! Seger bgt ga ada yg layu, makasih bonus pupuknya yaa 🙏'
  },
  {
    id: 'testi-2',
    name: 'Bpk. Hendra Wijaya',
    city: 'Surabaya, Jawa Timur',
    product: 'Bibit Jeruk Santang Madu',
    rating: 5,
    date: '4 hari yang lalu',
    reviewText: 'Awalnya ragu pesan tanaman jarak jauh, tapi coba sistem COD ternyata aman banget! Kurir sampai, saya cek dulu polybagnya masih lembab dan pohonnya kokoh. Terima kasih BibitUnggul, pelayanan CS ramah dan responsif!',
    ssWa: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=500&auto=format&fit=crop&q=80',
    waSender: '+62 852-1923-xxxx',
    waMessage: 'Min barang sudah saya bayar ke kurir COD tadi ya. Tanaman jeruknya mantap seger pol! Nanti order lagi 👍'
  },
  {
    id: 'testi-3',
    name: 'Ibu Siti Aminah',
    city: 'Yogyakarta',
    product: 'Bibit Melon Madu Cantaloupe',
    rating: 5,
    date: '1 minggu yang lalu',
    reviewText: 'Sudah 3 minggu setelah tanam, pertumbuhannya cepat sekali dan daunnya lebar-lebar. CS adminnya baik banget waktu saya tanya-tanya takaran pupuk dan jadwal siram sebelum beli via WA 0851-7118-9558. Sukses selalu!',
    ssWa: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=500&auto=format&fit=crop&q=80',
    waSender: '+62 878-3921-xxxx',
    waMessage: 'Halo admin, mau lapor bibit melonnya udah mulai merambat sehat bgt nih. Makasih tips perawatannya min!'
  }
]

export const getTestimonials = () => {
  try {
    const saved = localStorage.getItem('bibitunggul_testimonials')
    if (saved) return JSON.parse(saved)
  } catch {}
  try {
    localStorage.setItem('bibitunggul_testimonials', JSON.stringify(INITIAL_TESTIMONIALS))
  } catch {}
  return INITIAL_TESTIMONIALS
}

export const createTestimonial = (data) => {
  const list = getTestimonials()
  const newTesti = {
    ...data,
    id: 'testi-' + Date.now(),
    date: 'Baru saja',
    rating: Number(data.rating) || 5
  }
  const updated = [newTesti, ...list]
  try {
    localStorage.setItem('bibitunggul_testimonials', JSON.stringify(updated))
  } catch {}
  return { success: true, data: newTesti }
}

export const deleteTestimonial = (id) => {
  const list = getTestimonials()
  const filtered = list.filter(t => t.id !== id)
  try {
    localStorage.setItem('bibitunggul_testimonials', JSON.stringify(filtered))
  } catch {}
  return { success: true }
}
