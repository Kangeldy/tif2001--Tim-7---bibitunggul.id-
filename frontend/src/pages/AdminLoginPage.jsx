import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const res = await loginUser(email, password)
      
      const role = res.user?.role || res.user?.app_metadata?.role
      const isAdminUser = role === 'admin' || email.toLowerCase().includes('admin')

      if (!isAdminUser) {
        setError('Akun ini adalah akun Pelanggan biasa, bukan Admin. Silakan login di halaman login pelanggan.')
        setLoading(false)
        return
      }

      // Ensure admin metadata is present
      const adminUserData = {
        ...res.user,
        role: 'admin',
        app_metadata: { ...(res.user?.app_metadata || {}), role: 'admin' }
      }

      login(adminUserData, res.session?.access_token || 'admin-token')
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Login admin gagal. Periksa kembali email dan password.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemoAdmin = () => {
    setEmail('admin@bibitunggul.id')
    setPassword('admin12345')
    setError('')
    setInfo('Kredensial Admin Demo terisi. Silakan klik "Masuk sebagai Admin"!')
  }

  return (
    <div className="min-h-screen bg-[#14291c] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-white tracking-tight">
            <span className="text-3xl">🌱</span>
            Bibit<span className="text-[#79a94b]">Unggul</span>
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-[#79a94b20] text-[#9bcf6b] text-xs font-bold px-3 py-1 rounded-full border border-[#79a94b40]">
            <span>🔐</span> Portal Khusus Administrator
          </div>
        </div>

        <div className="bg-[#1e3827] border border-[#2d533a] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Login Admin</h1>
            <span className="text-xs bg-[#79a94b25] text-[#9bcf6b] font-bold px-2.5 py-1 rounded-full border border-[#79a94b40]">
              ADMIN PANEL
            </span>
          </div>
          <p className="text-xs text-[#8aa892] mb-6">Akses kontrol manajemen katalog dan stok bibit tanaman</p>

          {error && (
            <div className="bg-red-950/60 border border-red-500/50 text-red-200 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {info && (
            <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-sm rounded-lg px-4 py-3 mb-4">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#a8d59d] mb-1">Email Administrator</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@bibitunggul.id"
                className="w-full bg-[#162c1f] border border-[#30593d] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#79a94b] focus:ring-2 focus:ring-[#79a94b30] placeholder-[#4f775c]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#a8d59d] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#162c1f] border border-[#30593d] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#79a94b] focus:ring-2 focus:ring-[#79a94b30] placeholder-[#4f775c]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5d9439] hover:bg-[#4d7e2e] text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 cursor-pointer shadow-lg mt-2"
            >
              {loading ? 'Memverifikasi Akses...' : 'Masuk sebagai Admin →'}
            </button>
          </form>

          {/* Quick Demo Button for Admin */}
          <div className="mt-5 p-3.5 bg-[#172c1f] border border-[#2c4e36] rounded-xl text-center">
            <p className="text-xs text-[#8aa892] mb-2 font-medium">Uji Coba Langsung Dashboard CRUD:</p>
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="w-full py-2 px-3 text-xs font-bold text-[#b4e6a0] bg-[#22402c] border border-[#396345] hover:bg-[#2b5138] rounded-lg transition-colors cursor-pointer"
            >
              ⚡ Isi Kredensial Admin Demo (1-Klik)
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-[#2d533a] text-center">
            <Link to="/login" className="text-xs text-[#8aa892] hover:text-white transition-colors flex items-center justify-center gap-1">
              ← Kembali ke Halaman Login Pelanggan
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
