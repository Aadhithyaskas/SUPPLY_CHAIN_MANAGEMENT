import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import useOTPTimer from '../../hooks/useOTPTimer';
import { ALERT_TYPES, OTP_LENGTH } from '../../utils/constants';
import './OTPVerification.css';

const OTPVerification = () => {
  const navigate = useNavigate();
  const { verifyOTPAndLogin, tempUserData, isAuthenticated } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { timeLeft, formattedTime, isActive, canResend, startTimer } = useOTPTimer(60);

  const handleResendOTP = useCallback(() => {
    // Implement resend OTP logic here
    startTimer();
    setOtp('');
    setSuccessMessage('New OTP sent to your email');
    setError('');
  }, [startTimer]);

  useEffect(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (!tempUserData) {
      navigate('/login');
    }
  }, [tempUserData, navigate]);

  // Don't redirect if we're showing success
  useEffect(() => {
    if (isAuthenticated && !verificationSuccess) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, verificationSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) return;

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const result = await verifyOTPAndLogin(otp);
      
      if (result.success) {
        setVerificationSuccess(true);
        
        if (result.forceChangePassword) {
          // First time user - needs to change password
          setSuccessMessage('OTP verified! Redirecting to change your password...');
          setTimeout(() => {
            navigate('/force-change-password');
          }, 2000);
        } else {
          // Returning user - show login success
          if (result.showWelcomeBack) {
            setSuccessMessage(result.welcomeBackMessage);
          } else {
            setSuccessMessage('Login successful! Welcome back!');
          }
          setTimeout(() => {
            navigate('/login-success');
          }, 2000);
        }
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
        setVerificationSuccess(false);
      }
    } catch (error) {
      setError(error.message || 'Verification failed');
      setVerificationSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Show success state
  if (verificationSuccess) {
    return (
      <div className="otp-verification-container">
        <div className="otp-verification-wrapper">
          <div className="welcome-section">
            <h1 className="welcome-title">Success</h1>
            <p className="welcome-subtitle">OTP Verified</p>
          </div>

          <div className="otp-section">
            <div className="success-content">
              <div className="success-icon">✓</div>
              <h2 className="success-title">OTP Verified Successfully!</h2>
              <p className="success-message">
                {successMessage || 'Redirecting you...'}
              </p>
              <div className="loading-spinner success-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-verification-container">
      <div className="otp-verification-wrapper">
        <div className="welcome-section">
          <h1 className="welcome-title">Verify</h1>
          <p className="welcome-subtitle">Enter OTP Code</p>
        </div>

        <div className="otp-section">
          <div className="otp-header">
            <h2>OTP Verification</h2>
          </div>

          <p className="otp-description">
            Enter the 6-digit OTP sent to <strong>{tempUserData?.email}</strong>
          </p>

          {error && (
            <Alert 
              type={ALERT_TYPES.ERROR} 
              message={error}
              onClose={() => setError('')}
              className="otp-alert"
            />
          )}

          {successMessage && !verificationSuccess && (
            <Alert 
              type={ALERT_TYPES.SUCCESS} 
              message={successMessage}
              onClose={() => setSuccessMessage('')}
              className="otp-alert"
            />
          )}

          <form onSubmit={handleSubmit} className="otp-form">
            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-key"></i> OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
                placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
                className="input-field"
                maxLength={OTP_LENGTH}
                autoFocus
              />
            </div>

            <div className="resend-section">
              {isActive ? (
                <span className="timer-text">
                  Resend OTP in {formattedTime}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend}
                  className="resend-btn"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              className="verify-btn"
              disabled={loading || otp.length !== OTP_LENGTH}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          <div className="otp-footer">
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

export default OTPVerification;