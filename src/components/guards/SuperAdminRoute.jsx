import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from '../ui/Spinner';

/**
 * Restricts route to SUPERADMIN users only.
 * ADMIN and regular USERs are redirected to /customers.
 */
export default function SuperAdminRoute({ children }) {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.user_type !== 'SUPERADMIN') {
    return <Navigate to="/customers" replace />;
  }
  return children;
}
