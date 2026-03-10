import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { getEmployee, updateEmployee } from '../../services/adminService';
import { ALERT_TYPES, ROLE_OPTIONS, ROLE_LABELS } from '../../utils/constants';

const UpdateEmployee = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    f_name: '',
    l_name: '',
    role: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch employee details
  const fetchEmployee = useCallback(async () => {
    try {
      const data = await getEmployee(employeeId);
      setFormData({
        username: data.username || '',
        email: data.email || '',
        f_name: data.first_name || '',
        l_name: data.last_name || '',
        role: data.role || ''
      });
      setOriginalData({
        username: data.username || '',
        email: data.email || '',
        f_name: data.first_name || '',
        l_name: data.last_name || '',
        role: data.role || ''
      });
    } catch (error) {
      setApiError(error.message || 'Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  // Validation functions
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

  // Check if data has changed
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // Get changed fields
  const getChangedFields = () => {
    const changes = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalData?.[key]) {
        changes[key] = {
          from: originalData?.[key],
          to: formData[key]
        };
      }
    });
    return changes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      setApiError('No changes detected');
      return;
    }

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setUpdating(true);
    setApiError('');
    
    try {
      const changedFields = getChangedFields();
      await updateEmployee(employeeId, formData);
      setSuccess('Employee updated successfully!');
      
      // Update original data
      setOriginalData({ ...formData });
      setShowConfirm(false);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/employees');
      }, 2000);
    } catch (error) {
      setApiError(error.message || 'Failed to update employee');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setErrors({});
    setTouched({});
    setApiError('');
  };

  if (loading) {
    return (
      <Card title="Update Employee">
        <Loader text="Loading employee details..." />
      </Card>
    );
  }

  const changedFields = getChangedFields();
  const hasUnsavedChanges = hasChanges();

  return (
    <Card title={`Update Employee: ${employeeId}`}>
      {/* Success Message */}
      {success && (
        <Alert 
          type={ALERT_TYPES.SUCCESS} 
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {/* Error Message */}
      {apiError && !success && (
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={apiError}
          onClose={() => setApiError('')}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#856404', marginBottom: '15px' }}>
            ⚠️ Confirm Changes
          </h4>
          
          <div style={{ marginBottom: '15px' }}>
            <p><strong>The following changes will be saved:</strong></p>
            <ul style={{ marginTop: '10px', listStyle: 'none', padding: 0 }}>
              {Object.entries(changedFields).map(([field, changes]) => (
                <li key={field} style={{
                  padding: '8px',
                  backgroundColor: '#fff',
                  marginBottom: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ffeeba'
                }}>
                  <strong>{field}:</strong> {changes.from} → <strong style={{ color: '#28a745' }}>{changes.to}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={updating}
              loading={updating}
            >
              {updating ? 'Saving...' : 'Yes, Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updating}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Update Form */}
      {!showConfirm && (
        <form onSubmit={handleSubmit}>
          {/* Employee ID (Read-only) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: '500', 
              fontSize: '14px' 
            }}>
              Employee ID
            </label>
            <div style={{
              padding: '10px 12px',
              backgroundColor: '#e9ecef',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#495057'
            }}>
              {employeeId}
            </div>
          </div>

          {/* Username Field */}
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username}
            touched={touched.username}
            placeholder="Enter username"
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

          {/* Role Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: '500', 
              fontSize: '14px' 
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
              <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                {errors.role}
              </div>
            )}
          </div>

          {/* Unsaved Changes Warning */}
          {hasUnsavedChanges && (
            <div style={{
              padding: '10px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeeba',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#856404'
            }}>
              ⚠️ You have unsaved changes
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '20px',
            flexWrap: 'wrap'
          }}>
            <Button
              type="submit"
              variant="primary"
              disabled={updating || !hasUnsavedChanges}
              loading={updating}
              style={{ flex: 2 }}
            >
              {updating ? 'Updating...' : 'Update Employee'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={updating || !hasUnsavedChanges}
              style={{ flex: 1 }}
            >
              Reset
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/employees')}
              disabled={updating}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Back Button */}
      {!showConfirm && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin/employees')}
          >
            ← Back to Employees
          </Button>
        </div>
      )}
    </Card>
  );
};

export default UpdateEmployee;