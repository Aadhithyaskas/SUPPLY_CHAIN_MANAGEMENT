import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWarehouse } from '../../context/WarehouseContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { ALERT_TYPES } from '../../utils/constants';

const WarehouseDetails = () => {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { fetchWarehouseById, loading, error } = useWarehouse();
  const [warehouse, setWarehouse] = useState(null);

  useEffect(() => {
    loadWarehouse();
  }, [warehouseId]);

  const loadWarehouse = async () => {
    try {
      const data = await fetchWarehouseById(warehouseId);
      setWarehouse(data);
    } catch (error) {
      console.error('Failed to load warehouse:', error);
    }
  };

  if (loading) {
    return <Loader text="Loading warehouse details..." />;
  }

  if (error) {
    return (
      <Card title="Error">
        <Alert type={ALERT_TYPES.ERROR} message={error} />
        <Button variant="primary" onClick={() => navigate('/warehouse')}>
          Back to Warehouses
        </Button>
      </Card>
    );
  }

  if (!warehouse) {
    return (
      <Card title="Warehouse Not Found">
        <Alert type={ALERT_TYPES.WARNING} message="Warehouse not found" />
        <Button variant="primary" onClick={() => navigate('/warehouse')}>
          Back to Warehouses
        </Button>
      </Card>
    );
  }

  return (
    <Card title={`Warehouse: ${warehouse.warehouse_name}`}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '150px 1fr',
          gap: '10px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <strong>Warehouse ID:</strong>
          <span>{warehouse.warehouse_id}</span>

          <strong>Name:</strong>
          <span>{warehouse.warehouse_name}</span>

          <strong>Email:</strong>
          <span>{warehouse.warehouse_email || 'N/A'}</span>

          <strong>Phone:</strong>
          <span>{warehouse.warehouse_phone || 'N/A'}</span>

          <strong>Address:</strong>
          <span>{warehouse.address || 'N/A'}</span>

          <strong>Status:</strong>
          <span>
            <span style={{
              padding: '4px 8px',
              backgroundColor: warehouse.status === 'active' ? '#d4edda' : '#f8d7da',
              color: warehouse.status === 'active' ? '#155724' : '#721c24',
              borderRadius: '4px'
            }}>
              {warehouse.status || 'active'}
            </span>
          </span>

          <strong>Created:</strong>
          <span>{new Date(warehouse.created_at).toLocaleString()}</span>

          <strong>Last Updated:</strong>
          <span>{new Date(warehouse.updated_at).toLocaleString()}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <Button variant="outline" onClick={() => navigate('/warehouse')}>
          ← Back to List
        </Button>
        {isAdmin && (
          <>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/warehouse/update/${warehouse.warehouse_id}`)}
            >
              ✏️ Edit Warehouse
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default WarehouseDetails;