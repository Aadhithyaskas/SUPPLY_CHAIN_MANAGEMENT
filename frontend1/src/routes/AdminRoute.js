import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

const AdminRoute = ({ children }) => {

  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Wait until authentication check finishes
  if (loading) {
    return <Loader fullScreen text="Checking permissions..." />;
  }

  // If user not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin allowed
  return children;
};

export default AdminRoute;
