import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Table from '../common/Table';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import { listSuppliers, deleteSupplier } from '../../services/supplierService';
import { ALERT_TYPES } from '../../utils/constants';

const ListSuppliers = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, supplier: null });

  const columns = [
    { header: 'Supplier ID', accessor: 'supplier_id' },
    { header: 'Name', accessor: 'supplier_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Address', accessor: 'address' },
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await listSuppliers();
      setSuppliers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (supplier) => {
    navigate(`/suppliers/${supplier.supplier_id}`);
  };

  const handleEdit = (supplier) => {
    navigate(`/suppliers/update/${supplier.supplier_id}`);
  };

  const handleDelete = (supplier) => {
    setDeleteModal({ isOpen: true, supplier });
  };

  const confirmDelete = async () => {
    try {
      await deleteSupplier(deleteModal.supplier.supplier_id);
      setSuppliers(prev => prev.filter(s => s.supplier_id !== deleteModal.supplier.supplier_id));
      setDeleteModal({ isOpen: false, supplier: null });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Card title="Suppliers">
      {error && (
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={error}
          onClose={() => setError('')}
        />
      )}

      {isAdmin && (
        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
          <Button
            variant="primary"
            onClick={() => navigate('/suppliers/create')}
          >
            + Create Supplier
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        data={suppliers}
        onView={handleView}
        onEdit={isAdmin ? handleEdit : null}
        onDelete={isAdmin ? handleDelete : null}
        showActions={true}
        loading={loading}
        emptyMessage="No suppliers found"
      />

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, supplier: null })}
        title="Confirm Delete"
        size="small"
      >
        <p>Are you sure you want to delete supplier "{deleteModal.supplier?.supplier_name}"?</p>
        <p style={{ color: '#dc3545', fontSize: '14px' }}>This action cannot be undone.</p>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Button
            variant="danger"
            fullWidth
            onClick={confirmDelete}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => setDeleteModal({ isOpen: false, supplier: null })}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </Card>
  );
};

export default ListSuppliers;