// API Configuration
// This ensures all API calls use the same base URL
// Easy to update for different environments

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://desi-plaza-backend-1.onrender.com';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  ENQUIRIES: {
    BASE: `${API_BASE_URL}/api/enquiries`,
    GET_ALL: `${API_BASE_URL}/api/enquiries`,
    CREATE: `${API_BASE_URL}/api/enquiries`,
    GET_ONE: (id) => `${API_BASE_URL}/api/enquiries/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/enquiries/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/enquiries/${id}`,
  },
  QUOTATIONS: {
    BASE: `${API_BASE_URL}/api/quotations`,
    GET_ALL: `${API_BASE_URL}/api/quotations`,
    CREATE: `${API_BASE_URL}/api/quotations`,
    GET_ONE: (id) => `${API_BASE_URL}/api/quotations/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/quotations/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/quotations/${id}`,
  },
  ITEMS: {
    BASE: `${API_BASE_URL}/api/items`,
    GET_ALL: `${API_BASE_URL}/api/items`,
    CREATE: `${API_BASE_URL}/api/items`,
    GET_ONE: (id) => `${API_BASE_URL}/api/items/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/items/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/items/${id}`,
  },
  ORDERS: {
    BASE: `${API_BASE_URL}/api/orders`,
    GET_ALL: `${API_BASE_URL}/api/orders`,
    CREATE: `${API_BASE_URL}/api/orders`,
    GET_ONE: (id) => `${API_BASE_URL}/api/orders/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/orders/${id}`,
    PATCH: (id) => `${API_BASE_URL}/api/orders/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/orders/${id}`,
  },
  SCHEDULES: {
    BASE: `${API_BASE_URL}/api/schedules`,
    GET_ALL: `${API_BASE_URL}/api/schedules`,
    CREATE: `${API_BASE_URL}/api/schedules`,
    GET_ONE: (id) => `${API_BASE_URL}/api/schedules/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/schedules/${id}`,
    COMPLETE: (id) => `${API_BASE_URL}/api/schedules/${id}/complete`,
    DELETE: (id) => `${API_BASE_URL}/api/schedules/${id}`,
  },
};

export default API_ENDPOINTS;
