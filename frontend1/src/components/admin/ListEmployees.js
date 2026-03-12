import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Table from '../common/Table';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { listEmployees, deleteEmployee } from '../../services/adminService';
import { ROLE_LABELS, ALERT_TYPES } from '../../utils/constants';
import './ListEmployees.css'; // Create this CSS file

const ListEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ show: false, employee: null });

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

  const handleUpdate = (employee) => {
    navigate(`/admin/update-employee/${employee.employee_id}`);
  };

  const handleDelete = async (employee) => {
    try {
      await deleteEmployee(employee.employee_id);
      setSuccess(`Employee ${employee.username} deleted successfully`);
      fetchEmployees(); // Refresh the list
    } catch (error) {
      setError(error.message || 'Failed to delete employee');
    } finally {
      setDeleteDialog({ show: false, employee: null });
    }
  };

  const columns = [
    { 
      header: 'Employee ID', 
      accessor: 'employee_id',
      render: (value) => <span className="employee-id-badge">{value}</span>
    },
    { 
      header: 'Username', 
      accessor: 'username',
      render: (value, row) => (
        <div className="employee-name-cell">
          <div className="employee-avatar">
            {value?.charAt(0).toUpperCase()}
          </div>
          <span>{value}</span>
        </div>
      )
    },
    { 
      header: 'Email', 
      accessor: 'email',
      render: (value) => <span className="employee-email">{value}</span>
    },
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
        
        const getRoleColor = (role) => {
          if (role === 'FOUNDER_ADMIN') return '#8b5cf6';
          if (role === 'admin') return '#3b82f6';
          if (role === 'manager') return '#10b981';
          if (role === 'supervisor') return '#f59e0b';
          if (role === 'inventory_manager') return '#ec4899';
          if (role === 'quality_assistant') return '#6366f1';
          return '#6b7280';
        };

        return (
          <span 
            className="role-badge"
            style={{ 
              backgroundColor: `${getRoleColor(value)}15`,
              color: getRoleColor(value),
              borderColor: getRoleColor(value)
            }}
          >
            {roleLabels[value] || value}
          </span>
        );
      }
    },
    { 
      header: 'Status', 
      accessor: 'is_first_login',
      render: (value) => value ? (
        <span className="status-badge warning">
          <span className="status-dot"></span>
          First Login
        </span>
      ) : (
        <span className="status-badge success">
          <span className="status-dot"></span>
          Active
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button
            className="action-btn update-btn"
            onClick={() => handleUpdate(row)}
            title="Update Employee"
          >
            <span className="btn-icon">✏️</span>
            <span className="btn-text">Update</span>
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => setDeleteDialog({ show: true, employee: row })}
            title="Delete Employee"
          >
            <span className="btn-icon">🗑️</span>
            <span className="btn-text">Delete</span>
          </button>
        </div>
      )
    }
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
      <div className="list-employees-container">
        <Card title="Employee Management">
          <Loader text="Loading employees..." />
        </Card>
      </div>
    );
  }

  const roleStats = getRoleStats();

  return (
    <div className="list-employees-container">
      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete employee{' '}
              <strong>{deleteDialog.employee?.username}</strong>?
              <br />
              <span className="dialog-warning">This action cannot be undone.</span>
            </p>
            <div className="dialog-actions">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ show: false, employee: null })}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteDialog.employee)}
              >
                Delete Employee
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card title="Employee Management">
        {error && (
          <Alert 
            type={ALERT_TYPES.ERROR} 
            message={error}
            onClose={() => setError('')}
            className="alert-message"
          />
        )}
        
        {success && (
          <Alert 
            type={ALERT_TYPES.SUCCESS} 
            message={success}
            onClose={() => setSuccess('')}
            className="alert-message"
          />
        )}

        {/* Action Buttons */}
        <div className="action-bar">
          <div className="action-buttons-group">
            <Button
              variant="primary"
              onClick={() => navigate('/admin/create-user')}
              className="create-btn"
            >
              <span className="btn-icon">➕</span>
              Create New Employee
            </Button>
            <Button
              variant="outline"
              onClick={fetchEmployees}
              className="refresh-btn"
            >
              <span className="btn-icon">↻</span>
              Refresh
            </Button>
          </div>
          
          {/* Role Distribution Summary */}
          <div className="role-stats">
            {Object.entries(roleStats).map(([role, count]) => (
              <span key={role} className="role-stat-item">
                <span className="role-stat-label">{ROLE_LABELS[role] || role}:</span>
                <span className="role-stat-count">{count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Employees Table */}
        <Table
          columns={columns}
          data={employees}
          showActions={false} // We're using custom actions in the column
          emptyMessage={
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <h3>No Employees Found</h3>
              <p>Click 'Create New Employee' to add your first employee.</p>
              <Button
                variant="primary"
                onClick={() => navigate('/admin/create-user')}
              >
                Create New Employee
              </Button>
            </div>
          }
        />

        {/* Summary Footer */}
        {employees.length > 0 && (
          <div className="summary-footer">
            <div className="summary-item">
              <span className="summary-label">Total Employees:</span>
              <span className="summary-value">{employees.length}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-dot" style={{ backgroundColor: '#8b5cf6' }}></span>
                <span>Admins: {roleStats['admin'] || 0}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-dot" style={{ backgroundColor: '#10b981' }}></span>
                <span>Managers: {roleStats['manager'] || 0}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                <span>Supervisors: {roleStats['supervisor'] || 0}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-dot" style={{ backgroundColor: '#ec4899' }}></span>
                <span>Inventory: {roleStats['inventory_manager'] || 0}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-dot" style={{ backgroundColor: '#6366f1' }}></span>
                <span>Quality: {roleStats['quality_assistant'] || 0}</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ListEmployees;