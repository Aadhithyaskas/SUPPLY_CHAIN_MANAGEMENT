import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import useForm from '../../hooks/useForm';
import { validateRequired } from '../../utils/validators';
import { ALERT_TYPES } from '../../utils/constants';

const validateLogin = (values) => {
  const errors = {};
  if (!validateRequired(values.employeeId)) {
    errors.employeeId = 'Employee ID is required';
  }
  if (!validateRequired(values.password)) {
    errors.password = 'Password is required';
  }
  return errors;
};

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { values, errors, touched, handleChange, handleBlur, isValid } = useForm(
    { employeeId: '', email: '', password: '' },
    validateLogin
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return;

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const result = await login(values);
      
      if (result.success) {
        if (result.showWelcomeBack) {
          setSuccessMessage(result.message || 'Welcome back!');
        }
        
        if (result.requiresOTP) {
          navigate('/otp-verification');
        } else if (result.isFounderAdmin) {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Login to WMS">
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
          label="Employee ID"
          type="text"
          name="employeeId"
          value={values.employeeId}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.employeeId}
          touched={touched.employeeId}
          placeholder="Enter your employee ID"
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
          placeholder="Required for founder admin"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
          placeholder="Enter your password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Login
        </Button>
      </form>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/forgot-password')}
        >
          Forgot Password?
        </Button>
      </div>
    </Card>
  );
};

export default Login;