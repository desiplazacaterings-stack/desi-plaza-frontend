/**
 * Axios Interceptor Setup
 * Handles authentication errors and token validation
 */

import axios from 'axios';
import { clearAuthData } from './authUtils';

export const setupAxiosInterceptors = () => {
  // Response interceptor to handle 401 errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // If we get a 401 Unauthorized error, clear the token
      if (error.response?.status === 401) {
        console.log('Received 401 Unauthorized, clearing authentication');
        clearAuthData();
        
        // Optionally redirect to login
        // window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );

  // Request interceptor to add token to all API calls
  axios.interceptors.request.use(
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
};

export default setupAxiosInterceptors;
