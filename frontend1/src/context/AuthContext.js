import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, verifyOTP, logout as apiLogout, refreshToken } from '../services/authService';
import { setUserData, getUserData, removeUserData, setLoginMessageShown, getLoginMessageShown } from '../utils/helpers';
import { ROLES, STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tempUserData, setTempUserData] = useState(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = getUserData();
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        
        if (storedUser && accessToken) {
          // Verify token validity
          try {
            // You might want to add a token verification endpoint
            setUser(storedUser);
            setIsAuthenticated(true);
            setIsAdmin(storedUser.role === ROLES.ADMIN || storedUser.role === ROLES.FOUNDER_ADMIN);
            
            // Check if login message should be shown (for second+ logins)
            const messageShown = getLoginMessageShown();
            if (!messageShown && storedUser.lastLogin) {
              setLoginSuccessMessage(`Welcome back! Your last login was on ${new Date(storedUser.lastLogin).toLocaleString()}`);
              setShowLoginMessage(true);
              setLoginMessageShown(true);
            }
          } catch (error) {
            // Token invalid, try refresh
            try {
              const newToken = await refreshToken();
              if (newToken) {
                setUser(storedUser);
                setIsAuthenticated(true);
                setIsAdmin(storedUser.role === ROLES.ADMIN || storedUser.role === ROLES.FOUNDER_ADMIN);
              } else {
                // Refresh failed, logout
                handleLogout();
              }
            } catch (refreshError) {
              handleLogout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiLogin(
        credentials.employeeId,
        credentials.email,
        credentials.password
      );

      if (response.message === 'Founder Admin login successful') {
        const userData = {
          employeeId: credentials.employeeId,
          email: credentials.email,
          role: ROLES.FOUNDER_ADMIN,
          lastLogin: new Date().toISOString()
        };
        
        // Check if this is not first login
        const storedUser = getUserData();
        if (storedUser) {
          setLoginSuccessMessage(`Welcome back! Your last login was on ${new Date(storedUser.lastLogin).toLocaleString()}`);
          setShowLoginMessage(true);
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(true);
        setUserData(userData);
        
        return { 
          success: true, 
          isFounderAdmin: true,
          message: response.message,
          showWelcomeBack: !!storedUser
        };
      }

      setTempUserData({
        employeeId: response.employee_id,
        email: response.email,
        role: response.role
      });

      return { success: true, requiresOTP: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyOTPAndLogin = async (otp) => {
    try {
      const response = await verifyOTP(tempUserData.employeeId, otp);
      
      // Check if this is not first login
      const storedUser = getUserData();
      let welcomeBackMessage = '';
      
      if (storedUser) {
        welcomeBackMessage = `Welcome back! Your last login was on ${new Date(storedUser.lastLogin).toLocaleString()}`;
        setLoginSuccessMessage(welcomeBackMessage);
        setShowLoginMessage(true);
      }
      
      const userData = {
        ...tempUserData,
        forceChangePassword: response.force_change_password,
        lastLogin: new Date().toISOString()
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(tempUserData.role === ROLES.ADMIN);
      setUserData(userData);
      setTempUserData(null);
      
      return { 
        success: true, 
        forceChangePassword: response.force_change_password,
        welcomeBackMessage: welcomeBackMessage,
        showWelcomeBack: !!storedUser
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setTempUserData(null);
      setLoginSuccessMessage('');
      setShowLoginMessage(false);
      removeUserData();
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.LOGIN_MESSAGE_SHOWN);
    }
  };

  const dismissLoginMessage = () => {
    setShowLoginMessage(false);
    setLoginSuccessMessage('');
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    tempUserData,
    loginSuccessMessage,
    showLoginMessage,
    login,
    verifyOTPAndLogin,
    logout: handleLogout,
    setUser,
    dismissLoginMessage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};