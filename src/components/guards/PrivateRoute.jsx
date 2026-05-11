import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from '../ui/Spinner';

/**
 * Blocks unauthenticated users → redirects to /login.
 * Also blocks INACTIVE users (AuthContext handles signout).
 */
export default function PrivateRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
