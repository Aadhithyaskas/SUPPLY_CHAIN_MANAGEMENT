import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../common/Alert';
import { ALERT_TYPES } from '../../utils/constants';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loginSuccessMessage, showLoginMessage, dismissLoginMessage } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const modules = [
    { name: 'Vendors', path: '/vendors', description: 'Manage vendor information and relationships' },
    { name: 'Suppliers', path: '/suppliers', description: 'Track and manage supplier details' },
    { name: 'Warehouse', path: '/warehouse', description: 'Warehouse inventory and operations' },
    { name: 'Employees', path: '/admin/employees', description: 'View and manage employee records' }
  ];

  const quickActions = [
    { name: 'View Vendors', path: '/vendors' },
    { name: 'View Suppliers', path: '/suppliers' },
    { name: 'Create Employee', path: '/admin/create-user' },
    { name: 'Manage Employees', path: '/admin/employees' },
    { name: 'Update Employee', path: '/admin/update-employee' },
    { name: 'Warehouse Settings', path: '/warehouse' }
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      {showLoginMessage && loginSuccessMessage && (
        <Alert
          type={ALERT_TYPES.SUCCESS}
          message={loginSuccessMessage}
          onClose={dismissLoginMessage}
          className="dashboard-alert"
        />
      )}

      <div className="dashboard-header">
        <div className="header-left">
          <div className="date-time">
            <span className="date">{formatDate(currentTime)}</span>
            <span className="time-separator">|</span>
            <span className="time">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <main className="modules-section">
          <h2 className="modules-title">Main Modules</h2>
          <div className="modules-grid">
            {modules.map((module, index) => (
              <div
                key={index}
                className="module-card"
                onClick={() => navigate(module.path)}
              >
                <h3 className="module-name">{module.name}</h3>
                <p className="module-description">{module.description}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className="dashboard-footer">
        <span>Warehouse Management System v1.0</span>
        <span>2024 WMS. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Dashboard;