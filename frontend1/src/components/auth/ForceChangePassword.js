import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { forceChangePassword } from '../../services/authService';
import { ALERT_TYPES } from '../../utils/constants';
import useForm from '../../hooks/useForm';

const validatePassword = (values) => {
  const errors = {};
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

const ForceChangePassword = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      
      // Update user context
      setUser({ ...user, forceChangePassword: false });
      
      setSuccess('Password changed successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Change Password (First Login)">
      <p style={{ 
        textAlign: 'center', 
        marginBottom: '20px', 
        color: '#666',
        backgroundColor: '#e7f3ff',
        padding: '10px',
        borderRadius: '4px'
      }}>
        You must change your password before continuing.
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
          Change Password
        </Button>
      </form>
    </Card>
  );
};

export default ForceChangePassword;