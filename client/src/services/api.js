import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const loginAdmin = (data) => api.post('/auth/login', data);
export const getAdminProfile = () => api.get('/auth/profile');

export const getPackages = (category) => api.get('/packages', { params: category ? { category } : {} });
export const getPackageById = (id) => api.get(`/packages/${id}`);
export const createPackage = (data) => api.post('/packages', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePackage = (id, data) => api.put(`/packages/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePackage = (id) => api.delete(`/packages/${id}`);

export const createOrder = (data) => api.post('/orders', data);
export const capturePayment = (data) => api.post('/orders/capture', data);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getOrdersByEmail = (email) => api.get('/orders/history', { params: { email } });
export const getAllOrders = (params) => api.get('/orders/admin/all', { params });
export const updateOrderStatus = (id, status) => api.put(`/orders/admin/${id}/status`, { status });
export const getDashboardStats = () => api.get('/orders/admin/stats');

export default api;
