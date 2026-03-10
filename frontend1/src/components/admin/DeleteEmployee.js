import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import { getEmployee, deleteEmployee } from '../../services/adminService';
import { ALERT_TYPES, ROLE_LABELS } from '../../utils/constants';

const DeleteEmployee = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [confirmStep, setConfirmStep] = useState(1); // 1: initial, 2: final confirmation

  // Fetch employee details
  const fetchEmployee = useCallback(async () => {
    try {
      const data = await getEmployee(employeeId);
      setEmployee(data);
    } catch (error) {
      setError(error.message || 'Employee not found');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const handleDelete = async () => {
    if (confirmStep === 1) {
      setConfirmStep(2);
      return;
    }

    if (confirmText !== employee?.username) {
      setError('Please type the username correctly to confirm deletion');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await deleteEmployee(employeeId);
      setSuccess('Employee deleted successfully!');
      
      setTimeout(() => {
        navigate('/admin/employees');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to delete employee');
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (confirmStep === 2) {
      setConfirmStep(1);
      setConfirmText('');
    } else {
      navigate('/admin/employees');
    }
  };

  if (loading) {
    return (
      <Card title="Delete Employee">
        <Loader text="Loading employee details..." />
      </Card>
    );
  }

  if (!employee) {
    return (
      <Card title="Delete Employee">
        <Alert type={ALERT_TYPES.ERROR} message="Employee not found" />
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button variant="primary" onClick={() => navigate('/admin/employees')}>
            Back to Employees
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`Delete Employee: ${employeeId}`}>
      {/* Success Message */}
      {success && (
        <Alert 
          type={ALERT_TYPES.SUCCESS} 
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {/* Error Message */}
      {error && !success && (
        <Alert 
          type={ALERT_TYPES.ERROR} 
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Warning Banner */}
      <div style={{
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#721c24', marginBottom: '10px', fontSize: '20px' }}>
          ⚠️ DANGER ZONE
        </h3>
        <p style={{ color: '#721c24', fontSize: '16px' }}>
          This action is permanent and cannot be undone.
        </p>
      </div>

      {/* Employee Details Card */}
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h4 style={{ marginBottom: '15px', color: '#495057' }}>
          Employee Details
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '150px 1fr',
          gap: '10px',
          fontSize: '15px'
        }}>
          <strong>Employee ID:</strong>
          <span>{employee.employee_id}</span>

          <strong>Username:</strong>
          <span>{employee.username}</span>

          <strong>Name:</strong>
          <span>{employee.first_name} {employee.last_name}</span>

          <strong>Email:</strong>
          <span>{employee.email}</span>

          <strong>Role:</strong>
          <span>
            <span style={{
              padding: '4px 8px',
              backgroundColor: employee.role === 'admin' ? '#cce5ff' : '#e2e3e5',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {ROLE_LABELS[employee.role] || employee.role}
            </span>
          </span>

          <strong>First Login:</strong>
          <span>{employee.is_first_login ? '🔴 Yes' : '✅ No'}</span>
        </div>
      </div>

      {/* Confirmation Steps */}
      {confirmStep === 1 ? (
        // Step 1: Initial Warning
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#856404', marginBottom: '15px' }}>
            ⚠️ First Confirmation Required
          </h4>
          
          <p style={{ marginBottom: '15px' }}>
            You are about to delete this employee. This will:
          </p>
          
          <ul style={{ 
            marginBottom: '20px',
            paddingLeft: '20px',
            color: '#856404'
          }}>
            <li>Permanently remove all employee data</li>
            <li>Remove all associated permissions</li>
            <li>Delete login credentials</li>
            <li>This action CANNOT be undone</li>
          </ul>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              I Understand, Continue to Delete
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        // Step 2: Final Confirmation with Text Input
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#721c24', marginBottom: '15px' }}>
            ⚠️ Final Confirmation
          </h4>
          
          <p style={{ marginBottom: '15px', color: '#721c24' }}>
            This is your last chance. Type the username <strong>"{employee.username}"</strong> to confirm permanent deletion:
          </p>
          
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Type "${employee.username}" to confirm`}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '16px',
              marginBottom: '15px'
            }}
          />
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting || confirmText !== employee.username}
              loading={deleting}
            >
              {deleting ? 'Deleting...' : 'Permanently Delete Employee'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={deleting}
            >
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ 
        marginTop: '20px', 
        display: 'flex', 
        gap: '10px',
        justifyContent: 'center' 
      }}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/admin/employees')}
        >
          ← Back to Employees
        </Button>
      </div>
    </Card>
  );
};

export default DeleteEmployee;