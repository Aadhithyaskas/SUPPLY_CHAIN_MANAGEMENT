import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Alert from '../common/Alert';
import Button from '../common/Button';
import { ALERT_TYPES, ROLES, ROLE_LABELS } from '../../utils/constants';
import './Dashboard.css'; // Create this CSS file

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
      color: '#4361ee',
      bgColor: '#e0e7ff'
    },
    {
      name: 'Suppliers',
      description: 'Manage suppliers and view supplier details',
      path: '/suppliers',
      icon: '📦',
      color: '#06b6d4',
      bgColor: '#cffafe'
    }
  ];

  // Admin-only modules
  const adminModules = [
    {
      name: 'Warehouse',
      description: 'Configure and manage warehouse settings',
      path: '/warehouse',
      icon: '🏭',
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    },
    {
      name: 'Employee Management',
      description: 'View all employees in the system',
      path: '/admin/employees',
      icon: '👥',
      color: '#ec4899',
      bgColor: '#fce7f3'
    },
    {
      name: 'Create Employee',
      description: 'Add new employees to the system',
      path: '/admin/create-user',
      icon: '➕',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    }
  ];

  // Get role-specific quick actions
  const getQuickActions = () => {
    const actions = [
      {
        name: 'View Vendors',
        path: '/vendors',
        icon: '🏢',
        description: 'See all vendors',
        color: '#4361ee'
      },
      {
        name: 'View Suppliers',
        path: '/suppliers',
        icon: '📦',
        description: 'See all suppliers',
        color: '#06b6d4'
      }
    ];

    if (isAdmin) {
      actions.push(
        {
          name: 'Manage Employees',
          path: '/admin/employees',
          icon: '👥',
          description: 'View and manage employees',
          color: '#ec4899'
        },
        {
          name: 'Create Employee',
          path: '/admin/create-user',
          icon: '➕',
          description: 'Add new employee',
          color: '#f59e0b'
        },
        {
          name: 'Warehouse Settings',
          path: '/warehouse',
          icon: '🏭',
          description: 'Configure warehouse',
          color: '#8b5cf6'
        }
      );
    }

    return actions;
  };

  // Get role-specific statistics
  const getStats = () => {
    const stats = [
      { label: 'Total Vendors', value: '24', icon: '🏢', color: '#4361ee', change: '+12%' },
      { label: 'Total Suppliers', value: '18', icon: '📦', color: '#06b6d4', change: '+8%' }
    ];

    if (isAdmin) {
      stats.push(
        { label: 'Total Employees', value: '12', icon: '👥', color: '#ec4899', change: '+2' },
        { label: 'Active Today', value: '8', icon: '📊', color: '#f59e0b', change: '67%' }
      );
    }

    return stats;
  };

  const quickActions = getQuickActions();
  const stats = getStats();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Message */}
      {showLoginMessage && loginSuccessMessage && (
        <Alert 
          type={ALERT_TYPES.SUCCESS} 
          message={loginSuccessMessage}
          onClose={dismissLoginMessage}
          className="dashboard-alert"
        />
      )}

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="greeting">{getGreeting()}, {user?.f_name || user?.employeeId}!</h1>
            <p className="welcome-text">Welcome back to your WMS dashboard</p>
          </div>
          <div className="header-right">
            <div className="date-badge">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-value-wrapper">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-change" style={{ color: stat.color }}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Card */}
      <Card className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.f_name?.charAt(0) || user?.employeeId?.charAt(0)}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.f_name || user?.employeeId}</h2>
            <div className="profile-badges">
              <span className="role-badge" style={{
                backgroundColor: isAdmin ? '#8b5cf6' : '#6c757d'
              }}>
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
              <span className="employee-id-badge">
                ID: {user?.employeeId}
              </span>
            </div>
            <p className="profile-email">{user?.email}</p>
          </div>
          {isAdmin && (
            <div className="admin-badge">
              <span>👑 Admin Access</span>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>Frequently used operations</p>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={() => navigate(action.path)}
              style={{ '--action-color': action.color }}
            >
              <span className="action-icon">{action.icon}</span>
              <div className="action-info">
                <span className="action-name">{action.name}</span>
                <span className="action-desc">{action.description}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Main Modules */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Main Modules</h2>
          <p>Access your core features</p>
        </div>
        <div className="modules-grid">
          {/* Regular modules for all users */}
          {mainModules.map((module, index) => (
            <div
              key={index}
              className="module-card"
              onClick={() => navigate(module.path)}
              style={{ 
                '--module-color': module.color,
                '--module-bg': module.bgColor 
              }}
            >
              <div className="module-icon-wrapper" style={{ backgroundColor: module.bgColor }}>
                <span className="module-icon">{module.icon}</span>
              </div>
              <div className="module-content">
                <h3 className="module-title" style={{ color: module.color }}>{module.name}</h3>
                <p className="module-description">{module.description}</p>
                <button className="module-action" style={{ color: module.color }}>
                  Access Module →
                </button>
              </div>
            </div>
          ))}

          {/* Admin modules */}
          {isAdmin && adminModules.map((module, index) => (
            <div
              key={index}
              className="module-card admin-module"
              onClick={() => navigate(module.path)}
              style={{ 
                '--module-color': module.color,
                '--module-bg': module.bgColor 
              }}
            >
              <div className="module-badge">Admin</div>
              <div className="module-icon-wrapper" style={{ backgroundColor: module.bgColor }}>
                <span className="module-icon">{module.icon}</span>
              </div>
              <div className="module-content">
                <h3 className="module-title" style={{ color: module.color }}>{module.name}</h3>
                <p className="module-description">{module.description}</p>
                <button className="module-action" style={{ color: module.color }}>
                  Access Module →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Employee Management Section (Admin Only) */}
      {isAdmin && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Employee Management</h2>
            <p>Manage your workforce</p>
          </div>
          
          <Card className="employee-management-card">
            <div className="employee-stats">
              <div className="employee-stat-item">
                <span className="stat-number">12</span>
                <span className="stat-label">Total Employees</span>
              </div>
              <div className="employee-stat-item">
                <span className="stat-number">3</span>
                <span className="stat-label">New This Week</span>
              </div>
              <div className="employee-stat-item">
                <span className="stat-number">5</span>
                <span className="stat-label">Departments</span>
              </div>
              <div className="employee-stat-item">
                <span className="stat-number">8</span>
                <span className="stat-label">Active Today</span>
              </div>
            </div>

            <div className="employee-actions">
              <button
                className="employee-action-btn primary"
                onClick={() => navigate('/admin/create-user')}
              >
                <span className="btn-icon">➕</span>
                <div className="btn-content">
                  <span className="btn-title">Create New Employee</span>
                  <span className="btn-desc">Add a new team member</span>
                </div>
              </button>
              
              <button
                className="employee-action-btn"
                onClick={() => navigate('/admin/employees')}
              >
                <span className="btn-icon">👥</span>
                <div className="btn-content">
                  <span className="btn-title">View All Employees</span>
                  <span className="btn-desc">Manage your team</span>
                </div>
              </button>
              
              <button
                className="employee-action-btn"
                onClick={() => navigate('/admin/update-employee')}
              >
                <span className="btn-icon">✏️</span>
                <div className="btn-content">
                  <span className="btn-title">Update Employee</span>
                  <span className="btn-desc">Edit employee details</span>
                </div>
              </button>
            </div>
          </Card>
        </section>
      )}

      {/* Permissions Section */}
      <section className="dashboard-section">
        <Card className="permissions-card">
          <div className="permissions-header">
            <h3>📋 Your Permissions</h3>
            <p>Based on your role: <strong>{ROLE_LABELS[user?.role] || user?.role}</strong></p>
          </div>
          <div className="permissions-grid">
            <div className="permission-item">
              <span className="permission-check">✓</span>
              <span>View vendors and suppliers</span>
            </div>
            {user?.role === ROLES.INVENTORY_MANAGER && (
              <>
                <div className="permission-item">
                  <span className="permission-check">✓</span>
                  <span>Manage inventory</span>
                </div>
                <div className="permission-item">
                  <span className="permission-check">✓</span>
                  <span>View reports</span>
                </div>
              </>
            )}
            {user?.role === ROLES.MANAGER && (
              <>
                <div className="permission-item">
                  <span className="permission-check">✓</span>
                  <span>Manage vendors and suppliers</span>
                </div>
                <div className="permission-item">
                  <span className="permission-check">✓</span>
                  <span>View all reports</span>
                </div>
                <div className="permission-item">
                  <span className="permission-check">✓</span>
                  <span>Approve requests</span>
                </div>
              </>
            )}
            {isAdmin && (
              <>
                <div className="permission-item">
                  <span className="permission-check">✓</span>
                  <span>Full system access</span>
                </div>
                <div className="permission-item">
                  <span className="permission-check">✓</span>
                  <span>Create and manage employees</span>
                </div>
                <div className="permission-item">
                  <span className="permission-check">✓</span>
                  <span>Configure warehouse settings</span>
                </div>
                <div className="permission-item">
                  <span className="permission-check">✓</span>
                  <span>Manage all vendors and suppliers</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;