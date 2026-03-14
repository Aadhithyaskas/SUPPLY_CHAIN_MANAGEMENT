import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import useForm from '../../hooks/useForm';
import { validateRequired, validateEmail } from '../../utils/validators';
import { ALERT_TYPES } from '../../utils/constants';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [loginMode, setLoginMode] = useState('employee'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateLogin = (values) => {
    const errors = {};
    if (!validateRequired(values.email)) {
      errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      errors.email = 'Invalid email format';
    }
    if (loginMode === 'employee' && !validateRequired(values.employeeId)) {
      errors.employeeId = 'Employee ID is required';
    }
    if (!validateRequired(values.password)) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, isValid, resetForm } = useForm(
    { employeeId: '', email: '', password: '' },
    validateLogin
  );

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleModeChange = (mode) => {
    setLoginMode(mode);
    setError('');
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;
    setError('');
    setLoading(true);

    try {
      const result = await login({
        employeeId: loginMode === 'employee' ? values.employeeId : null,
        email: values.email,
        password: values.password
      });
      
      if (result.success) {
        navigate(result.requiresOTP ? '/otp-verification' : '/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome</h1>
          <p className="welcome-subtitle">
            {loginMode === 'employee' ? 'Access your employee portal' : 'Management and administration'}
          </p>
        </div>

        {/* Right Login Section */}
        <div className="login-section">
          <div className="login-tabs-container">
            <div className={`login-tabs-slider ${loginMode}`}></div>
            <button 
              type="button"
              className={`tab-btn ${loginMode === 'employee' ? 'active' : ''}`}
              onClick={() => handleModeChange('employee')}
            >
              <i className="fas fa-user"></i> Employee
            </button>
            <button 
              type="button"
              className={`tab-btn ${loginMode === 'admin' ? 'active' : ''}`}
              onClick={() => handleModeChange('admin')}
            >
              <i className="fas fa-user-shield"></i> Admin
            </button>
          </div>

          <div className="login-header">
            <h2>{loginMode === 'employee' ? 'Sign In' : 'Admin Login'}</h2>
          </div>

          {error && <Alert type={ALERT_TYPES.ERROR} message={error} onClose={() => setError('')} className="login-alert" />}
          
          <form onSubmit={handleSubmit} className="login-form">
            {loginMode === 'employee' && (
              <div className="input-group">
                <label className="input-label"><i className="fas fa-id-badge"></i> Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={values.employeeId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. EMP0001"
                  className={`input-field ${touched.employeeId && errors.employeeId ? 'input-error' : ''}`}
                />
                {touched.employeeId && errors.employeeId && <div className="error-message">{errors.employeeId}</div>}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-envelope"></i> {loginMode === 'employee' ? 'Work Email' : 'Admin Email'}
              </label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="name@company.com"
                className={`input-field ${touched.email && errors.email ? 'input-error' : ''}`}
              />
              {touched.email && errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="input-group">
              <label className="input-label"><i className="fas fa-lock"></i> Password</label>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`input-field ${touched.password && errors.password ? 'input-error' : ''}`}
              />
              {touched.password && errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="forgot-password-row">
              <button type="button" onClick={() => navigate('/forgot-password')} className="forgot-password-link">
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="signin-btn" disabled={loading}>
              {loading ? (
                <><span className="loading-spinner"></span> Processing...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;