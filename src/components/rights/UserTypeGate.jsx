// ============================================================
// Sprint 2 · PR-02 · feat/rights-customer-gating
// src/components/rights/UserTypeGate.jsx
// ============================================================
// Renders children only when currentUser.user_type matches
// one of the allowed types (or is NOT in the denied types).
//
// Usage – allow list:
//   <UserTypeGate allow={['ADMIN', 'SUPERADMIN']}>
//     <StampColumn />
//   </UserTypeGate>
//
// Usage – deny list:
//   <UserTypeGate deny={['USER']}>
//     <DeletedCustomersLink />
//   </UserTypeGate>
// ============================================================

import { useAuth } from '../../context/AuthContext';

export default function UserTypeGate({ allow, deny, fallback = null, children }) {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) return fallback;
  if (!currentUser) return fallback;

  const userType = currentUser.user_type; // set by the trigger on your `user` table

  if (allow && !allow.includes(userType)) return fallback;
  if (deny  &&  deny.includes(userType))  return fallback;

  return children;
}
