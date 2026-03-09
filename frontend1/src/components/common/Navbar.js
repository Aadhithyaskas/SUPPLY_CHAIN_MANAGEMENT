import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Vendors', path: '/vendors', icon: '🏢' },
    { label: 'Suppliers', path: '/suppliers', icon: '📦' },
  ];

  const adminItems = [
    { label: 'Create Warehouse', path: '/warehouse/create', icon: '🏭' },
    { label: 'Update Warehouse', path: '/warehouse/update', icon: '⚙️' },
    { label: 'Create Vendor', path: '/vendors/create', icon: '➕' },
    { label: 'Create Supplier', path: '/suppliers/create', icon: '➕' },
  ];

  return (
    <nav style={{
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h2 
            style={{ 
              cursor: 'pointer', 
              margin: 0,
              color: '#007bff',
              fontSize: '24px'
            }}
            onClick={() => navigate('/dashboard')}
          >
            WMS
          </h2>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderRadius: '4px',
                  transition: 'background-color 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}

            {isAdmin && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    background: showDropdown ? '#e7f3ff' : 'none',
                    border: 'none',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span>⚙️</span>
                  Admin
                  <span style={{ marginLeft: '5px' }}>▼</span>
                </button>

                {showDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      backgroundColor: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      borderRadius: '4px',
                      minWidth: '200px',
                      marginTop: '5px',
                      zIndex: 1000,
                    }}
                  >
                    {adminItems.map((item) => (
                      <div
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setShowDropdown(false);
                        }}
                        style={{
                          padding: '10px 15px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'background-color 0.3s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '5px 10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '20px',
          }}>
            <span style={{ fontSize: '20px' }}>👤</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {user?.employeeId}
            </span>
            <span style={{
              fontSize: '12px',
              padding: '2px 6px',
              backgroundColor: isAdmin ? '#007bff' : '#6c757d',
              color: 'white',
              borderRadius: '12px',
            }}>
              {user?.role}
            </span>
          </div>
          
          <Button 
            variant="outlineDanger" 
            size="small"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;