// ============================================================
// Sprint 2 · PR-02 · feat/rights-customer-gating
// src/components/rights/RightsGate.jsx
// ============================================================
// Generic gate: renders children only when the named right === 1.
//
// Usage:
//   <RightsGate right="CUST_ADD">
//     <button>Add Customer</button>
//   </RightsGate>
//
//   // With a fallback element:
//   <RightsGate right="CUST_EDIT" fallback={<span>—</span>}>
//     <EditButton />
//   </RightsGate>
// ============================================================

import { useRights } from '../../context/UserRightsContext';

export default function RightsGate({ right, fallback = null, children }) {
  const { rights, rightsLoading } = useRights();

  // While rights are loading, render nothing (or the fallback)
  if (rightsLoading) return fallback;

  // Render children only when the flag is explicitly 1
  return rights[right] === 1 ? children : fallback;
}
