import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { getVendor } from '../../services/vendorService';
import { ALERT_TYPES } from '../../utils/constants';

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendorDetails();
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    setLoading(true);
    try {
      const data = await getVendor(vendorId);
      setVendor(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Loading vendor details..." />;
  }

  if (error) {
    return (
      <Card title="Error">
        <Alert type={ALERT_TYPES.ERROR} message={error} />
        <Button variant="primary" onClick={() => navigate('/vendors')}>
          Back to Vendors
        </Button>
      </Card>
    );
  }

  if (!vendor) {
    return (
      <Card title="Vendor Not Found">
        <Alert type={ALERT_TYPES.WARNING} message="Vendor not found" />
        <Button variant="primary" onClick={() => navigate('/vendors')}>
          Back to Vendors
        </Button>
      </Card>
    );
  }

  return (
    <Card title={`Vendor Details: ${vendor.vendor_name}`}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '150px 1fr',
          gap: '10px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <strong>Vendor ID:</strong>
          <span>{vendor.vendor_id}</span>

          <strong>Name:</strong>
          <span>{vendor.vendor_name}</span>

          <strong>Email:</strong>
          <span>{vendor.email || 'N/A'}</span>

          <strong>Phone:</strong>
          <span>{vendor.phone || 'N/A'}</span>

          <strong>Lead Time:</strong>
          <span>{vendor.lead_time ? `${vendor.lead_time} days` : 'N/A'}</span>

          <strong>Address:</strong>
          <span>{vendor.address || 'N/A'}</span>

          <strong>Created:</strong>
          <span>{vendor.created_at ? new Date(vendor.created_at).toLocaleString() : 'N/A'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <Button variant="outline" onClick={() => navigate('/vendors')}>
          Back to List
        </Button>
        {isAdmin && (
          <>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/vendors/update/${vendor.vendor_id}`)}
            >
              Edit
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default VendorDetails;