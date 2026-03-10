import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { createSupplier } from '../../services/supplierService';
import { ALERT_TYPES } from '../../utils/constants';
import { validateSupplierForm } from '../../utils/validators';

const CreateSupplier = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    supplier_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateSupplierForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await createSupplier(formData);
      setSuccess(`Supplier created successfully! ID: ${response.supplier_id}`);
      
      setTimeout(() => {
        navigate('/suppliers');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create Supplier">
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
          label="Supplier Name"
          name="supplier_name"
          value={formData.supplier_name}
          onChange={handleChange}
          error={errors.supplier_name}
          touched={true}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          touched={true}
        />

        <Input
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          touched={true}
          placeholder="10 digit phone number"
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          touched={true}
          placeholder="Enter supplier address"
        />

        <Input
          label="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={errors.city}
          touched={true}
          placeholder="Enter supplier city"
        />

        <Input
          label="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          error={errors.state}
          touched={true}
          placeholder="Enter supplier state"
        />

        <Input
          label="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          error={errors.country}
          touched={true}
          placeholder="Enter supplier country"
        />



        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Create Supplier
        </Button>
      </form>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/suppliers')}
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
};

export default CreateSupplier;