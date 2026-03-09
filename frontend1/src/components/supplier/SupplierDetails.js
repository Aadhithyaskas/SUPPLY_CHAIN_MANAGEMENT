import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { getSupplier } from '../../services/supplierService';
import { ALERT_TYPES } from '../../utils/constants';

const SupplierDetails = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSupplierDetails();
  }, [supplierId]);

  const fetchSupplierDetails = async () => {
    setLoading(true);
    try {
      const data = await getSupplier(supplierId);
      setSupplier(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Loading supplier details..." />;
  }

  if (error) {
    return (
      <Card title="Error">
        <Alert type={ALERT_TYPES.ERROR} message={error} />
        <Button variant="primary" onClick={() => navigate('/suppliers')}>
          Back to Suppliers
        </Button>
      </Card>
    );
  }

  if (!supplier) {
    return (
      <Card title="Supplier Not Found">
        <Alert type={ALERT_TYPES.WARNING} message="Supplier not found" />
        <Button variant="primary" onClick={() => navigate('/suppliers')}>
          Back to Suppliers
        </Button>
      </Card>
    );
  }

  return (
    <Card title={`Supplier Details: ${supplier.supplier_name}`}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '150px 1fr',
          gap: '10px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <strong>Supplier ID:</strong>
          <span>{supplier.supplier_id}</span>

          <strong>Name:</strong>
          <span>{supplier.supplier_name}</span>

          <strong>Email:</strong>
          <span>{supplier.email || 'N/A'}</span>

          <strong>Phone:</strong>
          <span>{supplier.phone || 'N/A'}</span>

          <strong>Address:</strong>
          <span>{supplier.address || 'N/A'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <Button variant="outline" onClick={() => navigate('/suppliers')}>
          Back to List
        </Button>
        {isAdmin && (
          <>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/suppliers/update/${supplier.supplier_id}`)}
            >
              Edit
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default SupplierDetails;