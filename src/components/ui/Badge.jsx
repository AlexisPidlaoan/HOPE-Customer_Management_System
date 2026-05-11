/**
 * Badge component for status and role indicators.
 * type: 'active'|'inactive'|'user'|'admin'|'superadmin'|'cod'|'30d'|'45d'|string
 */
export default function Badge({ type = '', label }) {
  const map = {
    active:     'badge badge-green',
    inactive:   'badge badge-red',
    user:       'badge badge-slate',
    admin:      'badge badge-blue',
    superadmin: 'badge badge-violet',
    cod:        'badge badge-amber',
    '30d':      'badge badge-blue',
    '45d':      'badge badge-slate',
  };

  const cls = map[type?.toLowerCase()] || 'badge badge-slate';

  const icons = {
    active: '●', inactive: '●',
    superadmin: '★', admin: '◆',
    user: '◇',
  };

  const icon = icons[type?.toLowerCase()];

  return (
    <span className={cls}>
      {icon && <span style={{ fontSize: '0.55rem' }}>{icon}</span>}
      {label ?? type}
    </span>
  );
}
