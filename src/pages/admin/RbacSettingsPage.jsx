import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';

/**
 * RBAC Matrix — maps the Module/Capability table the client provided.
 * Each row: { label, user, admin, superadmin }
 *   true = full access (✓), false = no access (✗), 'partial' = limited
 */
const RBAC_ROWS = [
  { label: 'View Products & Dashboard',  user: true,      admin: true,  superadmin: true  },
  { label: 'Access Reports Analytics',    user: false,     admin: true,  superadmin: true  },
  { label: 'Manage Regular Users',        user: false,     admin: true,  superadmin: true  },
  { label: 'Access Vault / Archive',      user: false,     admin: 'partial', superadmin: true },
  { label: 'Manage Admin Accounts',       user: false,     admin: false, superadmin: true  },
  { label: 'Access System Config',        user: false,     admin: false, superadmin: true  },
  { label: 'Access Global Audit Logs',    user: false,     admin: false, superadmin: true  },
  { label: 'System Backup & Restore',     user: false,     admin: false, superadmin: true  },
  { label: 'Configure Role RBAC',         user: false,     admin: false, superadmin: true  },
];

function AccessIcon({ value }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (value === 'partial') {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15 text-amber-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-500/10 text-slate-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  );
}

function RoleHeader({ icon, label, color }) {
  const colorMap = {
    slate:  'from-slate-500 to-slate-600',
    cyan:   'from-cyan-500 to-blue-600',
    violet: 'from-violet-500 to-purple-600',
  };
  return (
    <th className="text-center px-4 py-5">
      <div className="flex flex-col items-center gap-2">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{label}</span>
      </div>
    </th>
  );
}

export default function RbacSettingsPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Role-Based Access Control</h1>
          <p className="text-sm text-slate-400 mt-0.5">Module permissions per role · SUPERADMIN only</p>
        </div>
        <div className="flex items-center gap-2 bg-violet-50 text-violet-600 px-4 py-2 rounded-xl text-xs font-semibold border border-violet-100">
          🔐 SUPERADMIN Access Only
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <AccessIcon value={true} />
          <span>Full Access</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <AccessIcon value="partial" />
          <span>Limited Access</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <AccessIcon value={false} />
          <span>No Access</span>
        </div>
      </div>

      {/* RBAC Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                <th className="text-left px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-400 min-w-[260px]">
                  Module / Capability
                </th>
                <RoleHeader
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                  label="USER"
                  color="slate"
                />
                <RoleHeader
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                  label="ADMIN"
                  color="cyan"
                />
                <RoleHeader
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  label="SUPERADMIN"
                  color="violet"
                />
              </tr>
            </thead>
            <tbody>
              {RBAC_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/50 ${
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                    {row.label}
                  </td>
                  <td className="text-center px-4 py-4">
                    <AccessIcon value={row.user} />
                  </td>
                  <td className="text-center px-4 py-4">
                    <AccessIcon value={row.admin} />
                  </td>
                  <td className="text-center px-4 py-4">
                    <AccessIcon value={row.superadmin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">About Role-Based Access</h3>
            <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
              <li><strong>USER</strong> — Can view products, sales, customers, and price history. Cannot modify data.</li>
              <li><strong>ADMIN</strong> — Full data management (add/edit customers, products), manage regular users, access reports, and limited archive access.</li>
              <li><strong>SUPERADMIN</strong> — Complete system control including managing admin accounts, system config, audit logs, backup/restore, and RBAC configuration.</li>
              <li><strong>Limited Access</strong> (amber ✓) — Admin can view the archive/vault but cannot permanently delete or perform bulk operations.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current User Info */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm">{profile?.full_name || profile?.email}</p>
              <p className="text-slate-400 text-xs">{profile?.email}</p>
            </div>
          </div>
          <Badge type={profile?.user_type?.toLowerCase()} label={profile?.user_type} />
        </div>
      </div>
    </div>
  );
}
