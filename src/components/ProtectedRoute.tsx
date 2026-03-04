import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading, openAuthModal } = useAuth();

  if (loading) return null;

  if (!user) {
    openAuthModal('login');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
