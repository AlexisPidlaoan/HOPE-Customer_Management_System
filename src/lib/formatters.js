/**
 * Format a number as Philippine Peso currency.
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(value);
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Return a display label for payterm codes.
 */
export function formatPayterm(code) {
  const map = { COD: 'Cash on Delivery', '30D': '30 Days', '45D': '45 Days' };
  return map[code] ?? code;
}

/**
 * Return initials from a full name string.
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str, max = 40) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}
