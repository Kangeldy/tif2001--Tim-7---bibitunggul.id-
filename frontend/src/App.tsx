// ============================================================
// App.tsx – Routing MVP Bibit Unggul
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';

// Guard
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages – Auth
import LoginPage from '@/pages/LoginPage';

// Pages – App
import DashboardPage from '@/pages/DashboardPage';
import BibitPage from '@/pages/bibit/BibitPage';
import TambahBibitPage from '@/pages/bibit/TambahBibitPage';
import EditBibitPage from '@/pages/bibit/EditBibitPage';
import KategoriPage from '@/pages/KategoriPage';
import TransaksiPage from '@/pages/TransaksiPage';
import LaporanPage from '@/pages/LaporanPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Halaman Publik ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* ── Halaman Terproteksi ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard"        element={<DashboardPage />} />
            <Route path="/bibit"            element={<BibitPage />} />
            <Route path="/bibit/tambah"     element={<TambahBibitPage />} />
            <Route path="/bibit/edit/:id"   element={<EditBibitPage />} />
            <Route path="/kategori"         element={<KategoriPage />} />
            <Route path="/transaksi"        element={<TransaksiPage />} />
            <Route path="/laporan"          element={<LaporanPage />} />
          </Route>
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

