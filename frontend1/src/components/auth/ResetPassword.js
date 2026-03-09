import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { resetPassword } from '../../services/authService';
import { ALERT_TYPES, OTP_LENGTH } from '../../utils/constants';
import useForm from '../../hooks/useForm';

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
    <Card title="Reset Password">
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
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
          placeholder="Enter your email"
          required
        />

        <Input
          label="OTP"
          type="text"
          name="otp"
          value={values.otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
            setFieldValue('otp', value);
          }}
          onBlur={handleBlur}
          error={errors.otp}
          touched={touched.otp}
          placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
          required
          maxLength={OTP_LENGTH}
        />

        <Input
          label="New Password"
          type="password"
          name="newPassword"
          value={values.newPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.newPassword}
          touched={touched.newPassword}
          placeholder="Enter new password"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
          placeholder="Confirm new password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Reset Password
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

export default ResetPassword;