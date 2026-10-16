import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from "../shared/AdminLayout";
import { fetchAdminOrders, updateOrderStatus } from '../../services/api.js';
import { formatCurrency, formatOrderItems } from "./orderUtils";

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED', 'CANCELLED'];

function paymentLabel(method) {
  if (method === 'RAZORPAY_UPI') return 'Razorpay UPI';
  if (method === 'ONLINE') return 'Online (Demo)';
  if (method === 'CASH_ON_DELIVERY') return 'Cash on Delivery';
  return 'Pay at Counter';
}

export default function Orders() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Status');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminOrders(status === 'All Status' ? '' : status, page)
      .then((result) => {
        if (active) {
          setOrders(result.content);
          setTotalPages(result.totalPages);
          setError('');
        }
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load orders.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, status]);

  async function changeStatus(orderId, nextStatus) {
    try {
      const result = await updateOrderStatus(orderId, nextStatus);
      setOrders((current) => current.map((order) => order.id === orderId ? result : order));
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not update order status.');
    }
  }

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    return orders.filter((o) => {
      if (!q) return true;
      const id = String(o?.id ?? '').toLowerCase();
      const name = String(o?.customerName ?? '').toLowerCase();
      const phone = String(o?.customerPhone ?? '').toLowerCase();
      const paymentId = String(o?.razorpayPaymentId ?? '').toLowerCase();
      return id.includes(q) || name.includes(q) || phone.includes(q) || paymentId.includes(q);
    });
  }, [orders, search]);

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-greeting admin-greeting-small">Orders</h1>
        <p className="admin-sub">Today&apos;s orders from dine-in, takeaway and delivery.</p>
        {error && <p className="sh-error" role="alert">{error}</p>}

        <div className="admin-filters">
          <div className="admin-search-wrap">
            <span className="admin-search-icon" aria-hidden="true">
              &#8981;
            </span>
            <input
              type="text"
              className="admin-search"
              placeholder="Search order or customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search order or customer"
            />
          </div>
          <select
            className="admin-status-select"
            value={status}
            onChange={(e) => { setPage(0); setStatus(e.target.value); }}
            aria-label="Filter by status"
          >
            <option value="All Status">All Status</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Payment Status</th>
                <th>Transaction / Payment ID</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="admin-empty-cell">Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="admin-empty-cell">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id}>
                    <td>{o?.id ?? '—'}</td>
                    <td className="admin-customer-cell">{o?.customerName ?? '—'}<br />{o?.customerEmail ?? ''}<br />{o?.customerPhone ?? ''}</td>
                    <td className="admin-items-cell">{formatOrderItems(o?.items)}</td>
                    <td className="admin-amount-cell">{formatCurrency(o?.totalAmount)}</td>
                    <td>{paymentLabel(o?.paymentMethod)}</td>
                    <td>{o?.paymentStatus === 'DEMO_PAID' ? 'Demo complete (no charge)' : o?.paymentStatus ?? '—'}</td>
                    <td>{o?.razorpayPaymentId || o?.razorpayOrderId || '—'}</td>
                    <td>{o?.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
                    <td><select value={o.orderStatus} onChange={(event) => void changeStatus(o.id, event.target.value)} aria-label={`Status for order ${o.id}`}>
                      {ORDER_STATUSES.map((orderStatus) => <option key={orderStatus} value={orderStatus}>{orderStatus}</option>)}
                    </select></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination">
          <button className="admin-view-btn" type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</button>
          <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
          <button className="admin-view-btn" type="button" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
        </div>
      </div>
    </AdminLayout>
  );
}
