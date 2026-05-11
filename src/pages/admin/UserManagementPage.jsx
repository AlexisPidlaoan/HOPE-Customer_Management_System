import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import { useToast } from '../../components/ui/ToastProvider';
import Badge from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Tooltip from '../../components/ui/Tooltip';
import { formatDate, getInitials } from '../../lib/formatters';

export default function UserManagementPage() {
  const { profile: me } = useAuth();
  const { users, loading, activateUser, deactivateUser } = useUsers();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { type, user }
  const [working, setWorking] = useState(false);

  const filtered = users.filter((u) =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setWorking(true);
    const { type, user } = confirmAction;
    const fn = type === 'activate' ? activateUser : deactivateUser;
    const { error } = await fn(user.id);
    if (error) toast.error(error.message);
    else toast.success(`${user.email} ${type === 'activate' ? 'activated' : 'deactivated'}.`);
    setWorking(false);
    setConfirmAction(null);
  };

  const isSuperadmin = (u) => u.user_type === 'SUPERADMIN';
  const isMe = (u) => u.id === me?.id;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Activate or deactivate user accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 px-4 py-3 flex items-center gap-3">
        <span className="text-slate-400">🔍</span>
        <input
          id="userSearch"
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
        />
        {search && <button onClick={() => setSearch('')} className="text-slate-400 text-xs hover:text-slate-600">✕ Clear</button>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? <TableSkeleton rows={5} columns={6} /> : filtered.length === 0 ? (
          <EmptyState icon="🛡" title="No users found" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const superadmin = isSuperadmin(u);
                const self = isMe(u);
                
                return (
                  <tr key={u.id} className={superadmin || self ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50'}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {getInitials(u.full_name || u.email)}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">{u.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="text-slate-500 text-sm">{u.email}</td>
                    <td><Badge type={u.user_type.toLowerCase()} label={u.user_type} /></td>
                    <td><Badge type={u.record_status.toLowerCase()} label={u.record_status} /></td>
                    <td className="text-slate-400 text-sm">{formatDate(u.created_at)}</td>
                    <td>
                      <Tooltip disabled={!superadmin} text="SUPERADMIN accounts cannot be modified">
                        <div className="flex gap-2">
                          {u.record_status === 'INACTIVE' ? (
                            <button
                              id={`activateBtn-${u.id}`}
                              className="btn btn-success text-xs py-1 px-3"
                              disabled={superadmin || self}
                              onClick={() => setConfirmAction({ type: 'activate', user: u })}
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              id={`deactivateBtn-${u.id}`}
                              className="btn btn-danger text-xs py-1 px-3"
                              disabled={superadmin || self}
                              onClick={() => setConfirmAction({ type: 'deactivate', user: u })}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        loading={working}
        title={confirmAction?.type === 'activate' ? 'Activate User?' : 'Deactivate User?'}
        message={`Are you sure you want to ${confirmAction?.type} ${confirmAction?.user?.email}?`}
        confirmLabel={confirmAction?.type === 'activate' ? 'Yes, Activate' : 'Yes, Deactivate'}
        danger={confirmAction?.type === 'deactivate'}
      />
    </div>
  );
}
