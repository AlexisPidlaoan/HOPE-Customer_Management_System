// ============================================================
// Sprint 3 · PR-01 · feat/rights-admin-module
// src/components/rights/AdminModuleGate.jsx
// ============================================================
// Renders children only when ADM_USER right === 1.
// A semantic alias around RightsGate specifically for the
// Admin module, making intent crystal-clear at the call site.
//
// Usage:
//   <AdminModuleGate>
//     <NavLink to="/admin">Admin</NavLink>
//   </AdminModuleGate>
// ============================================================

import RightsGate from './RightsGate';

export default function AdminModuleGate({ fallback = null, children }) {
  return (
    <RightsGate right="ADM_USER" fallback={fallback}>
      {children}
    </RightsGate>
  );
}
