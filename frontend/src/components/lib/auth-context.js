import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, verifyOTP, forceChangePassword, logout as apiLogout } from "../../services/apiService";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check session storage for existing user
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("authToken");
    
    if (storedUser && storedToken) {
      setUserState(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (employeeId, email, password, adminId) => {
    try {
      const response = await login(employeeId, email, password, adminId);
      
      // Store temporary login data for OTP step
      sessionStorage.setItem("tempLoginData", JSON.stringify({
        employeeId,
        email,
        adminId,
        role: response.role,
      }));
      
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      const response = await verifyOTP(otp);
      
      const userData = {
        id: response.employee_id || response.admin_id,
        name: response.employee_id ? "Employee" : "Admin",
        email: response.email,
        role: response.role,
        isFirstLogin: response.force_change_password || false,
      };
      
      setUserState(userData);
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("authToken", "authenticated");
      sessionStorage.removeItem("tempLoginData");
      
      return { success: true, user: userData, forceChangePassword: response.force_change_password };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleForceChangePassword = async (newPassword, confirmPassword) => {
    try {
      await forceChangePassword(newPassword, confirmPassword);
      
      // Update user to mark first login complete
      const updatedUser = { ...user, isFirstLogin: false };
      setUserState(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setUserState(null);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("tempLoginData");
      navigate("/auth/login");
    }
  };

  const setUser = (userData) => {
    setUserState(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login: handleLogin,
        verifyOTP: handleVerifyOTP,
        forceChangePassword: handleForceChangePassword,
        logout: handleLogout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}