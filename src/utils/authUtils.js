/**
 * Authentication Utility Functions
 * Handles token validation, storage, and cleanup
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Check if stored token is valid by attempting to decode it locally
 * @returns {boolean} - True if token appears valid, false otherwise
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }

  try {
    // JWT format check - should have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format: expected 3 parts');
      return false;
    }

    // Try to decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      if (expirationDate < new Date()) {
        console.warn('Token has expired');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Verify token with the backend server
 * @returns {Promise<boolean>} - True if token is valid on server, false otherwise
 */
export const verifyTokenWithServer = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.warn('Server token verification failed:', response.status);
      // Clear invalid token immediately
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }

    const data = await response.json();
    console.log('Token verified successfully with server');
    return true;
  } catch (error) {
    console.error('Error verifying token with server:', error);
    // Clear on error to be safe
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = () => {
  console.log('Clearing authentication data');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get auth header for API calls
 * @returns {object|null} - Authorization header object or null if no valid token
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if valid token and user data exist
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return !!(token && user && isTokenValid());
};

/**
 * Get stored user data
 * @returns {object|null} - User object or null if not authenticated
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  
  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Perform logout - clear all auth data
 */
export const logout = () => {
  clearAuthData();
  // Optional: You might want to call a logout endpoint on the server
};

/**
 * Setup listener for logout in other browser tabs
 * @param {Function} onLogout - Callback function to execute when logout detected
 * @returns {Function} - Function to remove the listener
 */
export const setupStorageListener = (onLogout) => {
  const handleStorageChange = (event) => {
    // Detect if token was removed from localStorage
    if (event.key === 'token' && event.newValue === null) {
      console.log('Logout detected in another tab');
      // Execute the provided callback
      if (typeof onLogout === 'function') {
        onLogout();
      }
    }
  };

  // Add the event listener
  window.addEventListener('storage', handleStorageChange);

  // Return function to remove the listener (for cleanup)
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

export default {
  isTokenValid,
  verifyTokenWithServer,
  clearAuthData,
  getAuthHeader,
  isAuthenticated,
  getStoredUser,
  logout,
  setupStorageListener
};
