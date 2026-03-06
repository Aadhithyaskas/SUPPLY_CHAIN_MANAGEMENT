import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AuthenticationSystem.css";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  withCredentials: true
});

function AuthenticationSystem() {
  // Page state
  const [page, setPage] = useState("founder");
  
  // Form states
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [employees, setEmployees] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [showResend, setShowResend] = useState(false);

  // OTP Timer
  useEffect(() => {
    let timer;
    if (page === "otp" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setShowResend(true);
    }
    return () => clearInterval(timer);
  }, [page, timeLeft]);

  // Clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  /* ---------------- ADMIN LOGIN ---------------- */
  const founderLogin = async () => {
    if (!adminId || !adminPassword) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await API.post("api/auth/founder-login/", {
        admin_id: adminId,
        password: adminPassword
      });
      setSuccess("Login successful!");
      setPage("admin");
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GET EMPLOYEES ---------------- */
  const fetchEmployees = async () => {
    try {
      const res = await API.get("api/auth/list-employees/");
      setEmployees(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch employees");
    }
  };

  /* ---------------- ADD EMPLOYEE ---------------- */
  const addEmployee = async () => {
    if (!username || !email || !role) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await API.post("api/auth/admin-create-user/", {
        username,
        email,
        role
      });
      setSuccess("Employee created successfully!");
      setUsername("");
      setEmail("");
      setRole("");
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE EMPLOYEE ---------------- */
  const deleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await API.delete(`api/delete-user/${id}/`);
      setSuccess("Employee deleted successfully!");
      fetchEmployees();
    } catch (err) {
      setError("Failed to delete employee");
    }
  };

  /* ---------------- EMPLOYEE LOGIN ---------------- */
  const employeeLogin = async () => {
    if (!employeeId || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await API.post("api/login/", {
        user_id: employeeId,
        password: password,
        email: email
      });

      if (res.data.force_change_password) {
        setPage("force");
      } else {
        setPage("otp");
        setTimeLeft(60);
        setShowResend(false);
      }
      setSuccess("OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await API.post("api/verify-login-otp/", {
        user_id: employeeId,
        otp: otp
      });
      setSuccess("Login successful!");
      setPage("employee");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FORCE PASSWORD CHANGE ---------------- */
  const changePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await API.post("api/force-change-password/", {
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setSuccess("Password changed successfully! Please login again.");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPage("employeeLogin"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RESEND OTP ---------------- */
  const resendOTP = async () => {
    setLoading(true);
    try {
      await API.post("api/login/", {
        user_id: employeeId,
        password: password,
        email: email
      });
      setTimeLeft(60);
      setShowResend(false);
      setSuccess("OTP resent successfully!");
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    try {
      await API.post("api/logout/");
    } catch (err) {
      console.log(err);
    } finally {
      setPage("founder");
      setAdminId("");
      setAdminPassword("");
      setEmployeeId("");
      setEmail("");
      setPassword("");
      setOtp("");
    }
  };

  /* ---------------- UTILITIES ---------------- */
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getRoleBadgeClass = (role) => {
    const roles = {
      admin: "role-badge admin",
      manager: "role-badge manager",
      supervisor: "role-badge supervisor",
      inventory_manager: "role-badge inventory",
      quality_assistant: "role-badge quality"
    };
    return roles[role] || "role-badge";
  };

  /* ---------------- FOUNDER LOGIN PAGE ---------------- */
  if (page === "founder") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Founder Admin Login</h2>
            <p>Access the admin dashboard</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label>Admin ID</label>
            <input
              type="text"
              placeholder="Enter admin ID"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            className="btn-primary" 
            onClick={founderLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="auth-footer">
            <button 
              className="btn-link" 
              onClick={() => setPage("employeeLogin")}
            >
              Employee Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- ADMIN DASHBOARD ---------------- */
  if (page === "admin") {
    return (
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <div className="nav-brand">
            <h2>Admin Dashboard</h2>
          </div>
          <div className="nav-actions">
            <button className="btn-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </nav>

        <div className="dashboard-content">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Add Employee Section */}
          <div className="card">
            <div className="card-header">
              <h3>Add New Employee</h3>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="inventory_manager">Inventory Manager</option>
                    <option value="quality_assistant">Quality Assistant</option>
                  </select>
                </div>
              </div>

              <button 
                className="btn-primary" 
                onClick={addEmployee}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Employee"}
              </button>
            </div>
          </div>

          {/* Employee List Section */}
          <div className="card">
            <div className="card-header">
              <h3>Employee List</h3>
            </div>
            <div className="card-body">
              {employees.length === 0 ? (
                <p className="no-data">No employees found</p>
              ) : (
                <div className="table-responsive">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td>
                            <span className="employee-id">{emp.employee_id}</span>
                          </td>
                          <td>{emp.username}</td>
                          <td>{emp.email}</td>
                          <td>
                            <span className={getRoleBadgeClass(emp.role)}>
                              {emp.role?.replace("_", " ")}
                            </span>
                          </td>
                          <td>
                            {emp.is_first_login ? (
                              <span className="status-badge warning">First Login</span>
                            ) : (
                              <span className="status-badge success">Active</span>
                            )}
                          </td>
                          <td>
                            <button 
                              className="btn-delete"
                              onClick={() => deleteEmployee(emp.employee_id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- EMPLOYEE LOGIN ---------------- */
  if (page === "employeeLogin") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Employee Login</h2>
            <p>Enter your credentials</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              placeholder="Enter employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            className="btn-primary" 
            onClick={employeeLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="auth-footer">
            <button 
              className="btn-link" 
              onClick={() => setPage("founder")}
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- OTP PAGE ---------------- */
  if (page === "otp") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit code sent to your email</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label>OTP Code</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              className="otp-input"
            />
          </div>

          <button 
            className="btn-primary" 
            onClick={verifyOTP}
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="otp-footer">
            {showResend ? (
              <button 
                className="btn-link" 
                onClick={resendOTP}
                disabled={loading}
              >
                Resend OTP
              </button>
            ) : (
              <p className="timer-text">Resend OTP in {timeLeft}s</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- FORCE PASSWORD ---------------- */
  if (page === "force") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Change Password</h2>
            <p>This is your first login. Please set a new password.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="password-requirements">
            <p>Password must:</p>
            <ul>
              <li>Be at least 8 characters long</li>
              <li>Be at least 8 characters long</li>
              <li>Contain letters and numbers</li>
            </ul>
          </div>

          <button 
            className="btn-primary" 
            onClick={changePassword}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- EMPLOYEE DASHBOARD ---------------- */
  if (page === "employee") {
    return (
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <div className="nav-brand">
            <h2>Employee Dashboard</h2>
          </div>
          <div className="nav-actions">
            <button className="btn-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </nav>

        <div className="dashboard-content">
          {success && <div className="alert alert-success">{success}</div>}
          
          <div className="welcome-card">
            <h1>Welcome, {email}!</h1>
            <p>You have successfully logged in to your account.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default AuthenticationSystem;