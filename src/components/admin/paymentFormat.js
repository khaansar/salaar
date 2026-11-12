/*
 * Formatting helpers for payment-service data. Amounts arrive in minor
 * units (paise); dates arrive as ISO instants.
 */

export function formatMoney(minor, currency = 'INR') {
  if (minor == null || !Number.isFinite(Number(minor))) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(minor) / 100);
}

export function formatDate(value, withTime = true) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(date);
}

export function shortId(value) {
  return value ? `${String(value).slice(0, 8)}…` : '—';
}

/** RTK Query error → human message (baseQuery puts the normalized message in `data`). */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (typeof error.data === 'string' && error.data) return error.data;
  return error.data?.error?.message || error.data?.message || error.message || fallback;
}

export function fullName(user) {
  return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown user';
}
