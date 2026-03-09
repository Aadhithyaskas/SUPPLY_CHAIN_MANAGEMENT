import React, { useState, useEffect } from 'react';
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
  const { timeLeft, isActive, canResend, startTimer } = useOTPTimer(60);

  useEffect(() => {
    startTimer();
  }, []);

  useEffect(() => {
    if (!tempUserData) {
      navigate('/login');
    }
  }, [tempUserData, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) return;

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const result = await verifyOTPAndLogin(otp);
      
      if (result.success) {
        if (result.showWelcomeBack) {
          setSuccessMessage(result.welcomeBackMessage);
          setTimeout(() => {
            if (result.forceChangePassword) {
              navigate('/force-change-password');
            } else {
              navigate('/dashboard');
            }
          }, 2000);
        } else {
          if (result.forceChangePassword) {
            navigate('/force-change-password');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    // Implement resend OTP logic here
    startTimer();
    setOtp('');
    setSuccessMessage('New OTP sent to your email');
  };

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
              Resend OTP in {timeLeft} seconds
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
    </Card>
  );
};

export default OTPVerification;