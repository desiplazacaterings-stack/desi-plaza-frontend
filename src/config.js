// API Configuration
// This ensures all API calls use the same base URL
// Easy to update for different environments

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    BASE: `${API_BASE_URL}/api/auth`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  ADMIN: {
    BASE: `${API_BASE_URL}/api/admin`,
    USERS: `${API_BASE_URL}/api/admin/users`,
    GET_USER: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
    CREATE_USER: `${API_BASE_URL}/api/admin/users`,
    UPDATE_USER: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
    DELETE_USER: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
    CHANGE_STATUS: (id) => `${API_BASE_URL}/api/admin/users/${id}/status`,
    CHANGE_ROLE: (id) => `${API_BASE_URL}/api/admin/users/${id}/role`,
    GET_PERMISSIONS: (id) => `${API_BASE_URL}/api/admin/users/${id}/permissions`,
    UPDATE_PERMISSIONS: (id) => `${API_BASE_URL}/api/admin/users/${id}/permissions`,
    STATISTICS: `${API_BASE_URL}/api/admin/statistics/users`,
  },
  ENQUIRIES: {
    BASE: `${API_BASE_URL}/api/enquiries`,
    GET_ALL: `${API_BASE_URL}/api/enquiries`,
    CREATE: `${API_BASE_URL}/api/enquiries`,
    GET_ONE: (id) => `${API_BASE_URL}/api/enquiries/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/enquiries/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/enquiries/${id}`,
    CANCEL: (id) => `${API_BASE_URL}/api/enquiries/${id}/cancel`,
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
    SHORT_CLOSE: (id) => `${API_BASE_URL}/api/orders/${id}/short-close`,
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
  AGREEMENTS: {
    BASE: `${API_BASE_URL}/api/agreements`,
    GENERATE_LINK: `${API_BASE_URL}/api/agreements/generate-link`,
    VIEW: (token) => `${API_BASE_URL}/api/agreements/view/${token}`,
    SUBMIT_SIGNATURE: (token) => `${API_BASE_URL}/api/agreements/submit-signature/${token}`,
    GET: (id) => `${API_BASE_URL}/api/agreements/${id}`,
  },
};

export default API_ENDPOINTS;
