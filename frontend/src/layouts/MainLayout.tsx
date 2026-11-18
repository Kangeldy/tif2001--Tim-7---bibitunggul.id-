// ============================================================
// layouts/MainLayout.tsx
// Kerangka layout utama (sidebar + konten) setelah login
// ============================================================
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sprout, Tags, ArrowLeftRight, BarChart3, LogOut } from 'lucide-react';
import { logout } from '@/services/authService';

const navItems = [
  { to: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/bibit',     label: 'Bibit',        icon: Sprout },
  { to: '/kategori',  label: 'Kategori',     icon: Tags },
  { to: '/transaksi', label: 'Transaksi',    icon: ArrowLeftRight },
  { to: '/laporan',   label: 'Laporan',      icon: BarChart3 },
];

export default function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-green-700">
          🌱 Bibit Unggul
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors hover:bg-green-700 ${
                  isActive ? 'bg-green-700 border-r-4 border-green-300' : ''
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 text-sm text-green-200 hover:bg-green-700 border-t border-green-700"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

