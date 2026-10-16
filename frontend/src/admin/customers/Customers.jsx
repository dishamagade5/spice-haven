import { useEffect, useState } from 'react';
import AdminLayout from '../shared/AdminLayout.jsx';
import { deleteCustomer, fetchAdminCustomers, updateCustomer } from '../../services/api.js';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminCustomers(page)
      .then((result) => {
        if (active) {
          setCustomers(result.content);
          setTotalPages(result.totalPages);
        }
      })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load customers.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  async function save(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      const result = await updateCustomer(editing.id, {
        fullName: editing.fullName,
        email: editing.email,
        phone: editing.phone,
      });
      setCustomers((current) => current.map((customer) => customer.id === result.id ? result : customer));
      setEditing(null);
      setNotice('Customer details updated.');
    } catch (requestError) {
      setError(requestError.message || 'Could not update customer.');
    }
  }

  async function remove(customer) {
    if (!window.confirm(`Delete the account for ${customer.fullName}? Existing orders will remain in order history.`)) return;
    try {
      await deleteCustomer(customer.id);
      if (customers.length === 1 && page > 0) setPage((current) => current - 1);
      else setCustomers((current) => current.filter((entry) => entry.id !== customer.id));
      if (editing?.id === customer.id) setEditing(null);
      setNotice('Customer account deleted.');
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not delete customer account.');
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="admin-greeting admin-greeting-small">Customers</h1>
        <p className="admin-sub">Registered accounts stored in the customer database.</p>
        {error && <p className="sh-error" role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {editing && (
          <form className="menu-admin-form" onSubmit={save}>
            <label>Name<input value={editing.fullName} maxLength="100" onChange={(event) => setEditing({ ...editing, fullName: event.target.value })} required /></label>
            <label>Email<input type="email" value={editing.email} maxLength="150" onChange={(event) => setEditing({ ...editing, email: event.target.value })} required /></label>
            <label>Phone<input type="tel" pattern="\+?[0-9]{10,13}" value={editing.phone} onChange={(event) => setEditing({ ...editing, phone: event.target.value })} required /></label>
            <div><button className="admin-view-btn" type="submit">Save customer</button><button className="admin-view-btn" type="button" onClick={() => setEditing(null)}>Cancel</button></div>
          </form>
        )}
        {loading ? <p>Loading customers...</p> : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Actions</th></tr></thead>
                <tbody>
                  {customers.length === 0 ? <tr><td colSpan={5} className="admin-empty-cell">No customer accounts registered.</td></tr> : customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.fullName}</td><td>{customer.email}</td><td>{customer.phone}</td>
                      <td>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}</td>
                      <td><button className="admin-view-btn" type="button" onClick={() => setEditing({ ...customer })}>Edit</button>
                        <button className="admin-view-btn" type="button" onClick={() => void remove(customer)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-pagination">
              <button className="admin-view-btn" type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</button>
              <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
              <button className="admin-view-btn" type="button" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
