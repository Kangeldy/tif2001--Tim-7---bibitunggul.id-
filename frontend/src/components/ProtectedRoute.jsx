import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#758474'}}>Memuat...</div>
  if (!user) return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />
  if (adminOnly && !isAdmin()) return <Navigate to="/admin/login" replace />
  return children
}
