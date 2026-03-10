import React, { createContext, useState, useContext, useEffect } from "react";
import {
  login as apiLogin,
  verifyOTP,
  logout as apiLogout,
} from "../services/authService";

import {
  setUserData,
  getUserData,
  removeUserData,
} from "../utils/helpers";

import { ROLES } from "../utils/constants";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tempUserData, setTempUserData] = useState(null);

  const [loginSuccessMessage, setLoginSuccessMessage] = useState("");
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  /* -----------------------------
     Restore session on refresh
  ------------------------------*/
  useEffect(() => {

    const initializeAuth = () => {

      console.log("Auth initialization started");

      const storedUser = getUserData();

      console.log("Stored user:", storedUser);

      if (storedUser) {

        setUser(storedUser);
        setIsAuthenticated(true);

        const adminStatus =
          storedUser.role === ROLES.ADMIN ||
          storedUser.role === ROLES.FOUNDER_ADMIN;

        setIsAdmin(adminStatus);

      } else {

        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);

      }

      setLoading(false);

    };

    initializeAuth();

  }, []);

  /* -----------------------------
     LOGIN
  ------------------------------*/
  const login = async (credentials) => {

    try {

      const response = await apiLogin(
        credentials.employeeId,
        credentials.email,
        credentials.password
      );

      /* Founder Admin login */
      if (response.message === "Founder Admin login successful") {

        const userData = {
          employeeId: credentials.employeeId,
          email: credentials.email,
          role: ROLES.FOUNDER_ADMIN,
          lastLogin: new Date().toISOString(),
        };

        const storedUser = getUserData();

        if (storedUser) {

          setLoginSuccessMessage(
            `Welcome back! Your last login was on ${new Date(
              storedUser.lastLogin
            ).toLocaleString()}`
          );

          setShowLoginMessage(true);
        }

        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(true);

        setUserData(userData);

        return { success: true, isFounderAdmin: true };

      }

      /* Normal employee login → OTP required */
      setTempUserData({
        employeeId: response.employee_id,
        email: response.email,
        role: response.role,
      });

      return { success: true, requiresOTP: true };

    } catch (error) {

      return { success: false, error: error.message };

    }
  };

  /* -----------------------------
     OTP Verification
  ------------------------------*/
  const verifyOTPAndLogin = async (otp) => {

    try {

      const response = await verifyOTP(tempUserData.employeeId, otp);

      const storedUser = getUserData();

      if (storedUser) {

        setLoginSuccessMessage(
          `Welcome back! Your last login was on ${new Date(
            storedUser.lastLogin
          ).toLocaleString()}`
        );

        setShowLoginMessage(true);
      }

      const userData = {
        ...tempUserData,
        forceChangePassword: response.force_change_password,
        lastLogin: new Date().toISOString(),
      };

      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(tempUserData.role === ROLES.ADMIN);

      setUserData(userData);

      setTempUserData(null);

      return {
        success: true,
        forceChangePassword: response.force_change_password,
      };

    } catch (error) {

      return { success: false, error: error.message };

    }
  };

  /* -----------------------------
     LOGOUT
  ------------------------------*/
  const handleLogout = async () => {

    try {
      await apiLogout();
    } catch (error) {
      console.log("Logout error:", error);
    }

    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setTempUserData(null);

    removeUserData();

  };

  const dismissLoginMessage = () => {

    setShowLoginMessage(false);
    setLoginSuccessMessage("");

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
    dismissLoginMessage,

  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
