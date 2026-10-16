import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearAuthToken,
  fetchCustomerProfile,
  hasAuthToken,
  loginCustomer as requestLogin,
  registerCustomer as requestRegistration,
  saveAuthToken,
} from '../services/api.js';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (!hasAuthToken('CUSTOMER')) {
      setAuthReady(true);
      return () => { active = false; };
    }

    fetchCustomerProfile()
      .then((profile) => {
        if (active) setCustomer(profile);
      })
      .catch((error) => {
        if (active) {
          if (error.status === 401) clearAuthToken('CUSTOMER');
          else setAuthError(error.message || 'Could not restore your account session.');
        }
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => { active = false; };
  }, []);

  async function authenticate(request) {
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = await request();
      saveAuthToken('CUSTOMER', result.token);
      const profile = {
        id: result.id,
        fullName: result.name,
        email: result.email,
        phone: result.phone,
      };
      setCustomer(profile);
      return { ok: true, success: true, customer: profile };
    } catch (error) {
      setAuthError(error.message);
      return { ok: false, success: false, message: error.message };
    } finally {
      setAuthLoading(false);
    }
  }

  function loginCustomer(credentials) {
    return authenticate(() => requestLogin({
      email: credentials.email.trim(),
      password: credentials.password,
    }));
  }

  function registerCustomer(details) {
    if (details.password !== details.confirmPassword) {
      const message = 'Passwords do not match.';
      setAuthError(message);
      return Promise.resolve({ ok: false, success: false, message });
    }
    return authenticate(() => requestRegistration({
      fullName: details.fullName.trim(),
      email: details.email.trim(),
      phone: details.phone.trim().replace(/[^\d+]/g, ''),
      password: details.password,
    }));
  }

  function logoutCustomer() {
    clearAuthToken('CUSTOMER');
    setCustomer(null);
  }

  const value = useMemo(() => ({
    customer,
    isCustomerLoggedIn: Boolean(customer),
    authReady,
    isAuthInitialized: authReady,
    authLoading,
    authError,
    setAuthError,
    loginCustomer,
    registerCustomer,
    logoutCustomer,
  }), [customer, authReady, authLoading, authError]);

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  return context;
}
