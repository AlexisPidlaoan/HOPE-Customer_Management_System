// ============================================================
// Sprint 2 · PR-03 · feat/rights-sidebar-nav
// src/components/routes/DeletedCustomersRoute.jsx
// ============================================================
// Route guard: USER type is redirected to /customers.
// ADMIN and SUPERADMIN pass through to the Outlet.
//
// Wire in App.jsx:
//   import DeletedCustomersRoute from './components/routes/DeletedCustomersRoute';
//   ...
//   <Route element={<DeletedCustomersRoute />}>
//     <Route path="/deleted-customers" element={<DeletedCustomersPage />} />
//   </Route>
// ============================================================

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth }           from '../../context/AuthContext';

export default function DeletedCustomersRoute() {
  const { currentUser, authLoading } = useAuth();

  // While auth resolves, render nothing to avoid flicker
  if (authLoading) return null;

  // Redirect USER type away from this route
  if (!currentUser || currentUser.user_type === 'USER') {
    return <Navigate to="/customers" replace />;
  }

  return <Outlet />;
}
