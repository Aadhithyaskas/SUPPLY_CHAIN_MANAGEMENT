import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Table from '../common/Table';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import { listVendors, deleteVendor } from '../../services/vendorService';
import { ALERT_TYPES } from '../../utils/constants';

const ListVendors = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    vendor: null,
    isDeleting: false 
  });

  // Define columns for the table
  const columns = [
    { 
      header: 'Vendor ID', 
      accessor: 'vendor_id',
      render: (value) => <strong>{value}</strong>
    },
    { 
      header: 'Name', 
      accessor: 'vendor_name',
      render: (value) => value || 'N/A'
    },
    { 
      header: 'Email', 
      accessor: 'email',
      render: (value) => value || 'N/A'
    },
    { 
      header: 'Phone', 
      accessor: 'phone',
      render: (value) => value || 'N/A'
    },
    { 
      header: 'Lead Time', 
      accessor: 'lead_time',
      render: (value) => value ? `${value} days` : 'N/A'
    },
    { 
      header: 'Address', 
      accessor: 'address',
      render: (value) => {
        if (!value) return 'N/A';
        return value.length > 30 ? `${value.substring(0, 30)}...` : value;
      }
    },
  ];

  // Fetch vendors - wrapped in useCallback to avoid dependency issues
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listVendors();
      setVendors(data);
    } catch (error) {
      setError(error.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Handlers for CRUD operations
  const handleView = (vendor) => {
    navigate(`/vendors/${vendor.vendor_id}`);
  };

  const handleEdit = (vendor) => {
    navigate(`/vendors/update/${vendor.vendor_id}`);
  };

  const handleDelete = (vendor) => {
    setDeleteModal({ 
      isOpen: true, 
      vendor, 
      isDeleting: false 
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.vendor) return;
    
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    
    try {
      await deleteVendor(deleteModal.vendor.vendor_id);
      // Remove vendor from list
      setVendors(prev => prev.filter(v => v.vendor_id !== deleteModal.vendor.vendor_id));
      // Close modal
      setDeleteModal({ isOpen: false, vendor: null, isDeleting: false });
    } catch (error) {
      setError(error.message || 'Failed to delete vendor');
      setDeleteModal({ isOpen: false, vendor: null, isDeleting: false });
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, vendor: null, isDeleting: false });
  };

  if (loading) {
    return (
      <Card title="Vendors">
        <Loader text="Loading vendors..." />
      </Card>
    );
  }

  return (
    <Card title="Vendors">
      {error && (
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <Button
            variant="primary"
            onClick={() => navigate('/vendors/create')}
          >
            + Create New Vendor
          </Button>
          <Button
            variant="outline"
            onClick={fetchVendors}
            disabled={loading}
          >
            ↻ Refresh
          </Button>
        </div>
      )}

      {/* Vendors Table */}
      <Table
        columns={columns}
        data={vendors}
        onView={handleView}
        onEdit={isAdmin ? handleEdit : null}
        onDelete={isAdmin ? handleDelete : null}
        showActions={true}
        loading={loading}
        emptyMessage="No vendors found. Click 'Create New Vendor' to add one."
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        size="small"
      >
        <div style={{ padding: '10px 0' }}>
          <p style={{ marginBottom: '15px', fontSize: '16px' }}>
            Are you sure you want to delete vendor:
          </p>
          <p style={{ 
            fontWeight: 'bold', 
            fontSize: '18px', 
            color: '#dc3545',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            "{deleteModal.vendor?.vendor_name}"?
          </p>
          <p style={{ 
            color: '#666', 
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Vendor ID: {deleteModal.vendor?.vendor_id}
          </p>
          <p style={{ 
            color: '#dc3545', 
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center',
            backgroundColor: '#f8d7da',
            padding: '10px',
            borderRadius: '4px'
          }}>
            ⚠️ This action cannot be undone. All associated data will be permanently deleted.
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '20px',
          justifyContent: 'center'
        }}>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deleteModal.isDeleting}
            loading={deleteModal.isDeleting}
          >
            {deleteModal.isDeleting ? 'Deleting...' : 'Yes, Delete Vendor'}
          </Button>
          <Button
            variant="outline"
            onClick={closeDeleteModal}
            disabled={deleteModal.isDeleting}
          >
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Summary Card */}
      {vendors.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}>
          <strong>Total Vendors:</strong> {vendors.length} | 
          <strong> Active:</strong> {vendors.filter(v => v.status !== 'inactive').length} | 
          <strong> Lead Time Avg:</strong> {
            vendors.length > 0 
              ? Math.round(vendors.reduce((acc, v) => acc + (v.lead_time || 0), 0) / vendors.length) 
              : 0
          } days
        </div>
      )}
    </Card>
  );
};

export default ListVendors;