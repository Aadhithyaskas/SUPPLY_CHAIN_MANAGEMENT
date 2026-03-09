import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Alert from '../common/Alert';
import Button from '../common/Button';
import { ALERT_TYPES, ROLES } from '../../utils/constants';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loginSuccessMessage, showLoginMessage, dismissLoginMessage } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const modules = [
    {
      name: 'Warehouse',
      description: 'Manage warehouse details',
      path: '/warehouse',
      adminOnly: true,
      icon: '🏭'
    },
    {
      name: 'Vendors',
      description: 'Manage vendors',
      path: '/vendors',
      adminOnly: false,
      icon: '🏢'
    },
    {
      name: 'Suppliers',
      description: 'Manage suppliers',
      path: '/suppliers',
      adminOnly: false,
      icon: '📦'
    }
  ];

  const filteredModules = modules.filter(module => 
    !module.adminOnly || (module.adminOnly && isAdmin)
  );

  return (
    <div style={{ padding: '20px' }}>
      {showLoginMessage && loginSuccessMessage && (
        <Alert 
          type={ALERT_TYPES.SUCCESS} 
          message={loginSuccessMessage}
          onClose={dismissLoginMessage}
        />
      )}

      <Card title={`Welcome, ${user?.employeeId}!`}>
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>

        <h3 style={{ marginBottom: '15px' }}>Available Modules</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {filteredModules.map((module, index) => (
            <Card key={index} style={{ cursor: 'pointer' }} onClick={() => navigate(module.path)}>
              <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '10px' }}>
                {module.icon}
              </div>
              <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>{module.name}</h4>
              <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
                {module.description}
              </p>
              {module.adminOnly && (
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                  marginTop: '10px'
                }}>
                  Admin Only
                </span>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;