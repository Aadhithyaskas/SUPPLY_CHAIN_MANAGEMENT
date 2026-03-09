import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { forgotPasswordOTP } from '../../services/authService';
import { ALERT_TYPES } from '../../utils/constants';
import { validateEmail } from '../../utils/validators';

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
      
      // Store email for reset password page
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
    <Card title="Forgot Password">
      <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
        Enter your email address to receive a password reset OTP.
      </p>

      {error && (
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={error}
          onClose={() => setError('')}
        />
      )}

      {success && (
        <Alert 
          type={ALERT_TYPES.SUCCESS} 
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your registered email"
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Send OTP
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

export default ForgotPassword;