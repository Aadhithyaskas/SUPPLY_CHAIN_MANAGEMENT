import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Alert from '../common/Alert';
import Button from '../common/Button';
import { ALERT_TYPES, ROLES, ROLE_LABELS } from '../../utils/constants';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loginSuccessMessage, showLoginMessage, dismissLoginMessage } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Main modules for all users
  const mainModules = [
    {
      name: 'Vendors',
      description: 'Manage vendors and view vendor details',
      path: '/vendors',
      icon: '🏢',
      color: '#28a745'
    },
    {
      name: 'Suppliers',
      description: 'Manage suppliers and view supplier details',
      path: '/suppliers',
      icon: '📦',
      color: '#17a2b8'
    }
  ];

  // Admin-only modules
  const adminModules = [
    {
      name: 'Warehouse',
      description: 'Configure and manage warehouse settings',
      path: '/warehouse',
      icon: '🏭',
      color: '#007bff'
    },
    {
      name: 'Employee Management',
      description: 'View all employees in the system',
      path: '/admin/employees',
      icon: '👥',
      color: '#6f42c1'
    },
    {
      name: 'Create Employee',
      description: 'Add new employees to the system',
      path: '/admin/create-user',
      icon: '➕',
      color: '#fd7e14'
    }
  ];

  // Get role-specific quick actions
  const getQuickActions = () => {
    const actions = [
      {
        name: 'View Vendors',
        path: '/vendors',
        icon: '🏢',
        description: 'See all vendors'
      },
      {
        name: 'View Suppliers',
        path: '/suppliers',
        icon: '📦',
        description: 'See all suppliers'
      }
    ];

    if (isAdmin) {
      actions.push(
        {
          name: 'Manage Employees',
          path: '/admin/employees',
          icon: '👥',
          description: 'View and manage employees'
        },
        {
          name: 'Create Employee',
          path: '/admin/create-user',
          icon: '➕',
          description: 'Add new employee'
        },
        {
          name: 'Warehouse Settings',
          path: '/warehouse',
          icon: '🏭',
          description: 'Configure warehouse'
        }
      );
    }

    return actions;
  };

  // Get role-specific statistics (mock data - replace with actual API calls)
  const getStats = () => {
    const stats = [
      { label: 'Total Vendors', value: '24', icon: '🏢', color: '#28a745' },
      { label: 'Total Suppliers', value: '18', icon: '📦', color: '#17a2b8' }
    ];

    if (isAdmin) {
      stats.push(
        { label: 'Total Employees', value: '12', icon: '👥', color: '#6f42c1' },
        { label: 'Active Today', value: '8', icon: '📊', color: '#fd7e14' }
      );
    }

    return stats;
  };

  const quickActions = getQuickActions();
  const stats = getStats();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Message */}
      {showLoginMessage && loginSuccessMessage && (
        <Alert 
          type={ALERT_TYPES.SUCCESS} 
          message={loginSuccessMessage}
          onClose={dismissLoginMessage}
        />
      )}

      {/* User Info Card */}
      <Card title={`Welcome Back, ${user?.f_name || user?.employeeId}!`}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div>
            <p style={{ margin: '5px 0' }}>
              <strong>Employee ID:</strong> {user?.employeeId}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Role:</strong>{' '}
              <span style={{
                padding: '4px 8px',
                backgroundColor: user?.role === ROLES.ADMIN || user?.role === ROLES.FOUNDER_ADMIN ? '#cce5ff' : '#e2e3e5',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Email:</strong> {user?.email}
            </p>
          </div>
          
          {isAdmin && (
            <div style={{
              backgroundColor: '#e7f3ff',
              padding: '10px 15px',
              borderRadius: '4px',
              border: '1px solid #b8daff'
            }}>
              <span style={{ color: '#004085', fontWeight: '500' }}>
                👑 Admin Access Granted
              </span>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center',
                border: `1px solid ${stat.color}20`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '5px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Quick Actions</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px'
          }}>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px'
                }}
              >
                <span style={{ fontSize: '20px' }}>{action.icon}</span>
                {action.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Modules */}
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Main Modules</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Regular modules for all users */}
          {mainModules.map((module, index) => (
            <Card 
              key={index} 
              style={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: `1px solid ${module.color}30`
              }} 
              onClick={() => navigate(module.path)}
            >
              <div style={{ 
                fontSize: '48px', 
                textAlign: 'center', 
                marginBottom: '10px',
                color: module.color
              }}>
                {module.icon}
              </div>
              <h4 style={{ 
                textAlign: 'center', 
                marginBottom: '10px',
                color: module.color
              }}>
                {module.name}
              </h4>
              <p style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontSize: '14px',
                marginBottom: '10px'
              }}>
                {module.description}
              </p>
            </Card>
          ))}

          {/* Admin modules */}
          {isAdmin && adminModules.map((module, index) => (
            <Card 
              key={index} 
              style={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: `1px solid ${module.color}30`,
                backgroundColor: '#fff9f0'
              }} 
              onClick={() => navigate(module.path)}
            >
              <div style={{ 
                fontSize: '48px', 
                textAlign: 'center', 
                marginBottom: '10px',
                color: module.color
              }}>
                {module.icon}
              </div>
              <h4 style={{ 
                textAlign: 'center', 
                marginBottom: '10px',
                color: module.color
              }}>
                {module.name}
              </h4>
              <p style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontSize: '14px',
                marginBottom: '10px'
              }}>
                {module.description}
              </p>
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  backgroundColor: module.color,
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '11px'
                }}>
                  Admin Only
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Employee Management Section (Admin Only) */}
        {isAdmin && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#495057' }}>
              👥 Employee Management
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <Button
                variant="primary"
                onClick={() => navigate('/admin/create-user')}
                style={{ padding: '15px' }}
              >
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>➕</div>
                <div>Create New Employee</div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/admin/employees')}
                style={{ padding: '15px' }}
              >
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>👥</div>
                <div>View All Employees</div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/admin/update-employee')}
                style={{ padding: '15px' }}
              >
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>✏️</div>
                <div>Update Employee</div>
              </Button>
            </div>

            {/* Quick Employee Stats */}
            <div style={{
              marginTop: '20px',
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>12</div>
                <div style={{ fontSize: '13px', color: '#666' }}>Total Employees</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffc107' }}>3</div>
                <div style={{ fontSize: '13px', color: '#666' }}>New This Week</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#17a2b8' }}>5</div>
                <div style={{ fontSize: '13px', color: '#666' }}>Roles</div>
              </div>
            </div>
          </div>
        )}

        {/* Role-Based Information */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e7f3ff',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>📋 Your Permissions:</strong>
          <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
            <li>✓ View vendors and suppliers</li>
            {user?.role === ROLES.INVENTORY_MANAGER && (
              <>
                <li>✓ Manage inventory</li>
                <li>✓ View reports</li>
              </>
            )}
            {user?.role === ROLES.MANAGER && (
              <>
                <li>✓ Manage vendors and suppliers</li>
                <li>✓ View all reports</li>
                <li>✓ Approve requests</li>
              </>
            )}
            {isAdmin && (
              <>
                <li>✓ Full system access</li>
                <li>✓ Create and manage employees</li>
                <li>✓ Configure warehouse settings</li>
                <li>✓ Manage all vendors and suppliers</li>
              </>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;