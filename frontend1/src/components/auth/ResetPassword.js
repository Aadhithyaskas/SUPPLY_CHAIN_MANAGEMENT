import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { resetPassword } from '../../services/authService';
import { ALERT_TYPES, OTP_LENGTH } from '../../utils/constants';
import useForm from '../../hooks/useForm';
import './ResetPassword.css';

const validateResetPassword = (values) => {
  const errors = {};
  
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!values.otp) {
    errors.otp = 'OTP is required';
  } else if (values.otp.length !== OTP_LENGTH) {
    errors.otp = `OTP must be ${OTP_LENGTH} digits`;
  }
  
  if (!values.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (values.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters';
  }
  
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { values, errors, touched, handleChange, handleBlur, isValid, setFieldValue } = useForm(
    { 
      email: sessionStorage.getItem('resetEmail') || '', 
      otp: '', 
      newPassword: '', 
      confirmPassword: '' 
    },
    validateResetPassword
  );

  useEffect(() => {
    // Clear stored email after retrieving
    if (values.email) {
      sessionStorage.removeItem('resetEmail');
    }
  }, [values.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(values.email, values.otp, values.newPassword);
      setSuccess('Password reset successful! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-wrapper">
        <div className="welcome-section">
          <h1 className="welcome-title">Reset</h1>
          <p className="welcome-subtitle">Create new password</p>
        </div>

        <div className="reset-section">
          <div className="reset-header">
            <h2>Reset Password</h2>
          </div>

          {error && (
            <Alert 
              type={ALERT_TYPES.ERROR} 
              message={error}
              onClose={() => setError('')}
              className="reset-alert"
            />
          )}

          {success && (
            <Alert 
              type={ALERT_TYPES.SUCCESS} 
              message={success}
              onClose={() => setSuccess('')}
              className="reset-alert"
            />
          )}

          <form onSubmit={handleSubmit} className="reset-form">
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
                placeholder="Enter your email"
                className={`input-field ${touched.email && errors.email ? 'input-error' : ''}`}
                readOnly={!!sessionStorage.getItem('resetEmail')}
              />
              {touched.email && errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-key"></i> OTP
              </label>
              <input
                type="text"
                name="otp"
                value={values.otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
                  setFieldValue('otp', value);
                }}
                onBlur={handleBlur}
                placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
                className={`input-field ${touched.otp && errors.otp ? 'input-error' : ''}`}
                maxLength={OTP_LENGTH}
              />
              {touched.otp && errors.otp && (
                <div className="error-message">{errors.otp}</div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-lock"></i> New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter new password"
                className={`input-field ${touched.newPassword && errors.newPassword ? 'input-error' : ''}`}
              />
              {touched.newPassword && errors.newPassword && (
                <div className="error-message">{errors.newPassword}</div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-lock"></i> Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm new password"
                className={`input-field ${touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}`}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <div className="error-message">{errors.confirmPassword}</div>
              )}
            </div>

            <button
              type="submit"
              className="reset-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="reset-footer">
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="back-link"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;