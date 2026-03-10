import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

const PrivateRoute = ({ children }) => {

  const { isAuthenticated, loading } = useAuth();

  // Wait until auth check finishes
  if (loading) {
    return <Loader fullScreen text="Checking authentication..." />;
  }

  // If not authenticated → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
