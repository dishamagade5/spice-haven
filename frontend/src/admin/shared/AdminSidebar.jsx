import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthToken } from '../../services/api.js';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Menu Management', to: '/admin/menu' },
  { label: 'Customers', to: '/admin/customers' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Reservations', to: '/admin/reservations' },
];

export default function AdminSidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  let profile = {};
  try {
    profile = JSON.parse(localStorage.getItem('spicehaven_admin_profile') || '{}');
  } catch {
    localStorage.removeItem('spicehaven_admin_profile');
  }

  function logout() {
    clearAuthToken('ADMIN');
    localStorage.removeItem('spicehaven_admin_profile');
    navigate('/admin/login', { replace: true });
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <div className="admin-logo" aria-label="The Spice Haven">
          <img src="/spice-haven-logo.png" alt="Spice Haven Restaurant" />
        </div>
        <nav className="admin-nav" aria-label="Admin">
          {NAV_ITEMS.map((item) => {
            const isActive = item.to && location.pathname === item.to;
            const cls = `admin-nav-item${isActive ? ' active' : ''}`;
            if (item.to) {
              return (
                <Link key={item.label} to={item.to} className={cls} onClick={onNavigate}>
                  {item.label}
                </Link>
              );
            }
            return null;
          })}
        </nav>
      </div>

      <div className="admin-sidebar-bottom">
        <div className="admin-user">
          <span className="admin-avatar" aria-hidden="true">
            A
          </span>
          <span className="admin-user-text">
            <strong>{profile.name || 'Admin'}</strong>
            <small>{profile.email || ''}</small>
          </span>
        </div>
        <button type="button" className="admin-logout" onClick={logout}>
          Log Out
        </button>
      </div>
    </aside>
  );
}
