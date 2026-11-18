import { useState } from 'react'
import './AuthForms.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm({ onSwitch }) {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  function submit(event) {
    event.preventDefault()
    const next = {}
    if (!emailPattern.test(values.email.trim())) next.email = 'Masukkan email dengan format yang benar.'
    if (!values.password) next.password = 'Password wajib diisi.'
    setErrors(next)
    setNotice(Object.keys(next).length ? '' : 'Validasi berhasil. Integrasi login menunggu endpoint backend.')
  }

  return <section className="auth-card" aria-labelledby="login-title">
    <span className="auth-kicker">SELAMAT DATANG KEMBALI</span>
    <h1 id="login-title">Masuk ke akunmu</h1>
    <p className="auth-description">Lanjutkan perjalanan berkebun bersama BibitUnggul.</p>
    <form onSubmit={submit} noValidate>
      <label>Email<input type="email" autoComplete="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})} aria-invalid={Boolean(errors.email)} placeholder="nama@email.com"/></label>
      {errors.email && <small className="field-error">{errors.email}</small>}
      <label>Password<input type="password" autoComplete="current-password" value={values.password} onChange={e=>setValues({...values,password:e.target.value})} aria-invalid={Boolean(errors.password)} placeholder="Masukkan password"/></label>
      {errors.password && <small className="field-error">{errors.password}</small>}
      <button className="auth-submit" type="submit">Masuk <span>→</span></button>
    </form>
    {notice && <p className="auth-notice" role="status">{notice}</p>}
    <p className="auth-switch">Belum punya akun? <button type="button" onClick={onSwitch}>Daftar sekarang</button></p>
  </section>
}

export function RegisterForm({ onSwitch }) {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  function submit(event) {
    event.preventDefault()
    const next = {}
    if (values.name.trim().length < 2) next.name = 'Nama minimal 2 karakter.'
    if (!emailPattern.test(values.email.trim())) next.email = 'Masukkan email dengan format yang benar.'
    if (values.password.length < 8) next.password = 'Password minimal 8 karakter.'
    if (values.confirm !== values.password) next.confirm = 'Konfirmasi password belum sama.'
    setErrors(next)
    setNotice(Object.keys(next).length ? '' : 'Validasi berhasil. Integrasi registrasi menunggu endpoint backend.')
  }

  return <section className="auth-card" aria-labelledby="register-title">
    <span className="auth-kicker">MULAI TUMBUH BERSAMA</span>
    <h1 id="register-title">Buat akun baru</h1>
    <p className="auth-description">Daftar untuk mengenal pilihan bibit lebih dekat.</p>
    <form onSubmit={submit} noValidate>
      <label>Nama lengkap<input value={values.name} onChange={e=>setValues({...values,name:e.target.value})} autoComplete="name" aria-invalid={Boolean(errors.name)} placeholder="Nama kamu"/></label>
      {errors.name && <small className="field-error">{errors.name}</small>}
      <label>Email<input type="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})} autoComplete="email" aria-invalid={Boolean(errors.email)} placeholder="nama@email.com"/></label>
      {errors.email && <small className="field-error">{errors.email}</small>}
      <label>Password<input type="password" value={values.password} onChange={e=>setValues({...values,password:e.target.value})} autoComplete="new-password" aria-invalid={Boolean(errors.password)} placeholder="Minimal 8 karakter"/></label>
      {errors.password && <small className="field-error">{errors.password}</small>}
      <label>Konfirmasi password<input type="password" value={values.confirm} onChange={e=>setValues({...values,confirm:e.target.value})} autoComplete="new-password" aria-invalid={Boolean(errors.confirm)} placeholder="Ulangi password"/></label>
      {errors.confirm && <small className="field-error">{errors.confirm}</small>}
      <button className="auth-submit" type="submit">Daftar <span>→</span></button>
    </form>
    {notice && <p className="auth-notice" role="status">{notice}</p>}
    <p className="auth-switch">Sudah punya akun? <button type="button" onClick={onSwitch}>Masuk</button></p>
  </section>
}
