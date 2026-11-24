import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/api'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Password tidak cocok')
    if (form.password.length < 6) return setError('Password minimal 6 karakter')
    setLoading(true)
    try {
      const res = await registerUser(form.email, form.password, form.name)
      setSuccess(res.message || 'Registrasi berhasil! Mengalihkan ke halaman login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfcf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-[#183d29] tracking-tight">
            <span className="text-3xl">🌱</span>
            Bibit<span className="text-[#79a94b]">Unggul</span>
          </a>
          <p className="text-sm text-[#758474] mt-2">Buat akun baru</p>
        </div>
        <div className="bg-white border border-[#e8eee4] rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#1d3b29] mb-6">Daftar</h1>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#2c5b32] mb-1">Nama Lengkap</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Nama Anda" className="w-full border border-[#e1e9dc] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#79a94b]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2c5b32] mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@contoh.com" className="w-full border border-[#e1e9dc] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#79a94b]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2c5b32] mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min. 6 karakter" className="w-full border border-[#e1e9dc] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#79a94b]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2c5b32] mb-1">Konfirmasi Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required placeholder="Ulangi password" className="w-full border border-[#e1e9dc] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#79a94b]" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#315f38] hover:bg-[#244c2b] text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>
          <div className="mt-5 text-center text-sm text-[#758474]">
            Sudah punya akun? <Link to="/login" className="text-[#315f38] font-semibold hover:underline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
