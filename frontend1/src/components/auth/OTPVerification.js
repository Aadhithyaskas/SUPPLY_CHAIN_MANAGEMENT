import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import useOTPTimer from '../../hooks/useOTPTimer';
import { ALERT_TYPES, OTP_LENGTH } from '../../utils/constants';

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
      <Card title="✅ Verification Successful">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>
            ✨
          </div>
          
          <h2 style={{ color: '#28a745', marginBottom: '15px' }}>
            OTP Verified Successfully!
          </h2>
          
          <p style={{ fontSize: '16px', marginBottom: '20px', color: '#666' }}>
            {successMessage || 'Redirecting you...'}
          </p>
          
          <div style={{ 
            width: '50px',
            height: '50px',
            margin: '20px auto',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #28a745',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Verify OTP">
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>
        Enter the 6-digit OTP sent to <strong>{tempUserData?.email}</strong>
      </p>
      
      {error && (
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={error}
          onClose={() => setError('')}
        />
      )}

      {successMessage && (
        <Alert 
          type={ALERT_TYPES.SUCCESS} 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="OTP Code"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
          placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
          required
          maxLength={OTP_LENGTH}
        />

        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          {isActive ? (
            <span style={{ color: '#666' }}>
              Resend OTP in {formattedTime}
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              disabled={!canResend}
            >
              Resend OTP
            </Button>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading || otp.length !== OTP_LENGTH}
        >
          Verify OTP
        </Button>
      </form>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/login')}
        >
          Back to Login
        </Button>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Card>
  );
};

export default OTPVerification;