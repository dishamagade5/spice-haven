import React from 'react';

export default function DashboardStatCard({ title, value, subtitle }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-title">{title}</div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-sub">{subtitle}</div>
    </div>
  );
}
