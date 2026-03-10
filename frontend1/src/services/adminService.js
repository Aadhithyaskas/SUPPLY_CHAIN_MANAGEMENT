import { apiRequest } from './api';

// Admin: Create new employee
export const adminCreateUser = (userData) =>
  apiRequest('/auth/admin-create-user/', 'POST', userData);

// Admin: Get single employee by ID
export const getEmployee = (employeeId) =>
  apiRequest(`/auth/list_employees/${employeeId}/`, 'GET');

// Admin: List all employees
export const listEmployees = () =>
  apiRequest('/auth/list_employees/', 'GET');

// Admin: Update employee
export const updateEmployee = (employeeId, data) => {
  // Format data for backend
  const formattedData = {
    username: data.username,
    email: data.email,
    f_name: data.f_name,
    l_name: data.l_name,
    role: data.role
  };
  return apiRequest(`/auth/update-user/${employeeId}/`, 'PUT', formattedData);
};

// Admin: Delete employee
export const deleteEmployee = (employeeId) =>
  apiRequest(`/auth/delete-user/${employeeId}/`, 'DELETE');