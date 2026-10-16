export function formatINR(amount) {
  const value = Number(amount);
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safeValue);
}

// Alias kept so callers can use either name.
export const formatCurrency = formatINR;

export function formatOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) return '—';
  return items
    .map((item) => {
      const name = item?.name || 'Item';
      const qty = Number(item?.quantity) || 1;
      return `${name} x${qty}`;
    })
    .join(', ');
}
