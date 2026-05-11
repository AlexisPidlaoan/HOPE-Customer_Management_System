import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRights } from '../hooks/useRights';
import { getInitials } from '../lib/formatters';
import Badge from './ui/Badge';

const NAV = [
  { label: 'Customers', path: '/customers', icon: '👤' },
  { label: 'Sales', path: '/sales', icon: '📊' },
  { label: 'Products', path: '/products', icon: '📦' },
];

const ADMIN_NAV = [
  { label: 'User Management', path: '/admin/users', icon: '🛡' },
  { label: 'Deleted Customers', path: '/admin/deleted-customers', icon: '🗑' },
];

const REPORTS_NAV = [
  { label: 'Customer Summary', path: '/admin/reports/customer-summary', icon: '📋' },
  { label: 'Top Customers', path: '/admin/reports/top-customers', icon: '🏆' },
  { label: 'Product Revenue', path: '/admin/reports/product-revenue', icon: '💰' },
];

export default function AppShell() {
  const { profile, signOut } = useAuth();
  const { hasRight } = useRights();
  const navigate = useNavigate();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(
    location.pathname.startsWith('/admin')
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isReportsActive = location.pathname.startsWith('/admin/reports');
  const canSeeAdmin = hasRight('MANAGE_USERS');
  const isSuperAdmin = profile?.user_type === 'SUPERADMIN';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col z-20 slide-in-left"
        style={{ width: 'var(--sidebar-width)', background: 'var(--color-sidebar)', flexShrink: 0 }}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">H</div>
            <span className="text-white font-black text-xl tracking-tight">
              Hope<span className="text-blue-400">CMS</span>
            </span>
          </div>
          <p className="text-slate-500 text-[11px] mt-1 tracking-wider uppercase">Customer Management</p>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 pt-4 pb-2 overflow-y-auto space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Admin section — only for ADM_USER */}
          {canSeeAdmin && (
            <div className="pt-4">
              <p className="text-slate-600 text-[10px] uppercase tracking-widest px-3 pb-2 font-bold">Admin</p>

              {/* Admin nav items */}
              {ADMIN_NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}

              {/* Reports sub-menu */}
              <button
                className={`nav-item w-full text-left ${isReportsActive ? 'text-blue-400' : ''}`}
                onClick={() => setAdminOpen((o) => !o)}
              >
                <span className="text-base w-5 text-center">📈</span>
                <span className="flex-1">Reports</span>
                <span className="text-xs text-slate-600">{adminOpen ? '▾' : '▸'}</span>
              </button>

              {adminOpen && REPORTS_NAV.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item sub${isActive ? ' active' : ''}`}
                >
                  <span className="text-xs w-4 text-center">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* SUPERADMIN-only section */}
          {isSuperAdmin && (
            <div className="pt-4">
              <p className="text-slate-600 text-[10px] uppercase tracking-widest px-3 pb-2 font-bold">System</p>

              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="text-base w-5 text-center">📊</span>
                Dashboard
              </NavLink>

              <NavLink
                to="/admin/audit-logs"
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="text-base w-5 text-center">📋</span>
                Audit Logs
              </NavLink>

              <NavLink
                to="/admin/rbac"
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="text-base w-5 text-center">🔐</span>
                Role RBAC
              </NavLink>
            </div>
          )}
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {getInitials(profile?.full_name || profile?.email || 'U')}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-white text-sm font-semibold truncate leading-tight">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-slate-400 text-[11px] truncate">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <Badge type={profile?.user_type?.toLowerCase()} label={profile?.user_type} />
              <button
                onClick={handleSignOut}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-400/10"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-400 capitalize">
              {location.pathname.split('/').filter(Boolean).join(' › ')}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <div className="h-4 w-px bg-slate-200" />
            <Badge type={profile?.record_status?.toLowerCase()} label={profile?.record_status} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}