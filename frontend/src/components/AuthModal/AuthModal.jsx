import { useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx';
import './AuthModal.css';

export default function AuthModal({ open, onClose, onSuccess }) {
  const { loginCustomer, registerCustomer, authLoading, authError, setAuthError } = useCustomerAuth();
  const [tab, setTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [localError, setLocalError] = useState('');

  if (!open) return null;

  const showError = localError || authError;

  const switchTab = (t) => {
    setTab(t);
    setLocalError('');
    setAuthError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    const result = await loginCustomer(loginForm);
    if (result.ok) {
      onSuccess?.(result.customer);
    } else {
      setLocalError(result.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    const result = await registerCustomer(regForm);
    if (result.ok) {
      onSuccess?.(result.customer);
    } else {
      setLocalError(result.message);
    }
  };

  return (
    <div className="sh-modal-overlay" onClick={onClose}>
      <div className="sh-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sh-modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="eyebrow">Welcome to Spice Haven</div>
        <h2>Login or Create Account</h2>
        <p className="sh-modal-sub">Your cart is saved — login to continue to checkout.</p>
        <div className="sh-tabs">
          <button type="button" className={tab === 'login' ? 'active' : ''} onClick={() => switchTab('login')}>Login</button>
          <button type="button" className={tab === 'register' ? 'active' : ''} onClick={() => switchTab('register')}>Register</button>
        </div>
        {showError && <div className="sh-error">{showError}</div>}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="sh-form">
            <label>Email<input type="email" autoComplete="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required /></label>
            <label>Password<input type="password" autoComplete="current-password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required /></label>
            <button type="submit" className="sh-primary-btn" disabled={authLoading}>{authLoading ? 'Logging in...' : 'Login & Continue'}</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="sh-form">
            <label>Full Name<input type="text" autoComplete="name" maxLength="100" value={regForm.fullName} onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })} required /></label>
            <label>Email<input type="email" autoComplete="email" maxLength="150" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required /></label>
            <label>Phone Number<input type="tel" autoComplete="tel" pattern="\+?[0-9]{10,13}" title="Enter a valid 10-13 digit phone number" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} required /></label>
            <label>Password<input type="password" autoComplete="new-password" minLength="8" maxLength="72" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required /></label>
            <label>Confirm Password<input type="password" autoComplete="new-password" minLength="8" maxLength="72" value={regForm.confirmPassword} onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })} required /></label>
            <button type="submit" className="sh-primary-btn" disabled={authLoading}>{authLoading ? 'Creating account...' : 'Create Account & Continue'}</button>
          </form>
        )}
        <p className="sh-demo-note">Your account is stored securely by the restaurant service.</p>
      </div>
    </div>
  );
}
