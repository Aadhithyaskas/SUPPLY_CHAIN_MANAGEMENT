import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminModules = [
    {
      title: 'Employee Management',
      description: 'Create, update, and delete employees',
      icon: '👥',
      path: '/admin/employees',
      color: '#007bff'
    },
    {
      title: 'Create Employee',
      description: 'Add new employees to the system',
      icon: '➕',
      path: '/admin/create-user',
      color: '#28a745'
    },
    {
      title: 'Warehouse',
      description: 'Manage warehouse settings',
      icon: '🏭',
      path: '/warehouse',
      color: '#17a2b8'
    },
    {
      title: 'Vendors',
      description: 'Manage vendors',
      icon: '🏢',
      path: '/vendors',
      color: '#ffc107'
    },
    {
      title: 'Suppliers',
      description: 'Manage suppliers',
      icon: '📦',
      path: '/suppliers',
      color: '#dc3545'
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card title="Admin Dashboard">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {adminModules.map((module, index) => (
            <div
              key={index}
              onClick={() => navigate(module.path)}
              style={{
                backgroundColor: 'white',
                border: `1px solid ${module.color}`,
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 5px 15px ${module.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                {module.icon}
              </div>
              <h3 style={{ color: module.color, marginBottom: '10px' }}>
                {module.title}
              </h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                {module.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Main Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;