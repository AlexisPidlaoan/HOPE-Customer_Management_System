
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { session, loading, pendingActivation } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (pendingActivation) {
    return <div>Your account is pending activation. Please contact admin.</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
