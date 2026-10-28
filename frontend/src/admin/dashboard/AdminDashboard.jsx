import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../shared/AdminLayout.jsx';
import DashboardStatCard from './DashboardStatCard.jsx';
import { fetchAdminOrders, fetchAdminReservations, fetchAdminStats } from '../../services/api.js';
import { formatINR } from '../../context/CartContext.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([fetchAdminStats(), fetchAdminOrders(), fetchAdminReservations()])
      .then(([summary, recentOrders, allReservations]) => {
        if (!active) return;
        setStats(summary);
        setOrders(recentOrders.content.slice(0, 5));
        setReservations(allReservations.content.slice(0, 5));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load dashboard data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const cards = stats ? [
    { title: 'Menu Items', value: stats.totalItems, subtitle: `${stats.availableItems} currently available` },
    { title: 'Orders', value: stats.totalOrders, subtitle: `${stats.pendingOrders} pending` },
    { title: 'Revenue', value: formatINR(stats.revenue), subtitle: 'Excludes cancelled orders' },
  ] : [];

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-greeting">Restaurant Dashboard</h1>
        <p className="admin-sub">Live information from the restaurant database.</p>
        <div className="admin-dashboard-links">
          <Link className="admin-view-btn" to="/admin/menu">Manage Menu</Link>
          <Link className="admin-view-btn" to="/admin/orders">Manage Orders</Link>
          <Link className="admin-view-btn" to="/admin/reservations">Manage Reservations</Link>
        </div>
        {error && <p className="sh-error" role="alert">{error}</p>}
        {loading ? <p>Loading dashboard...</p> : (
          <>
            <div className="admin-stats">
              {cards.map((card) => <DashboardStatCard key={card.title} {...card} />)}
            </div>
            <section className="admin-section">
              <h2 className="admin-section-title">Recent Reservations</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Customer</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th></tr></thead>
                  <tbody>
                    {reservations.length === 0 ? <tr><td colSpan={5} className="admin-empty-cell">No reservations found.</td></tr> : reservations.map((reservation) => (
                      <tr key={reservation.id}><td>{reservation.customerName}</td><td>{reservation.reservationDate}</td><td>{reservation.reservationTime}</td><td>{reservation.numberOfGuests}</td><td>{reservation.status}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="admin-section">
              <h2 className="admin-section-title">Recent Orders</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.length === 0 ? <tr><td colSpan={5} className="admin-empty-cell">No orders found.</td></tr> : orders.map((order) => (
                      <tr key={order.id}><td>{order.id}</td><td>{order.customerName}</td><td>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</td><td>{formatINR(order.totalAmount)}</td><td>{order.orderStatus}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
