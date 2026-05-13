// ============================================================
// Sprint 3 · PR-02 · feat/rights-superadmin-guard
// src/pages/AdminPage.jsx
// ============================================================
// User Management page with SUPERADMIN row protection.
//
// Defence-in-depth for SUPERADMIN rows:
//   1. UI:  Activate/Deactivate buttons are disabled + greyed with tooltip
//   2. JS:  toggleUserStatus() returns early if user_type === 'SUPERADMIN'
//   3. DB:  RLS on `user` table blocks UPDATE where user_type='SUPERADMIN' (M3)
//   4. DB:  RLS on UserModule_Rights blocks writes for SUPERADMIN users (M3)
// ============================================================

import { useEffect, useState } from 'react';
import { supabase }            from '../lib/supabase';
import { useAuth }             from '../context/AuthContext';

export default function AdminPage() {
  const { currentUser }  = useAuth();
  const [users,  setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [saving,  setSaving]  = useState(null); // userId currently being toggled

  // ── Load all users ────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user')
        .select('id, email, user_type, record_status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Toggle ACTIVE / INACTIVE ──────────────────────────────
  const toggleUserStatus = async (targetUser) => {
    // ── Defence layer 2: JS guard ──────────────────────────
    if (targetUser.user_type === 'SUPERADMIN') {
      console.warn('[AdminPage] Blocked: cannot modify a SUPERADMIN.');
      return;
    }

    const newStatus = targetUser.record_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setSaving(targetUser.id);

    try {
      const { error } = await supabase
        .from('user')
        .update({ record_status: newStatus })
        .eq('id', targetUser.id);

      if (error) throw error;

      // Optimistic update in local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, record_status: newStatus } : u
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  // ── Render ────────────────────────────────────────────────
  if (loading) return <div style={pageStyle}><p>Loading users…</p></div>;
  if (error)   return <div style={pageStyle}><p style={{ color: 'red' }}>Error: {error}</p></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headingStyle}>User Management</h1>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Created</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSuperAdmin = u.user_type === 'SUPERADMIN';
            const isCurrentUser = u.id === currentUser?.id;
            const isActive = u.record_status === 'ACTIVE';
            const disableToggle = isSuperAdmin || isCurrentUser;

            return (
              <tr key={u.id} style={isSuperAdmin ? superAdminRowStyle : {}}>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>
                  <span style={typeBadge(u.user_type)}>{u.user_type}</span>
                </td>
                <td style={tdStyle}>
                  <span style={statusBadge(u.record_status)}>{u.record_status}</span>
                </td>
                <td style={tdStyle}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td style={tdStyle}>
                  {/* ── Defence layer 1: UI disable ── */}
                  <button
                    onClick={() => toggleUserStatus(u)}
                    disabled={disableToggle || saving === u.id}
                    title={
                      isSuperAdmin
                        ? 'SUPERADMIN accounts cannot be modified'
                        : isCurrentUser
                        ? 'You cannot modify your own account'
                        : isActive
                        ? 'Deactivate this user'
                        : 'Activate this user'
                    }
                    style={toggleBtnStyle(isActive, disableToggle)}
                  >
                    {saving === u.id
                      ? 'Saving…'
                      : isActive
                      ? 'Deactivate'
                      : 'Activate'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const pageStyle    = { padding: '2rem' };
const headingStyle = { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: '#111827' };
const tableStyle   = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' };
const thStyle      = { padding: '0.6rem 0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: 600, color: '#374151' };
const tdStyle      = { padding: '0.6rem 0.75rem', borderBottom: '1px solid #f3f4f6', color: '#1f2937' };
const superAdminRowStyle = { backgroundColor: '#f0f9ff', opacity: 0.85 };

function typeBadge(type) {
  const colors = {
    SUPERADMIN: { bg: '#fef3c7', color: '#92400e' },
    ADMIN:      { bg: '#dbeafe', color: '#1e40af' },
    USER:       { bg: '#f3f4f6', color: '#374151' },
  };
  const c = colors[type] ?? colors.USER;
  return {
    display: 'inline-block', padding: '0.15rem 0.5rem',
    borderRadius: '9999px', fontSize: '0.75rem',
    fontWeight: 600, backgroundColor: c.bg, color: c.color,
  };
}

function statusBadge(status) {
  return {
    display: 'inline-block', padding: '0.15rem 0.5rem',
    borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
    backgroundColor: status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
    color:           status === 'ACTIVE' ? '#065f46' : '#991b1b',
  };
}

function toggleBtnStyle(isActive, disabled) {
  return {
    padding: '0.3rem 0.65rem', borderRadius: '0.375rem', border: 'none',
    cursor:          disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? '#e5e7eb' : isActive ? '#fee2e2' : '#d1fae5',
    color:           disabled ? '#9ca3af'  : isActive ? '#b91c1c' : '#065f46',
    fontWeight: 500, fontSize: '0.8rem',
    opacity: disabled ? 0.6 : 1,
  };
}
