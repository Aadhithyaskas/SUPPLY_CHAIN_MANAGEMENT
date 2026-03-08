import React, { useState, useEffect } from 'react';
import { deleteEmployee, listEmployees } from './api';

const DeleteEmployee = ({ onBack }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await listEmployees();
      setEmployees(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      await deleteEmployee(selectedEmployee);
      setMessage('Employee deleted successfully!');
      setSelectedEmployee('');
      setConfirmDelete(false);
      fetchEmployees(); // Refresh the list
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-employee-container">
      <h2>Delete Employee (Admin Only)</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      
      <div>
        <label>Select Employee to Delete:</label>
        <select 
          value={selectedEmployee} 
          onChange={(e) => {
            setSelectedEmployee(e.target.value);
            setConfirmDelete(false);
          }} 
          required
        >
          <option value="">Choose an employee</option>
          {employees.map(emp => (
            <option key={emp.employee_id} value={emp.employee_id}>
              {emp.employee_id} - {emp.username} ({emp.role})
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && (
        <div style={{ marginTop: '20px' }}>
          {!confirmDelete ? (
            <button onClick={handleDelete} disabled={loading}>
              Delete Employee
            </button>
          ) : (
            <div>
              <p style={{ color: 'red' }}>Are you sure? This action cannot be undone.</p>
              <button onClick={handleDelete} disabled={loading} style={{ backgroundColor: 'red' }}>
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setConfirmDelete(false)} style={{ marginLeft: '10px' }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      <button onClick={onBack} style={{ marginTop: '20px' }}>Back to Employees</button>
    </div>
  );
};

export default DeleteEmployee;