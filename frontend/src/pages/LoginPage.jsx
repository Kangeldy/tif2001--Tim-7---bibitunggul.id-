import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
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
      login(res.user, res.session?.access_token)
      if (res.isDemo) {
        setInfo('Login berhasil menggunakan Akun Pelanggan!')
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa email dan password.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = () => {
    setEmail('pelanggan@bibitunggul.id')
    setPassword('demo12345')
    setError('')
    setInfo('Kredensial demo pelanggan terisi. Silakan klik "Masuk"!')
  }

  return (
    <div className="min-h-screen bg-[#fbfcf8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-[#183d29] tracking-tight">
            <span className="text-3xl">🌱</span>
            Bibit<span className="text-[#79a94b]">Unggul</span>
          </Link>
          <p className="text-sm text-[#758474] mt-2">Masuk ke akun Pelanggan Anda</p>
        </div>

        <div className="bg-white border border-[#e8eee4] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-[#1d3b29]">Login Pelanggan</h1>
            <span className="text-xs bg-[#eff5e9] text-[#477344] font-semibold px-2.5 py-1 rounded-full">
              User
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {info && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-4 py-3 mb-4">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#2c5b32] mb-1">Email Pelanggan</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="nama@email.com atau pelanggan@bibitunggul.id"
                className="w-full border border-[#e1e9dc] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#79a94b] focus:ring-2 focus:ring-[#79a94b20]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2c5b32] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-[#e1e9dc] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#79a94b] focus:ring-2 focus:ring-[#79a94b20]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#315f38] hover:bg-[#244c2b] text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {loading ? 'Memproses Masuk...' : 'Masuk sebagai Pelanggan'}
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="mt-5 p-3.5 bg-[#f8faf6] border border-[#e1e9dc] rounded-xl text-center">
            <p className="text-xs text-[#58705b] mb-2 font-medium">Khusus Pengujian Frontend (Tanpa Tunggu Supabase):</p>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 text-xs font-bold text-[#315f38] bg-white border border-[#c8ddc0] hover:bg-[#eff5e9] rounded-lg transition-colors cursor-pointer"
            >
              ⚡ Isi Otomatis Akun Demo Pelanggan
            </button>
          </div>

          <div className="mt-5 text-center text-sm text-[#758474]">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#315f38] font-semibold hover:underline">Daftar sekarang</Link>
          </div>

          <div className="mt-4 pt-4 border-t border-[#f0f4ee] text-center">
            <Link to="/admin/login" className="text-xs text-[#477344] font-medium hover:underline flex items-center justify-center gap-1">
              <span>🔐</span> Halaman Login Khusus Admin →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
