import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from '../ui/Spinner';

/**
 * Restricts route to ADMIN and SUPERADMIN users only.
 * Regular USERs are redirected to /customers.
 */
export default function AdminRoute({ children }) {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!profile) return <Navigate to="/login" replace />;
  if (!['ADMIN', 'SUPERADMIN'].includes(profile.user_type)) {
    return <Navigate to="/customers" replace />;
  }
  return children;
}
