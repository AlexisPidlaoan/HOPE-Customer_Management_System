// ============================================================
// Sprint 3 · PR-02 · feat/rights-superadmin-guard
// src/components/routes/AdminRoute.jsx
// ============================================================
// Route guard for /admin.
// Only ADMIN and SUPERADMIN users can access this route.
// All others are redirected to /customers.
//
// Wire in App.jsx:
//   import AdminRoute from './components/routes/AdminRoute';
//   ...
//   <Route element={<AdminRoute />}>
//     <Route path="/admin" element={<AdminPage />} />
//   </Route>
// ============================================================

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth }           from '../../context/AuthContext';
import { useRights }         from '../../context/UserRightsContext';

export default function AdminRoute() {
  const { currentUser, authLoading }     = useAuth();
  const { rights, rightsLoading }        = useRights();

  // Wait for both auth and rights to resolve
  if (authLoading || rightsLoading) return null;

  // Must be signed in
  if (!currentUser) return <Navigate to="/login" replace />;

  // Must have ADM_USER right AND be ADMIN or SUPERADMIN
  const allowedTypes = ['ADMIN', 'SUPERADMIN'];
  const hasRight     = rights.ADM_USER === 1;
  const hasType      = allowedTypes.includes(currentUser.user_type);

  if (!hasRight || !hasType) {
    return <Navigate to="/customers" replace />;
  }

  return <Outlet />;
}
