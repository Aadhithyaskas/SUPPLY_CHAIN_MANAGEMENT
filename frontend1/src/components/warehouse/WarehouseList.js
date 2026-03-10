import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import { ALERT_TYPES } from '../../utils/constants';

const WarehouseList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { warehouse, loading, error, fetchWarehouse } = useWarehouse();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, warehouse: null });
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
  }, [loadWarehouse]); // Only depends on memoized loadWarehouse

  const handleEdit = () => {
    navigate('/warehouse/update');
  };

  const handleDelete = () => {
    setDeleteModal({ isOpen: true, warehouse });
  };

  const confirmDelete = async () => {
    setDeleteModal({ isOpen: false, warehouse: null });
    alert('Delete functionality - API endpoint needed');
  };

  if (loading && !warehouse) {
    return (
      <Card title="Warehouse Management">
        <Loader text="Loading warehouse information..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Warehouse Management">
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={error}
          onClose={() => {}}
        />
        {isAdmin && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Button 
              variant="primary" 
              onClick={() => navigate('/warehouse/create')}
            >
              Create Warehouse
            </Button>
          </div>
        )}
      </Card>
    );
  }

  if (!warehouse) {
    return (
      <Card title="Warehouse Management">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>
            🏭
          </div>
          <h3 style={{ color: '#666', marginBottom: '15px' }}>
            No Warehouse Found
          </h3>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            A warehouse has not been set up in the system yet.
          </p>
          {isAdmin && (
            <Button 
              variant="primary" 
              onClick={() => navigate('/warehouse/create')}
            >
              Create Warehouse
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Warehouse Management">
      {/* Rest of your component remains the same */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}>{warehouse.warehouse_name}</h2>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
            ID: {warehouse.warehouse_id}
          </p>
        </div>
        
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button 
              variant="primary" 
              onClick={handleEdit}
            >
              ✏️ Edit Warehouse
            </Button>
            <Button 
              variant="outlineDanger" 
              onClick={handleDelete}
            >
              🗑️ Delete
            </Button>
          </div>
        )}
      </div>

      {/* Warehouse Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Contact Card */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ 
            marginBottom: '15px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#495057'
          }}>
            <span>📞</span> Contact Information
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '3px' }}>
              Email Address
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>
              {warehouse.warehouse_email ? (
                <a href={`mailto:${warehouse.warehouse_email}`} style={{ color: '#007bff' }}>
                  {warehouse.warehouse_email}
                </a>
              ) : (
                <span style={{ color: '#999' }}>Not provided</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '3px' }}>
              Phone Number
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>
              {warehouse.warehouse_phone ? (
                <a href={`tel:${warehouse.warehouse_phone}`} style={{ color: '#007bff' }}>
                  {warehouse.warehouse_phone}
                </a>
              ) : (
                <span style={{ color: '#999' }}>Not provided</span>
              )}
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ 
            marginBottom: '15px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#495057'
          }}>
            <span>📍</span> Address
          </h3>
          
          <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
            {warehouse.address ? (
              warehouse.address
            ) : (
              <span style={{ color: '#999', fontStyle: 'italic' }}>No address provided</span>
            )}
          </div>
        </div>

        {/* Quick Stats Card */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ 
            marginBottom: '15px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#495057'
          }}>
            <span>📊</span> Details
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Status:</span>
              <span style={{
                padding: '4px 8px',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Active
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Warehouse ID:</span>
              <span style={{ fontWeight: '500' }}>{warehouse.warehouse_id}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Created:</span>
              <span>
                {warehouse.created_at 
                  ? new Date(warehouse.created_at).toLocaleDateString() 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #dee2e6'
      }}>
        <Button
          variant="outline"
          onClick={() => navigate('/vendors')}
        >
          View Vendors
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/suppliers')}
        >
          View Suppliers
        </Button>
        {isAdmin && (
          <Button
            variant="outline"
            onClick={handleEdit}
          >
            Edit Details
          </Button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, warehouse: null })}
        title="Delete Warehouse"
        size="small"
      >
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>
            ⚠️
          </div>
          <p style={{ marginBottom: '15px', fontSize: '16px' }}>
            Are you sure you want to delete this warehouse?
          </p>
          <p style={{ 
            fontWeight: 'bold', 
            color: '#dc3545',
            marginBottom: '20px'
          }}>
            "{deleteModal.warehouse?.warehouse_name}"
          </p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setDeleteModal({ isOpen: false, warehouse: null })}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default WarehouseList;