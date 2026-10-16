// Presentational helper only — maps a status string to an admin badge class.
// No data, routing, or filtering logic lives here.
import React from 'react';

export function statusBadgeClass(status) {
  const normalized = String(status ?? '').trim().toLowerCase();
  switch (normalized) {
    case 'pending':
      return 'admin-status-badge admin-status-pending';
    case 'confirmed':
      return 'admin-status-badge admin-status-confirmed';
    case 'preparing':
      return 'admin-status-badge admin-status-preparing';
    case 'seated':
      return 'admin-status-badge admin-status-seated';
    case 'completed':
      return 'admin-status-badge admin-status-completed';
    case 'cancelled':
    case 'canceled':
      return 'admin-status-badge admin-status-cancelled';
    default:
      return 'admin-status-badge admin-status-default';
  }
}

export default function StatusBadge({ status }) {
  return <span className={statusBadgeClass(status)}>{status ?? '—'}</span>;
}
