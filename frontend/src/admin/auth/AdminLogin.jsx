import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { hasAuthToken, loginAdmin, saveAuthToken } from '../../services/api.js';
import '../shared/admin.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (hasAuthToken('ADMIN')) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await loginAdmin({ email, password });
      saveAuthToken('ADMIN', result.token);
      localStorage.setItem('spicehaven_admin_profile', JSON.stringify({ name: result.name, email: result.email }));
      navigate('/admin/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1>Admin Sign In</h1>
        <p>Use the administrator account configured for the backend.</p>
        {error && <p className="sh-error" role="alert">{error}</p>}
        <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <button type="submit" className="admin-view-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
    </main>
  );
}
