import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
});

const AUTH_KEYS = {
  CUSTOMER: 'spicehaven_customer_token',
  ADMIN: 'spicehaven_admin_token',
};

apiClient.interceptors.request.use((config) => {
  const isAdminRequest = config.url?.startsWith('/admin/');
  const token = localStorage.getItem(isAdminRequest ? AUTH_KEYS.ADMIN : AUTH_KEYS.CUSTOMER);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    if (
      axios.isAxiosError(error)
      && error.response?.status === 401
      && requestUrl.startsWith('/admin/')
      && requestUrl !== '/admin/auth/login'
    ) {
      clearAuthToken('ADMIN');
      localStorage.removeItem('spicehaven_admin_profile');
      window.dispatchEvent(new Event('spicehaven:admin-session-expired'));
    }
    return Promise.reject(error);
  }
);

export function saveAuthToken(role, token) {
  localStorage.setItem(AUTH_KEYS[role], token);
}

export function clearAuthToken(role) {
  localStorage.removeItem(AUTH_KEYS[role]);
}

export function hasAuthToken(role) {
  return Boolean(localStorage.getItem(AUTH_KEYS[role]));
}

export function loginCustomer(credentials) {
  return apiRequest('/customer/login', { method: 'POST', data: credentials });
}

export function registerCustomer(details) {
  return apiRequest('/customer/register', { method: 'POST', data: details });
}

export function fetchCustomerProfile() {
  return apiRequest('/customer/profile');
}

export function fetchCustomerOrders() {
  return apiRequest('/customer/orders').then((orders) => orders.map(normalizeOrder));
}

export function fetchCustomerOrder(id) {
  return fetchCustomerOrders().then((orders) => orders.find((order) => String(order.id) === String(id)) || null);
}

export function loginAdmin(credentials) {
  return apiRequest('/admin/auth/login', { method: 'POST', data: credentials });
}

export async function apiRequest(path, options = {}) {
  try {
    const response = await apiClient.request({
      ...options,
      url: path.startsWith('/') ? path : `/${path}`,
    });
    return response.status === 204 ? null : response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;

    const body = error.response?.data;
    let message = body?.message || body?.error || error.message || 'API request failed';
    if (body?.errors && typeof body.errors === 'object') {
      const details = Object.entries(body.errors)
        .map(([field, detail]) => `${field}: ${detail}`)
        .join('; ');
      if (details) message = `${message}: ${details}`;
    }
    const requestError = new Error(message);
    requestError.status = error.response?.status;
    throw requestError;
  }
}

export function fetchMenu() {
  return apiRequest('/menu').then((items) =>
    items.map((item) => ({
      ...item,
      image: resolveImagePath(item.imagePath),
      available: item.isAvailable,
      featured: item.isFeatured,
    }))
  );
}

function resolveImagePath(imagePath) {
  return imagePath ? new URL(imagePath, API_BASE_URL).toString() : '';
}

export function createOrder(order) {
  return apiRequest('/orders', {
    method: 'POST',
    data: order,
  });
}

export function createRazorpayOrder(order) {
  return apiRequest('/payments/create-order', {
    method: 'POST',
    data: order,
  });
}

export function verifyRazorpayPayment(payment) {
  return apiRequest('/payments/verify', {
    method: 'POST',
    data: payment,
  }).then(normalizeOrder);
}

export function createReservation(reservation) {
  return apiRequest('/reservations', {
    method: 'POST',
    data: reservation,
  });
}

export function fetchAdminMenu() {
  return apiRequest('/admin/menu').then((items) =>
    items.map((item) => ({ ...item, imagePath: resolveImagePath(item.imagePath) }))
  );
}

function menuFormData(item, image) {
  const data = new FormData();
  data.append('dish', new Blob([JSON.stringify(item)], { type: 'application/json' }));
  if (image) data.append('image', image);
  return data;
}

export function createMenuItem(item, image) {
  return apiRequest('/admin/menu', { method: 'POST', data: menuFormData(item, image) });
}

export function updateMenuItem(id, item, image) {
  return apiRequest(`/admin/menu/${id}`, { method: 'PUT', data: menuFormData(item, image) });
}

export function deleteMenuItem(id) {
  return apiRequest(`/admin/menu/${id}`, { method: 'DELETE' });
}

export function fetchAdminOrders(status, page = 0, size = 50) {
  return apiRequest('/admin/orders', { params: { status: status || undefined, page, size } })
    .then((result) => ({ ...result, content: result.content.map(normalizeOrder) }));
}

export function updateOrderStatus(id, status) {
  return apiRequest(`/admin/orders/${id}/status`, { method: 'PATCH', data: { status } })
    .then(normalizeOrder);
}

export function fetchAdminReservations(params = {}) {
  return apiRequest('/admin/reservations', { params: { page: 0, size: 50, ...params } });
}

export function updateReservationStatus(id, status) {
  return apiRequest(`/admin/reservations/${id}/status`, { method: 'PATCH', data: { status } });
}

export function fetchAdminStats() {
  return apiRequest('/admin/stats');
}

export function fetchAdminCustomers(page = 0, size = 50) {
  return apiRequest('/admin/customers', { params: { page, size } });
}

export function updateCustomer(id, customer) {
  return apiRequest(`/admin/customers/${id}`, { method: 'PUT', data: customer });
}

export function deleteCustomer(id) {
  return apiRequest(`/admin/customers/${id}`, { method: 'DELETE' });
}

function normalizeOrder(order) {
  return {
    ...order,
    id: order.orderId,
    orderStatus: order.status,
    items: order.items.map((item) => ({
      ...item,
      id: item.menuId,
      price: Number(item.unitPrice),
      subtotal: Number(item.unitPrice) * item.quantity,
    })),
  };
}

export { API_BASE_URL };
