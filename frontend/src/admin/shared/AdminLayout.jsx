import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './admin.css';
import AdminSidebar from './AdminSidebar.jsx';
import { hasAuthToken } from '../../services/api.js';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handleExpiredSession() {
      navigate('/admin/login', { replace: true });
    }
    window.addEventListener('spicehaven:admin-session-expired', handleExpiredSession);
    return () => window.removeEventListener('spicehaven:admin-session-expired', handleExpiredSession);
  }, [navigate]);

  if (!hasAuthToken('ADMIN')) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-layout">
      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle admin menu"
      >
        ☰
      </button>
      <div className={`admin-sidebar-wrap${sidebarOpen ? ' open' : ''}`}>
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="admin-content">{children}</main>
    </div>
  );
}
