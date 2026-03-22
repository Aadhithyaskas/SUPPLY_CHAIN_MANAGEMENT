import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  login,
  verifyOTP,
  forceChangePassword,
  logout as apiLogout,
} from "../../services/apiService";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 Restore session on refresh
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("authToken");

    if (storedUser && storedToken) {
      setUserState(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // 🔐 LOGIN (Step 1 → OTP)
  const handleLogin = async (employeeId, email, password, adminId) => {
    try {
      const response = await login(employeeId, email, password, adminId);

      sessionStorage.setItem(
        "tempLoginData",
        JSON.stringify({
          employeeId,
          email,
          adminId,
          role: response.role,
        })
      );

      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 🔑 VERIFY OTP (Step 2 → Dashboard)
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

      // ✅ Save user
      setUserState(userData);
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("authToken", "authenticated");
      sessionStorage.removeItem("tempLoginData");

      // ✅ IMPORTANT: Redirect after OTP
      if (response.force_change_password) {
        navigate("/auth/force-change-password");
      } else {
        navigate("/dashboard");
      }

      return {
        success: true,
        user: userData,
        forceChangePassword: response.force_change_password,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 🔄 Force password change
  const handleForceChangePassword = async (newPassword, confirmPassword) => {
    try {
      await forceChangePassword(newPassword, confirmPassword);

      const updatedUser = { ...user, isFirstLogin: false };
      setUserState(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      // ✅ Redirect after password change
      navigate("/dashboard");

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 🚪 Logout
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

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}