// ============================================================
// Sprint 2 · PR-02 · feat/rights-customer-gating
// src/components/rights/CustomerActionButtons.jsx
// ============================================================
// Drop-in gated buttons + stamp cells for M2's CustomerListPage.
//
// Integration in CustomerListPage:
//
//   import {
//     AddCustomerButton,
//     EditCustomerButton,
//     DeleteCustomerButton,
//     StampHeader,
//     StampCell,
//   } from '../rights/CustomerActionButtons';
//
//   // Above table:
//   <AddCustomerButton onClick={() => setAddOpen(true)} />
//
//   // In <thead>:
//   <StampHeader />
//
//   // In each <tr>:
//   <StampCell stamp={customer.stamp} />
//   <EditCustomerButton   onClick={openEdit}   customer={customer} />
//   <DeleteCustomerButton onClick={openDelete} customer={customer} />
// ============================================================

import RightsGate    from './RightsGate';
import UserTypeGate  from './UserTypeGate';

// ── Add Customer ─────────────────────────────────────────────
export function AddCustomerButton({ onClick }) {
  return (
    <RightsGate right="CUST_ADD">
      <button
        onClick={onClick}
        style={btnStyle('#2563eb')}
        aria-label="Add customer"
      >
        + Add Customer
      </button>
    </RightsGate>
  );
}

// ── Edit Customer ─────────────────────────────────────────────
export function EditCustomerButton({ onClick, customer }) {
  return (
    <RightsGate right="CUST_EDIT">
      <button
        onClick={() => onClick(customer)}
        style={btnStyle('#059669')}
        aria-label={`Edit ${customer?.name ?? 'customer'}`}
      >
        Edit
      </button>
    </RightsGate>
  );
}

// ── Delete Customer ───────────────────────────────────────────
export function DeleteCustomerButton({ onClick, customer }) {
  return (
    <RightsGate right="CUST_DEL">
      <button
        onClick={() => onClick(customer)}
        style={btnStyle('#dc2626')}
        aria-label={`Delete ${customer?.name ?? 'customer'}`}
      >
        Delete
      </button>
    </RightsGate>
  );
}

// ── Stamp Column Header (ADMIN + SUPERADMIN only) ─────────────
export function StampHeader() {
  return (
    <UserTypeGate allow={['ADMIN', 'SUPERADMIN']}>
      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', whiteSpace: 'nowrap' }}>
        Stamp
      </th>
    </UserTypeGate>
  );
}

// ── Stamp Cell (ADMIN + SUPERADMIN only) ──────────────────────
export function StampCell({ stamp }) {
  return (
    <UserTypeGate allow={['ADMIN', 'SUPERADMIN']}>
      <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#6b7280' }}>
        {stamp ?? '—'}
      </td>
    </UserTypeGate>
  );
}

// ── Shared minimal button style helper ───────────────────────
function btnStyle(bg) {
  return {
    backgroundColor: bg,
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    marginRight: '0.25rem',
  };
}
