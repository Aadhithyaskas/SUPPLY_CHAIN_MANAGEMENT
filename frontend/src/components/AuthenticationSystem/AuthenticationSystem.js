import React, { useState, useEffect } from 'react';
import Login from './Login';
import OTPVerification from './OTPVerification';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import ForceChangePassword from './ForceChangePassword';
import AdminCreateUser from './AdminCreateUser';
import ListEmployees from './ListEmployees';
import UpdateEmployee from './UpdateEmployee';
import DeleteEmployee from './DeleteEmployee';
import Logout from './Logout';
import { logout } from './api';

// IMPLEMENTED UI COMPONENTS:
// ✓ Login - Employee login with employee_id/password
// ✓ OTP Verification - Verify 2FA OTP after login
// ✓ Forgot Password - Request password reset OTP
// ✓ Reset Password - Reset password with OTP
// ✓ Force Change Password - First login password change
// ✓ Admin Create User - Admin creates new employees
// ✓ List Employees - View all employees (Admin)
// ✓ Update Employee - Edit employee details (Admin)
// ✓ Delete Employee - Remove employee (Admin)
// ✓ Logout - User logout

const AuthenticationSystem = () => {
  const [currentView, setCurrentView] = useState('login');
  const [userData, setUserData] = useState({
    employeeId: '',
    email: '',
    role: '',
    forceChangePassword: false
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is already logged in (from session)
  useEffect(() => {
    const checkAuth = async () => {
      // You might want to add a session check endpoint
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserData(parsed);
        setIsAuthenticated(true);
        setIsAdmin(parsed.role === 'admin' || parsed.role === 'FOUNDER_ADMIN');
        setCurrentView('employees');
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (data) => {
    const newUserData = {
      employeeId: data.employee_id,
      email: data.email,
      role: data.role
    };
    setUserData(newUserData);
    
    if (data.message === 'Founder Admin login successful') {
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem('userData', JSON.stringify({ ...newUserData, role: 'FOUNDER_ADMIN' }));
      setCurrentView('employees');
    } else {
      // Show OTP verification
      setCurrentView('otp-verification');
    }
  };

  const handleOTPSuccess = (data) => {
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin' || userData.role === 'FOUNDER_ADMIN');
    localStorage.setItem('userData', JSON.stringify({ ...userData, forceChangePassword: data.force_change_password }));
    
    if (data.force_change_password) {
      setCurrentView('force-change-password');
    } else {
      setCurrentView('employees');
    }
  };

  const handleForcePasswordChange = () => {
    const updatedUser = { ...userData, forceChangePassword: false };
    setUserData(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    setCurrentView('employees');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('userData');
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUserData({ employeeId: '', email: '', role: '', forceChangePassword: false });
      setCurrentView('login');
    }
  };

  const renderView = () => {
    if (!isAuthenticated) {
      switch (currentView) {
        case 'forgot-password':
          return <ForgotPassword onBack={() => setCurrentView('login')} />;
        case 'reset-password':
          return <ResetPassword onSuccess={() => setCurrentView('login')} />;
        case 'otp-verification':
          return (
            <OTPVerification 
              employeeId={userData.employeeId}
              onSuccess={handleOTPSuccess}
              onBack={() => setCurrentView('login')}
            />
          );
        default:
          return (
            <Login 
              onLoginSuccess={handleLoginSuccess}
              onForgotPassword={() => setCurrentView('forgot-password')}
            />
          );
      }
    }

    // Authenticated views
    switch (currentView) {
      case 'force-change-password':
        return <ForceChangePassword onSuccess={handleForcePasswordChange} />;
      case 'create-user':
        return isAdmin ? <AdminCreateUser onBack={() => setCurrentView('employees')} /> : null;
      case 'update-user':
        return isAdmin ? <UpdateEmployee onBack={() => setCurrentView('employees')} /> : null;
      case 'delete-user':
        return isAdmin ? <DeleteEmployee onBack={() => setCurrentView('employees')} /> : null;
      case 'employees':
      default:
        return (
          <div>
            {isAdmin && (
              <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setCurrentView('create-user')}>Create User</button>
                <button onClick={() => setCurrentView('update-user')}>Update User</button>
                <button onClick={() => setCurrentView('delete-user')}>Delete User</button>
              </div>
            )}
            <ListEmployees isAdmin={isAdmin} />
            <Logout onLogout={handleLogout} />
          </div>
        );
    }
  };

  return (
    <div className="authentication-system">
      <h1>Authentication System</h1>
      {renderView()}
    </div>
  );
};

export default AuthenticationSystem;