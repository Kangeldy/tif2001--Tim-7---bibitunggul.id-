// ============================================================
// layouts/AuthLayout.tsx
// Kerangka layout untuk halaman publik (login, dll)
// ============================================================
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">🌱 Bibit Unggul</h1>
          <p className="text-green-600 mt-1">Sistem Manajemen Bibit</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

