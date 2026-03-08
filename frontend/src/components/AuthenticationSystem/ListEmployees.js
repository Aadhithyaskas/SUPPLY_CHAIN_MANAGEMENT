import React, { useState, useEffect } from 'react';
import { listEmployees } from './api';

const ListEmployees = ({ isAdmin }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await listEmployees();
      setEmployees(data);
      setError('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading employees...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="list-employees-container">
      <h2>Employees List</h2>
      {employees.length === 0 ? (
        <p>No employees found</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>First Login</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.employee_id}</td>
                <td>{emp.username}</td>
                <td>{emp.email}</td>
                <td>{emp.role}</td>
                <td>{emp.is_first_login ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListEmployees;