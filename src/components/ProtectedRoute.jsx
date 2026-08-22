import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
}
