import { apiRequest } from './api';

// services/authService.js

export const login = (employeeId, email, password, adminId) => // Added adminId
  apiRequest('/auth/login/', 'POST', {
    employee_id: employeeId,
    email,
    password,
    admin_id: adminId, // Send to backend
  }, false);

export const verifyOTP = (employeeId, otp) =>
  apiRequest('/auth/verify-login-otp/', 'POST', {
    employee_id: employeeId,
    otp,
  }, false);

export const forgotPasswordOTP = (email) =>
  apiRequest('/auth/forgot-password-otp/', 'POST', { email }, false);

export const resetPassword = (email, otp, newPassword) =>
  apiRequest('/auth/reset-password/', 'POST', {
    email,
    otp,
    new_password: newPassword,
  }, false);

export const forceChangePassword = (newPassword, confirmPassword) =>
  apiRequest('/auth/force-change-password/', 'POST', {
    new_password: newPassword,
    confirm_password: confirmPassword,
  });

export const logout = () =>
  apiRequest('/auth/logout/', 'POST');

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  
  try {
    const response = await apiRequest('/token/refresh/', 'POST', {
      refresh: refreshToken
    }, false);
    
    if (response.access) {
      localStorage.setItem('accessToken', response.access);
      return response.access;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  
  return null;


};