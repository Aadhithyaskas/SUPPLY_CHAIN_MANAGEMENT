import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { ALERT_TYPES } from '../../utils/constants';
import { validateWarehouseForm } from '../../utils/validators';

const UpdateWarehouse = () => {
  const navigate = useNavigate();
  const { warehouse, updateWarehouse, fetchWarehouse, loading, error } = useWarehouse();
  const [formData, setFormData] = useState({
    warehouse_name: '',
    warehouse_email: '',
    warehouse_phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWarehouse();
  }, []);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        warehouse_name: warehouse.warehouse_name || '',
        warehouse_email: warehouse.warehouse_email || '',
        warehouse_phone: warehouse.warehouse_phone || '',
        address: warehouse.address || ''
      });
    }
  }, [warehouse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateWarehouseForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await updateWarehouse(formData);
      setSuccess('Warehouse updated successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      // Error is handled by context
    }
  };

  if (loading && !warehouse) {
    return <Loader text="Loading warehouse data..." />;
  }

  if (!warehouse && !loading) {
    return (
      <Card title="Update Warehouse">
        <Alert 
          type={ALERT_TYPES.WARNING} 
          message="No warehouse found. Please create a warehouse first."
        />
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <Button 
            variant="primary" 
            onClick={() => navigate('/warehouse/create')}
          >
            Create Warehouse
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Update Warehouse">
      {error && (
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={error}
          onClose={() => {}}
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
          label="Warehouse Name"
          name="warehouse_name"
          value={formData.warehouse_name}
          onChange={handleChange}
          error={formErrors.warehouse_name}
          touched={true}
          required
        />

        <Input
          label="Warehouse Email"
          type="email"
          name="warehouse_email"
          value={formData.warehouse_email}
          onChange={handleChange}
          error={formErrors.warehouse_email}
          touched={true}
        />

        <Input
          label="Warehouse Phone"
          name="warehouse_phone"
          value={formData.warehouse_phone}
          onChange={handleChange}
          error={formErrors.warehouse_phone}
          touched={true}
          placeholder="10 digit phone number"
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={formErrors.address}
          touched={true}
          placeholder="Enter warehouse address"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Update Warehouse
        </Button>
      </form>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
};

export default UpdateWarehouse;