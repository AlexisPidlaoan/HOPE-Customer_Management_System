import { useState, useMemo } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

// ── Action metadata for display ──
const ACTION_META = {
  USER_SIGNED_UP:       { icon: '🆕', label: 'User Signed Up',        color: 'bg-blue-100 text-blue-600',    badge: 'bg-blue-100 text-blue-700' },
  USER_ACTIVATED:       { icon: '✅', label: 'User Activated',        color: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  USER_DEACTIVATED:     { icon: '🚫', label: 'User Deactivated',      color: 'bg-red-100 text-red-600',      badge: 'bg-red-100 text-red-700' },
  USER_ROLE_CHANGED:    { icon: '🔄', label: 'Role Changed',          color: 'bg-violet-100 text-violet-600', badge: 'bg-violet-100 text-violet-700' },
  CUSTOMER_ADDED:       { icon: '➕', label: 'Customer Added',        color: 'bg-cyan-100 text-cyan-600',    badge: 'bg-cyan-100 text-cyan-700' },
  CUSTOMER_EDITED:      { icon: '✏️', label: 'Customer Edited',       color: 'bg-amber-100 text-amber-600',  badge: 'bg-amber-100 text-amber-700' },
  CUSTOMER_DEACTIVATED: { icon: '🗑', label: 'Customer Deactivated',  color: 'bg-rose-100 text-rose-600',    badge: 'bg-rose-100 text-rose-700' },
  CUSTOMER_RECOVERED:   { icon: '↩️', label: 'Customer Recovered',    color: 'bg-teal-100 text-teal-600',    badge: 'bg-teal-100 text-teal-700' },
};

const DEFAULT_META = { icon: '📝', label: 'Action', color: 'bg-slate-100 text-slate-600', badge: 'bg-slate-100 text-slate-700' };

function getActionMeta(action) {
  return ACTION_META[action] || DEFAULT_META;
}

function formatTimeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Filter Pill ──
function FilterPill({ active, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        active
          ? 'bg-slate-800 text-white shadow-sm'
          : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Detail renderer ──
function LogDetails({ action, details }) {
  if (!details || Object.keys(details).length === 0) return null;

  if (action === 'USER_SIGNED_UP') {
    return (
      <span className="text-xs text-slate-400">
        via <span className="font-semibold text-slate-500">{details.provider || 'email'}</span>
      </span>
    );
  }

  if (action === 'USER_ROLE_CHANGED') {
    return (
      <span className="text-xs text-slate-400">
        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{details.old_role}</span>
        {' → '}
        <span className="font-mono bg-violet-100 px-1.5 py-0.5 rounded text-violet-600 font-semibold">{details.new_role}</span>
      </span>
    );
  }

  if (action === 'USER_ACTIVATED' || action === 'USER_DEACTIVATED') {
    return (
      <span className="text-xs text-slate-400">
        Target: <span className="font-semibold text-slate-500">{details.target_email}</span>
      </span>
    );
  }

  if (action.startsWith('CUSTOMER_')) {
    return (
      <span className="text-xs text-slate-400">
        {details.custname && <><span className="font-semibold text-slate-500">{details.custname}</span> · </>}
        <span className="font-mono text-slate-400">{details.custno}</span>
      </span>
    );
  }

  return null;
}

export default function AuditLogsPage() {
  const { logs, loading } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'profile', 'customer'

  // Compute counts
  const counts = useMemo(() => {
    const c = { all: logs.length, profile: 0, customer: 0 };
    logs.forEach((l) => {
      if (l.target_type === 'profile') c.profile++;
      if (l.target_type === 'customer') c.customer++;
    });
    return c;
  }, [logs]);

  // Filter + search
  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (filter !== 'all' && log.target_type !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchEmail = (log.user_email || '').toLowerCase().includes(q);
        const matchAction = (getActionMeta(log.action).label || '').toLowerCase().includes(q);
        const matchDetails = JSON.stringify(log.details || {}).toLowerCase().includes(q);
        return matchEmail || matchAction || matchDetails;
      }
      return true;
    });
  }, [logs, filter, search]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Global Audit Logs</h1>
          <p className="text-sm text-slate-400 mt-0.5">Track all system activity · SUPERADMIN only</p>
        </div>
        <div className="flex items-center gap-2 bg-violet-50 text-violet-600 px-4 py-2 rounded-xl text-xs font-semibold border border-violet-100">
          🔐 SUPERADMIN Access Only
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          <FilterPill active={filter === 'all'}      label="All Events"  count={counts.all}      onClick={() => setFilter('all')} />
          <FilterPill active={filter === 'profile'}  label="Users"       count={counts.profile}  onClick={() => setFilter('profile')} />
          <FilterPill active={filter === 'customer'} label="Customers"   count={counts.customer} onClick={() => setFilter('customer')} />
        </div>
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2.5 flex items-center gap-3">
          <span className="text-slate-400">🔍</span>
          <input
            id="auditSearch"
            type="text"
            placeholder="Search by email, action, or details…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
          />
          {search && <button onClick={() => setSearch('')} className="text-slate-400 text-xs hover:text-slate-600">✕ Clear</button>}
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={10} columns={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No audit logs found"
            message={search ? 'Try a different search term.' : 'Activity will appear here as actions are performed in the system.'}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((log) => {
              const meta = getActionMeta(log.action);
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center text-lg flex-shrink-0 mt-0.5`}>
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <LogDetails action={log.action} details={log.details} />
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {log.user_email ? (
                        <>
                          by <span className="font-semibold text-slate-700">{log.user_email}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">System</span>
                      )}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-500">{formatTimeAgo(log.created_at)}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{formatDate(log.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {!loading && logs.length > 0 && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-extrabold">{counts.all}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Total Events</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-blue-400">{counts.profile}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">User Events</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-cyan-400">{counts.customer}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Customer Events</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-400">
                {logs.length > 0 ? formatTimeAgo(logs[0].created_at) : '—'}
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Last Activity</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
