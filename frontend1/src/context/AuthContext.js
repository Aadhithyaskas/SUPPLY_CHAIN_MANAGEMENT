import React, { createContext, useState, useContext, useEffect } from "react";
import {
  login as apiLogin,
  verifyOTP,
  logout as apiLogout,
  refreshToken,
} from "../services/authService";

import {
  setUserData,
  getUserData,
  removeUserData,
} from "../utils/helpers";

import { ROLES, STORAGE_KEYS } from "../utils/constants";

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

  // ---------------------------
  // INITIAL SESSION RESTORE
  // ---------------------------
useEffect(() => {

  const initializeAuth = async () => {

    console.log("Auth initialization started");

    const storedUser = getUserData();

    console.log("Stored user:", storedUser);

    if (storedUser) {
      console.log("Restoring session");

      setUser(storedUser);
      setIsAuthenticated(true);
      setIsAdmin(storedUser.role === "admin");

    } else {
      console.log("No stored session");
    }

    setLoading(false);

  };

  initializeAuth();

}, []);

  // ---------------------------
  // LOGIN
  // ---------------------------

  const login = async (credentials) => {

    try {

      const response = await apiLogin(
        credentials.employeeId,
        credentials.email,
        credentials.password
      );

      // Founder admin login
      if (response.message === "Founder Admin login successful") {

        const userData = {
          employeeId: credentials.employeeId,
          email: credentials.email,
          role: ROLES.FOUNDER_ADMIN,
          lastLogin: new Date().toISOString(),
        };

        if (response.access_token) {
          localStorage.setItem(
            STORAGE_KEYS.ACCESS_TOKEN,
            response.access_token
          );
        }

        if (response.refresh_token) {
          localStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            response.refresh_token
          );
        }

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

        return {
          success: true,
          isFounderAdmin: true,
        };
      }

      // Normal employee login → OTP required
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

  // ---------------------------
  // OTP LOGIN
  // ---------------------------

  const verifyOTPAndLogin = async (otp) => {

    try {

      const response = await verifyOTP(tempUserData.employeeId, otp);

      if (response.access_token) {
        localStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          response.access_token
        );
      }

      if (response.refresh_token) {
        localStorage.setItem(
          STORAGE_KEYS.REFRESH_TOKEN,
          response.refresh_token
        );
      }

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

  // ---------------------------
  // LOGOUT
  // ---------------------------

  const handleLogout = async () => {

    try {
      await apiLogout();
    } catch (err) {
      console.log("Logout error", err);
    }

    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setTempUserData(null);

    removeUserData();

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
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
