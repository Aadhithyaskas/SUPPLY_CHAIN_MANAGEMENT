import React, { useState } from 'react';
import { adminCreateUser } from './api';

const AdminCreateUser = ({ onBack }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    f_name: '',
    l_name: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await adminCreateUser(formData);
      setMessage(`User created successfully! Employee ID: ${data.employee_id}`);
      // Reset form
      setFormData({
        username: '',
        email: '',
        role: '',
        f_name: '',
        l_name: ''
      });
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
    <div className="admin-create-user-container">
      <h2>Create New User (Admin Only)</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
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
          <label>First Name:</label>
          <input
            type="text"
            name="f_name"
            value={formData.f_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="l_name"
            value={formData.l_name}
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
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
      <button onClick={onBack}>Back to Employees</button>
    </div>
  );
};

export default AdminCreateUser;