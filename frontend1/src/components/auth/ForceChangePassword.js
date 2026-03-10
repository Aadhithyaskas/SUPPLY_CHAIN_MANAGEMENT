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
      
      // Update user context
      setUser({ ...user, forceChangePassword: false });
      
      setSuccess('Password changed successfully!');
      setShowSuccess(true);
      
      // Redirect to login success page after 2 seconds
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
      <Card title="✅ Password Changed Successfully!">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>
            🔐
          </div>
          
          <h2 style={{ color: '#28a745', marginBottom: '15px' }}>
            Your password has been updated!
          </h2>
          
          <p style={{ fontSize: '16px', marginBottom: '20px', color: '#666' }}>
            You can now log in with your new password.
          </p>
          
          <div style={{ 
            backgroundColor: '#d4edda', 
            padding: '15px', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '5px 0', color: '#155724' }}>
              <strong>📝 Remember:</strong>
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              • Use your new password for future logins
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              • Keep your password secure
            </p>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              • You can reset it anytime if forgotten
            </p>
          </div>
          
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Redirecting to login success page...
          </p>
          
          <Button 
            variant="primary" 
            onClick={() => navigate('/login-success')}
          >
            Continue to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

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

        {/* Password Requirements */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '13px'
        }}>
          <strong>Password Requirements:</strong>
          <ul style={{ marginTop: '5px', marginLeft: '20px', color: '#666' }}>
            <li>At least 8 characters long</li>
            <li>At least one uppercase letter</li>
            <li>At least one number</li>
          </ul>
        </div>

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