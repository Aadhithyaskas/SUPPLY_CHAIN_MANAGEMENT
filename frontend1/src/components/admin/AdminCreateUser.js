import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { adminCreateUser } from '../../services/adminService';
import { ALERT_TYPES, ROLE_OPTIONS, ROLE_LABELS } from '../../utils/constants';

const AdminCreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    f_name: '',
    l_name: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdEmployee, setCreatedEmployee] = useState(null);

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        return '';
      case 'f_name':
        if (!value) return 'First name is required';
        return '';
      case 'l_name':
        if (!value) return 'Last name is required';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        return '';
      case 'role':
        if (!value) return 'Role is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');
    setSuccess('');
    
    try {
      const response = await adminCreateUser(formData);
      setCreatedEmployee({
        ...formData,
        employeeId: response.employee_id
      });
      setSuccess(`Employee created successfully!`);
      
      // Reset form after successful creation
      setFormData({
        username: '',
        email: '',
        f_name: '',
        l_name: '',
        role: ''
      });
      setTouched({});
      
    } catch (error) {
      setApiError(error.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedEmployee(null);
    setSuccess('');
  };

  const handleViewEmployees = () => {
    navigate('/admin/employees');
  };

  // Get role description based on selected role
  const getRoleDescription = (role) => {
    const descriptions = {
      'inventory_manager': 'Can manage inventory, view reports',
      'quality_assistant': 'Can view reports and quality checks',
      'manager': 'Full access to vendors, suppliers, and inventory',
      'supervisor': 'Can manage inventory and view reports',
      'admin': 'Full system access including user management'
    };
    return descriptions[role] || '';
  };

  return (
    <Card title="Create New Employee">
      {/* Success Message with Employee Details */}
      {success && createdEmployee && (
        <div style={{ marginBottom: '20px' }}>
          <Alert 
            type={ALERT_TYPES.SUCCESS} 
            message={success}
            onClose={() => setSuccess('')}
          />
          
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            padding: '20px',
            marginTop: '10px'
          }}>
            <h3 style={{ color: '#155724', marginBottom: '15px' }}>
              ✅ Employee Created Successfully!
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '10px',
              marginBottom: '15px'
            }}>
              <strong>Employee ID:</strong>
              <span style={{ fontWeight: 'bold', color: '#007bff' }}>
                {createdEmployee.employeeId}
              </span>
              
              <strong>Name:</strong>
              <span>{createdEmployee.f_name} {createdEmployee.l_name}</span>
              
              <strong>Username:</strong>
              <span>{createdEmployee.username}</span>
              
              <strong>Email:</strong>
              <span>{createdEmployee.email}</span>
              
              <strong>Role:</strong>
              <span>
                {ROLE_LABELS[createdEmployee.role]} 
                <span style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  marginLeft: '10px',
                  fontStyle: 'italic'
                }}>
                  ({getRoleDescription(createdEmployee.role)})
                </span>
              </span>
            </div>
            
            <div style={{
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '4px',
              marginTop: '10px'
            }}>
              <p style={{ color: '#856404', marginBottom: '5px' }}>
                <strong>📧 Email Sent:</strong>
              </p>
              <p style={{ fontSize: '14px' }}>
                Login credentials have been sent to {createdEmployee.email}
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                Password: Auto-generated (user will be prompted to change on first login)
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginTop: '20px',
              justifyContent: 'center'
            }}>
              <Button
                variant="primary"
                onClick={handleCreateAnother}
              >
                ➕ Create Another Employee
              </Button>
              <Button
                variant="outline"
                onClick={handleViewEmployees}
              >
                👥 View All Employees
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {apiError && !success && (
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={apiError}
          onClose={() => setApiError('')}
        />
      )}

      {/* Create Form - Only show if no success or user wants to create another */}
      {(!success || !createdEmployee) && (
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username}
            touched={touched.username}
            placeholder="Enter username (min. 3 characters)"
            required
          />

          {/* First Name Field */}
          <Input
            label="First Name"
            name="f_name"
            value={formData.f_name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.f_name}
            touched={touched.f_name}
            placeholder="Enter first name"
            required
          />

          {/* Last Name Field */}
          <Input
            label="Last Name"
            name="l_name"
            value={formData.l_name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.l_name}
            touched={touched.l_name}
            placeholder="Enter last name"
            required
          />

          {/* Email Field */}
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            placeholder="Enter email address"
            required
          />

          {/* Role Selection with Descriptions */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: '500', 
              fontSize: '14px', 
              color: '#333' 
            }}>
              Role <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${errors.role && touched.role ? '#dc3545' : '#ced4da'}`,
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Select Role --</option>
              {ROLE_OPTIONS.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            {errors.role && touched.role && (
              <div style={{ 
                color: '#dc3545', 
                fontSize: '12px', 
                marginTop: '5px' 
              }}>
                {errors.role}
              </div>
            )}
            
            {/* Role Description */}
            {formData.role && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#e7f3ff',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                <strong>Role Description:</strong>
                <p style={{ marginTop: '5px', color: '#004085' }}>
                  {getRoleDescription(formData.role)}
                </p>
              </div>
            )}
          </div>

          {/* Role Permissions Preview */}
          {formData.role && (
            <div style={{
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <strong style={{ fontSize: '13px' }}>Role Permissions:</strong>
              <ul style={{ 
                marginTop: '10px', 
                fontSize: '12px',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ marginBottom: '5px' }}>
                  ✓ Can manage inventory: {formData.role === 'inventory_manager' || formData.role === 'manager' || formData.role === 'supervisor' || formData.role === 'admin' ? '✅' : '❌'}
                </li>
                <li style={{ marginBottom: '5px' }}>
                  ✓ Can view reports: {formData.role !== 'quality_assistant' ? '✅' : '✅'} (All roles)
                </li>
                <li style={{ marginBottom: '5px' }}>
                  ✓ Can manage vendors: {formData.role === 'manager' || formData.role === 'admin' ? '✅' : '❌'}
                </li>
                <li style={{ marginBottom: '5px' }}>
                  ✓ Can manage suppliers: {formData.role === 'manager' || formData.role === 'admin' ? '✅' : '❌'}
                </li>
                <li style={{ marginBottom: '5px' }}>
                  ✓ Can manage users: {formData.role === 'admin' ? '✅' : '❌'}
                </li>
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creating Employee...' : 'Create Employee'}
          </Button>
        </form>
      )}

      {/* Navigation Buttons */}
      {!success && (
        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          gap: '10px',
          justifyContent: 'center' 
        }}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin/employees')}
          >
            View All Employees
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AdminCreateUser;