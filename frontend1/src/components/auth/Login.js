import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import useForm from '../../hooks/useForm';
import { validateRequired } from '../../utils/validators';
import { ALERT_TYPES } from '../../utils/constants';
import './Login.css';

const validateLogin = (values) => {
  const errors = {};
  if (!validateRequired(values.employeeId)) {
    errors.employeeId = 'Employee ID is required';
  }
  if (!validateRequired(values.password)) {
    errors.password = 'Password is required';
  }
  return errors;
};

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { values, errors, touched, handleChange, handleBlur, isValid } = useForm(
    { employeeId: '', email: '', password: '' },
    validateLogin
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const result = await login(values);
      
      if (result.success) {
        if (result.showWelcomeBack) {
          setSuccessMessage(result.message || 'Welcome back!');
        }
        
        if (result.requiresOTP) {
          navigate('/otp-verification');
        } else if (result.isFounderAdmin) {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome</h1>
          <p className="welcome-subtitle">Sign in to continue</p>
        </div>

        <div className="login-section">
          <div className="login-header">
            <h2>Sign In</h2>
          </div>

          {error && (
            <Alert 
              type={ALERT_TYPES.ERROR} 
              message={error}
              onClose={() => setError('')}
              className="login-alert"
            />
          )}
          
          {successMessage && (
            <Alert 
              type={ALERT_TYPES.SUCCESS} 
              message={successMessage}
              onClose={() => setSuccessMessage('')}
              className="login-alert"
            />
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-id-badge"></i> Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                value={values.employeeId}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter employee ID"
                className={`input-field ${touched.employeeId && errors.employeeId ? 'input-error' : ''}`}
              />
              {touched.employeeId && errors.employeeId && (
                <div className="error-message">{errors.employeeId}</div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-envelope"></i> Email
              </label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter email"
                className={`input-field ${touched.email && errors.email ? 'input-error' : ''}`}
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-lock"></i> Password
              </label>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter password"
                className={`input-field ${touched.password && errors.password ? 'input-error' : ''}`}
              />
              {touched.password && errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>

            <div className="forgot-password-row">
              <button 
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="forgot-password-link"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="signin-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-help">
            <p> <a href="/support"></a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;