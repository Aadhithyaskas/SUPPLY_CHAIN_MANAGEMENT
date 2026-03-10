import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Table from '../common/Table';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { listEmployees } from '../../services/adminService';
import { ROLE_LABELS, ALERT_TYPES } from '../../utils/constants';

const ListEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listEmployees();
      setEmployees(data);
    } catch (error) {
      setError(error.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const columns = [
    { 
      header: 'Employee ID', 
      accessor: 'employee_id',
      render: (value) => <strong>{value}</strong>
    },
    { header: 'Username', accessor: 'username' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'role',
      render: (value) => {
        const roleLabels = {
          'inventory_manager': '📦 Inventory Manager',
          'quality_assistant': '🔍 Quality Assistant',
          'manager': '📊 Manager',
          'supervisor': '👔 Supervisor',
          'admin': '⚙️ Admin',
          'FOUNDER_ADMIN': '👑 Founder Admin'
        };
        return (
          <span style={{
            padding: '4px 8px',
            backgroundColor: value === 'admin' || value === 'FOUNDER_ADMIN' ? '#cce5ff' : '#e2e3e5',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {roleLabels[value] || value}
          </span>
        );
      }
    },
    { 
      header: 'First Login', 
      accessor: 'is_first_login',
      render: (value) => value ? (
        <span style={{ color: '#dc3545' }}>🔴 Yes</span>
      ) : (
        <span style={{ color: '#28a745' }}>✅ No</span>
      )
    },
  ];

  const getRoleStats = () => {
    const stats = {};
    employees.forEach(emp => {
      stats[emp.role] = (stats[emp.role] || 0) + 1;
    });
    return stats;
  };

  if (loading) {
    return (
      <Card title="Employee Management">
        <Loader text="Loading employees..." />
      </Card>
    );
  }

  const roleStats = getRoleStats();

  return (
    <Card title="Employee Management">
      {error && (
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="primary"
            onClick={() => navigate('/admin/create-user')}
          >
            + Create New Employee
          </Button>
          <Button
            variant="outline"
            onClick={fetchEmployees}
          >
            ↻ Refresh
          </Button>
        </div>
        
        {/* Role Distribution Summary */}
        <div style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          fontSize: '13px'
        }}>
          {Object.entries(roleStats).map(([role, count]) => (
            <span key={role} style={{
              padding: '4px 8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '20px',
              border: '1px solid #dee2e6'
            }}>
              {ROLE_LABELS[role] || role}: <strong>{count}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Employees Table */}
      <Table
        columns={columns}
        data={employees}
        showActions={false}
        emptyMessage="No employees found. Click 'Create New Employee' to add one."
      />

      {/* Summary Footer */}
      {employees.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <strong>Total Employees:</strong> {employees.length}
          </div>
          <div>
            <strong>Inventory Managers:</strong> {roleStats['inventory_manager'] || 0} | 
            <strong> Quality Assistants:</strong> {roleStats['quality_assistant'] || 0} |
            <strong> Managers:</strong> {roleStats['manager'] || 0} |
            <strong> Supervisors:</strong> {roleStats['supervisor'] || 0} |
            <strong> Admins:</strong> {roleStats['admin'] || 0}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ListEmployees;