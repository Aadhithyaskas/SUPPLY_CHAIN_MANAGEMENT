import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { getVendor, deleteVendor } from '../../services/vendorService';
import { ALERT_TYPES } from '../../utils/constants';

const DeleteVendor = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/vendors');
      return;
    }
    fetchVendor();
  }, [vendorId, isAdmin, navigate]);

  const fetchVendor = async () => {
    try {
      const data = await getVendor(vendorId);
      setVendor(data);
    } catch (error) {
      setError(error.message || 'Vendor not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== vendor?.vendor_name) {
      setError('Please type the vendor name to confirm deletion');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await deleteVendor(vendorId);
      setSuccess('Vendor deleted successfully!');
      setTimeout(() => {
        navigate('/vendors');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to delete vendor');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card title="Delete Vendor">
        <Loader text="Loading vendor details..." />
      </Card>
    );
  }

  if (!vendor) {
    return (
      <Card title="Delete Vendor">
        <Alert type={ALERT_TYPES.ERROR} message="Vendor not found" />
        <Button variant="primary" onClick={() => navigate('/vendors')}>
          Back to Vendors
        </Button>
      </Card>
    );
  }

  return (
    <Card title="Delete Vendor">
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

      <div style={{ 
        backgroundColor: '#f8d7da', 
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#721c24', marginBottom: '15px' }}>
          ⚠️ Warning: This action cannot be undone
        </h3>
        
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Vendor ID:</strong> {vendor.vendor_id}</p>
          <p><strong>Name:</strong> {vendor.vendor_name}</p>
          <p><strong>Email:</strong> {vendor.email || 'N/A'}</p>
          <p><strong>Lead Time:</strong> {vendor.lead_time ? `${vendor.lead_time} days` : 'N/A'}</p>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px',
            fontWeight: '500'
          }}>
            Type <strong>"{vendor.vendor_name}"</strong> to confirm deletion:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Enter vendor name"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center' 
      }}>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={deleting || confirmText !== vendor?.vendor_name}
          loading={deleting}
        >
          {deleting ? 'Deleting...' : 'Permanently Delete Vendor'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/vendors')}
          disabled={deleting}
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
};

export default DeleteVendor;