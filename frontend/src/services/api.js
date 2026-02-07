import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors
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

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Expense API
export const expenseAPI = {
  getAll: (params) => api.get('/expenses/', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses/', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getStats: (params) => api.get('/expenses/stats', { params }),
  getByCategory: (params) => api.get('/expenses/by-category', { params }),
  getMonthly: (params) => api.get('/expenses/monthly', { params }),
  exportCSV: () => api.get('/expenses/export/csv', { responseType: 'blob' }),
};

// Income API
export const incomeAPI = {
  getAll: (params) => api.get('/income/', { params }),
  getById: (id) => api.get(`/income/${id}`),
  create: (data) => api.post('/income/', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
  getStats: (params) => api.get('/income/stats', { params }),
  exportCSV: () => api.get('/income/export/csv', { responseType: 'blob' }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getExpenseTrend: (params) => api.get('/dashboard/expense-trend', { params }),
  getIncomeVsExpense: (params) => api.get('/dashboard/income-vs-expense', { params }),
};

export default api;
