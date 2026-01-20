import { useState } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../config';
import './LoginModal.css';

function LoginModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, formData);
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Close modal and redirect
        onClose();
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error details:', err);
      
      let errorMsg = 'Login failed. Please try again.';
      
      if (err.response) {
        errorMsg = err.response.data?.error || 
                   err.response.data?.message || 
                   err.response.statusText || 
                   'Invalid Credentials';
      } else if (err.request) {
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        errorMsg = err.message || 'An error occurred';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-backdrop" onClick={handleBackdropClick}>
      <div className="login-modal-container">
        <button 
          className="login-modal-close" 
          onClick={onClose}
          title="Close login"
          aria-label="Close login modal"
        >
          ✕
        </button>

        <div className="login-modal-card">
          {/* Logo Section */}
          <div className="login-logo-section">
            <div className="brand-logo">
              <img src="/logo.png" alt="Desi Plaza Logo" className="logo-image" />
            </div>
          </div>

          {/* Company Name */}
          <div className="login-company-info">
            <h1 className="brand-title">Desi Plaza</h1>
            <p className="brand-subtitle">Caterings & Events</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className={`form-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
              <div className="form-input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Email Address"
                  className="form-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={`form-group ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'filled' : ''}`}>
              <div className="form-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Password"
                  minLength="8"
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span className="button-text">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>Sign In</>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
