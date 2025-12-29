import axios from 'axios';

const API_URL = '/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// Profile APIs
export const profileAPI = {
  create: (data) => api.post('/profiles', data),
  getAll: (params) => api.get('/profiles', { params }),
  getById: (id) => api.get(`/profiles/${id}`),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
  switch: (profileId) => api.post('/profiles/switch', { profileId })
};

// Income APIs
export const incomeAPI = {
  create: (data) => api.post('/incomes', data),
  getAll: (params) => api.get('/incomes', { params }),
  getById: (id, profileId) => api.get(`/incomes/${id}`, { params: { profileId } }),
  update: (id, data) => api.put(`/incomes/${id}`, data),
  delete: (id, profileId) => api.delete(`/incomes/${id}`, { params: { profileId } }),
  getStats: (params) => api.get('/incomes/stats', { params })
};

// Expense APIs
export const expenseAPI = {
  create: (data) => api.post('/expenses', data),
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id, profileId) => api.get(`/expenses/${id}`, { params: { profileId } }),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id, profileId) => api.delete(`/expenses/${id}`, { params: { profileId } }),
  getStats: (params) => api.get('/expenses/stats', { params }),
  approve: (id, profileId) => api.post(`/expenses/${id}/approve`, {}, { params: { profileId } }),
  reject: (id, data, profileId) => api.post(`/expenses/${id}/reject`, data, { params: { profileId } })
};

// Category APIs
export const categoryAPI = {
  create: (data) => api.post('/categories', data),
  getAll: (params) => api.get('/categories', { params }),
  getTree: (params) => api.get('/categories/tree', { params }),
  getById: (id, profileId) => api.get(`/categories/${id}`, { params: { profileId } }),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id, profileId) => api.delete(`/categories/${id}`, { params: { profileId } }),
  getStats: (params) => api.get('/categories/stats', { params })
};

// Budget APIs
export const budgetAPI = {
  create: (data) => api.post('/budgets', data),
  getAll: (params) => api.get('/budgets', { params }),
  getById: (id, profileId) => api.get(`/budgets/${id}`, { params: { profileId } }),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id, profileId) => api.delete(`/budgets/${id}`, { params: { profileId } }),
  getStats: (params) => api.get('/budgets/stats', { params }),
  getPerformance: (id, profileId) => api.get(`/budgets/${id}/performance`, { params: { profileId } })
};

// Bank Account APIs
export const bankAccountAPI = {
  create: (data) => api.post('/bank-accounts', data),
  getAll: (params) => api.get('/bank-accounts', { params }),
  getById: (id, profileId) => api.get(`/bank-accounts/${id}`, { params: { profileId } }),
  update: (id, data) => api.put(`/bank-accounts/${id}`, data),
  delete: (id, profileId) => api.delete(`/bank-accounts/${id}`, { params: { profileId } }),
  getBalance: (id, profileId) => api.get(`/bank-accounts/${id}/balance`, { params: { profileId } })
};

// Invoice APIs
export const invoiceAPI = {
  create: (data) => api.post('/invoices', data),
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id, profileId) => api.get(`/invoices/${id}`, { params: { profileId } }),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id, profileId) => api.delete(`/invoices/${id}`, { params: { profileId } }),
  getStats: (params) => api.get('/invoices/stats', { params })
};

// Client APIs
export const clientAPI = {
  create: (data) => api.post('/clients', data),
  getAll: (params) => api.get('/clients', { params }),
  getById: (id, profileId) => api.get(`/clients/${id}`, { params: { profileId } }),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id, profileId) => api.delete(`/clients/${id}`, { params: { profileId } })
};

// Vendor APIs
export const vendorAPI = {
  create: (data) => api.post('/vendors', data),
  getAll: (params) => api.get('/vendors', { params }),
  getById: (id, profileId) => api.get(`/vendors/${id}`, { params: { profileId } }),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id, profileId) => api.delete(`/vendors/${id}`, { params: { profileId } })
};

// Dashboard APIs
export const dashboardAPI = {
  getOverview: (params) => api.get('/dashboard/overview', { params }),
  getCategoryBreakdown: (params) => api.get('/dashboard/category-breakdown', { params }),
  getRecentTransactions: (params) => api.get('/dashboard/recent-transactions', { params }),
  getCashFlow: (params) => api.get('/dashboard/cash-flow', { params })
};

// Report APIs
export const reportAPI = {
  getProfitLoss: (params) => api.get('/reports/profit-loss', { params }),
  getCashFlow: (params) => api.get('/reports/cash-flow', { params }),
  getTaxReport: (params) => api.get('/reports/tax-report', { params }),
  save: (data) => api.post('/reports/save', data),
  getSaved: (params) => api.get('/reports/saved', { params })
};

export default api;