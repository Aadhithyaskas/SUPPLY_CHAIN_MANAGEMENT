import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { createVendor } from '../../services/vendorService';
import { ALERT_TYPES } from '../../utils/constants';
import { validateVendorForm } from '../../utils/validators';

const CreateVendor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vendor_name: '',
    email: '',
    lead_time: '',
    address: '',
    phone: ''
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
    
    const validationErrors = validateVendorForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await createVendor(formData);
      setSuccess(`Vendor created successfully! ID: ${response.vendor_id}`);
      
      setTimeout(() => {
        navigate('/vendors');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create Vendor">
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
          label="Vendor Name"
          name="vendor_name"
          value={formData.vendor_name}
          onChange={handleChange}
          error={errors.vendor_name}
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
          label="Lead Time (days)"
          type="number"
          name="lead_time"
          value={formData.lead_time}
          onChange={handleChange}
          error={errors.lead_time}
          touched={true}
          min="0"
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          touched={true}
          placeholder="Enter vendor address"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Create Vendor
        </Button>
      </form>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/vendors')}
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
};

export default CreateVendor;