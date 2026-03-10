import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { ALERT_TYPES } from '../../utils/constants';

const UpdateWarehouse = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { warehouse, loading, error, updateWarehouse, fetchWarehouse } = useWarehouse();
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    warehouse_name: '',
    warehouse_email: '',
    warehouse_phone: '',
    address: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dataFetched, setDataFetched] = useState(false);

  // Use useCallback to memoize the load function
  const loadWarehouse = useCallback(async () => {
    if (!dataFetched) {
      await fetchWarehouse();
      setDataFetched(true);
    }
  }, [fetchWarehouse, dataFetched]);

  useEffect(() => {
    loadWarehouse();
  }, [loadWarehouse]);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        warehouse_name: warehouse.warehouse_name || '',
        warehouse_email: warehouse.warehouse_email || '',
        warehouse_phone: warehouse.warehouse_phone || '',
        address: warehouse.address || ''
      });
      setOriginalData({
        warehouse_name: warehouse.warehouse_name || '',
        warehouse_email: warehouse.warehouse_email || '',
        warehouse_phone: warehouse.warehouse_phone || '',
        address: warehouse.address || ''
      });
    }
  }, [warehouse]);

  const validateField = (name, value) => {
    switch (name) {
      case 'warehouse_name':
        if (!value) return 'Warehouse name is required';
        if (value.length < 3) return 'Warehouse name must be at least 3 characters';
        return '';
      case 'warehouse_email':
        if (value && !/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
        return '';
      case 'warehouse_phone':
        if (value && !/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) {
          return 'Phone number must be 10 digits';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      setErrors({ form: 'No changes detected' });
      return;
    }

    setUpdating(true);
    setSuccess('');

    try {
      await updateWarehouse(formData);
      setSuccess('Warehouse updated successfully!');
      
      setTimeout(() => {
        navigate('/warehouse');
      }, 2000);
    } catch (error) {
      setErrors({ form: error.message || 'Failed to update warehouse' });
    } finally {
      setUpdating(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...originalData });
    setErrors({});
    setTouched({});
  };

  if (loading && !warehouse) {
    return (
      <Card title="Update Warehouse">
        <Loader text="Loading warehouse data..." />
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card title="Access Denied">
        <Alert 
          type={ALERT_TYPES.WARNING} 
          message="You don't have permission to update warehouse information."
        />
        <Button variant="primary" onClick={() => navigate('/warehouse')}>
          Back to Warehouse
        </Button>
      </Card>
    );
  }

  return (
    <Card title="Update Warehouse">
      {success && (
        <Alert 
          type={ALERT_TYPES.SUCCESS} 
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {errors.form && (
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={errors.form}
          onClose={() => setErrors(prev => ({ ...prev, form: '' }))}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Warehouse Name"
          name="warehouse_name"
          value={formData.warehouse_name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.warehouse_name}
          touched={touched.warehouse_name}
          placeholder="Enter warehouse name"
          required
        />

        <Input
          label="Email"
          type="email"
          name="warehouse_email"
          value={formData.warehouse_email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.warehouse_email}
          touched={touched.warehouse_email}
          placeholder="Enter warehouse email"
        />

        <Input
          label="Phone"
          name="warehouse_phone"
          value={formData.warehouse_phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.warehouse_phone}
          touched={touched.warehouse_phone}
          placeholder="Enter 10-digit phone number"
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.address}
          touched={touched.address}
          placeholder="Enter warehouse address"
        />

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <Button
            type="submit"
            variant="primary"
            disabled={updating || !hasChanges()}
            loading={updating}
            style={{ flex: 2 }}
          >
            {updating ? 'Updating...' : 'Update Warehouse'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={updating || !hasChanges()}
            style={{ flex: 1 }}
          >
            Reset Changes
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/warehouse')}
            disabled={updating}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UpdateWarehouse;