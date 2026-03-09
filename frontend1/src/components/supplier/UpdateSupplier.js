import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { getSupplier, updateSupplier } from '../../services/supplierService';
import { ALERT_TYPES } from '../../utils/constants';
import { validateSupplierForm } from '../../utils/validators';

const UpdateSupplier = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    supplier_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSupplier();
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      const data = await getSupplier(supplierId);
      setFormData({
        supplier_name: data.supplier_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

    setUpdating(true);
    setError('');
    
    try {
      await updateSupplier(supplierId, formData);
      setSuccess('Supplier updated successfully!');
      
      setTimeout(() => {
        navigate('/suppliers');
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader text="Loading supplier data..." />;
  }

  return (
    <Card title="Update Supplier">
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

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={updating}
          disabled={updating}
        >
          Update Supplier
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

export default UpdateSupplier;