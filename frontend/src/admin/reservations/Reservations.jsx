import { useEffect, useState } from 'react';
import AdminLayout from '../shared/AdminLayout.jsx';
import { fetchAdminReservations, updateReservationStatus } from '../../services/api.js';

const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const result = await fetchAdminReservations({ page });
      setReservations(result.content);
      setTotalPages(result.totalPages);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not load reservations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [page]);

  async function setStatus(id, status) {
    try {
      const updated = await updateReservationStatus(id, status);
      setReservations((current) => current.map((reservation) => reservation.id === id ? updated : reservation));
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not update reservation.');
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-greeting admin-greeting-small">Reservations</h1>
        <p className="admin-sub">Bookings submitted through the website.</p>
        {error && <p className="sh-error" role="alert">{error}</p>}
        {loading ? <p>Loading reservations...</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Customer</th><th>Contact</th><th>Date</th><th>Time</th><th>Guests</th><th>Request</th><th>Status</th></tr></thead>
              <tbody>
                {reservations.length === 0 ? <tr><td colSpan={7} className="admin-empty-cell">No reservations found.</td></tr> : reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.customerName}</td><td>{reservation.phoneNumber}<br />{reservation.email}</td>
                    <td>{reservation.reservationDate}</td><td>{reservation.reservationTime}</td>
                    <td>{reservation.numberOfGuests}</td><td>{reservation.message || '—'}</td>
                    <td><select value={reservation.status} onChange={(event) => void setStatus(reservation.id, event.target.value)} aria-label={`Status for reservation ${reservation.id}`}>
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="admin-pagination">
          <button className="admin-view-btn" type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</button>
          <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
          <button className="admin-view-btn" type="button" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
        </div>
      </div>
    </AdminLayout>
  );
}
