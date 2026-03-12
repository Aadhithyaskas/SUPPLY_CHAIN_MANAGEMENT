import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { forgotPasswordOTP } from '../../services/authService';
import { ALERT_TYPES } from '../../utils/constants';
import { validateEmail } from '../../utils/validators';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forgotPasswordOTP(email);
      setSuccess('OTP sent to your email. Redirecting to reset password...');
      
      sessionStorage.setItem('resetEmail', email);
      
      setTimeout(() => {
        navigate('/reset-password');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1 className="forgot-title">Forgot Password</h1>
        
        <p className="forgot-description">
          Enter your email address to receive a password reset OTP.
        </p>

        {error && (
          <Alert 
            type={ALERT_TYPES.ERROR} 
            message={error}
            onClose={() => setError('')}
            className="forgot-alert"
          />
        )}

        {success && (
          <Alert 
            type={ALERT_TYPES.SUCCESS} 
            message={success}
            onClose={() => setSuccess('')}
            className="forgot-alert"
          />
        )}

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group">
            <label className="input-label">
              <i className="fas fa-envelope"></i> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>

        <div className="back-to-login">
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="back-link"
          >
            ← Back to Login
          </button>
        </div>

        <div className="copyright">
          <p>© 2024 WMS</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;