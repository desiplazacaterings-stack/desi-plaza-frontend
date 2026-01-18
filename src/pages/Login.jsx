import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_ENDPOINTS from '../config';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
        
        // Redirect to home with a small delay to ensure localStorage is set
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error details:', err);
      
      // Handle different error types
      let errorMsg = 'Login failed. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        errorMsg = err.response.data?.error || 
                   err.response.data?.message || 
                   err.response.statusText || 
                   'Invalid Credentials';
      } else if (err.request) {
        // Request made but no response
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        // Error in request setup
        errorMsg = err.message || 'An error occurred';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
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

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
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

          {/* Footer */}
          <div className="login-footer">
            <p>Don't have an account? <a href="/register">Create one</a></p>
            <p><a href="/">← Back to Home</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
