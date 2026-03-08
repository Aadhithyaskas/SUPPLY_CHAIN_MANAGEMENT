import React, { useState, useEffect } from 'react';
import { updateEmployee, listEmployees } from './api';

const UpdateEmployee = ({ onBack }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleEmployeeSelect = (e) => {
    const employeeId = e.target.value;
    setSelectedEmployee(employeeId);
    
    const employee = employees.find(emp => emp.employee_id === employeeId);
    if (employee) {
      setFormData({
        username: employee.username,
        email: employee.email,
        role: employee.role
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await updateEmployee(selectedEmployee, formData);
      setMessage('Employee updated successfully!');
      fetchEmployees(); // Refresh the list
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="update-employee-container">
      <h2>Update Employee (Admin Only)</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      
      <div>
        <label>Select Employee:</label>
        <select value={selectedEmployee} onChange={handleEmployeeSelect} required>
          <option value="">Choose an employee</option>
          {employees.map(emp => (
            <option key={emp.employee_id} value={emp.employee_id}>
              {emp.employee_id} - {emp.username} ({emp.role})
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Role:</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="">Select Role</option>
              <option value="inventory_manager">Inventory Manager</option>
              <option value="quality_assistant">Quality Assistant</option>
              <option value="manager">Manager</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Employee'}
          </button>
        </form>
      )}
      <button onClick={onBack}>Back to Employees</button>
    </div>
  );
};

export default UpdateEmployee;