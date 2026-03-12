import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import { forceChangePassword } from '../../services/authService';
import { ALERT_TYPES } from '../../utils/constants';
import useForm from '../../hooks/useForm';
import './ForceChangePassword.css';

const validatePassword = (values) => {
  const errors = {};
  if (!values.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (values.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters';
  } else if (!/[A-Z]/.test(values.newPassword)) {
    errors.newPassword = 'Password must contain at least one uppercase letter';
  } else if (!/[0-9]/.test(values.newPassword)) {
    errors.newPassword = 'Password must contain at least one number';
  }
  
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
};

const ForceChangePassword = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, isValid } = useForm(
    { newPassword: '', confirmPassword: '' },
    validatePassword
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forceChangePassword(values.newPassword, values.confirmPassword);
      setUser({ ...user, forceChangePassword: false });
      setSuccess('Password changed successfully!');
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/login-success');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="force-change-container">
        <div className="force-change-square">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Password Changed!</h2>
          <p className="success-message">Your password has been updated.</p>
          <div className="loading-spinner success-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="force-change-container">
      <div className="force-change-square">
        <h1 className="square-title">Change Password</h1>
        <p className="square-subtitle">First time login</p>

        <div className="info-banner">
          <i className="fas fa-info-circle"></i>
          <span>You must change your password</span>
        </div>

        {error && (
          <Alert 
            type={ALERT_TYPES.ERROR} 
            message={error}
            onClose={() => setError('')}
            className="form-alert"
          />
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="New password"
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
              placeholder="Confirm password"
              className={`input-field ${touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}`}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          {/* Password Rules */}
          <div className="password-rules">
            <div className="rules-title">Password must:</div>
            <ul className="rules-list">
              <li className={values.newPassword.length >= 8 ? 'rule-met' : ''}>
                <i className={`fas ${values.newPassword.length >= 8 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                8+ characters
              </li>
              <li className={/[A-Z]/.test(values.newPassword) ? 'rule-met' : ''}>
                <i className={`fas ${/[A-Z]/.test(values.newPassword) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                Uppercase letter
              </li>
              <li className={/[0-9]/.test(values.newPassword) ? 'rule-met' : ''}>
                <i className={`fas ${/[0-9]/.test(values.newPassword) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                One number
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForceChangePassword;