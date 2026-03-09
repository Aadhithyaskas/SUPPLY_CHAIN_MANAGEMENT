import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import Layout from '../components/Layout';

// Auth Components
import Login from '../components/auth/Login';
import OTPVerification from '../components/auth/OTPVerification';
import ForgotPassword from '../components/auth/ForgotPassword';
import ResetPassword from '../components/auth/ResetPassword';
import ForceChangePassword from '../components/auth/ForceChangePassword';

// Dashboard
import Dashboard from '../components/dashboard/Dashboard';

// Warehouse Components
import CreateWarehouse from '../components/warehouse/CreateWarehouse';
import UpdateWarehouse from '../components/warehouse/UpdateWarehouse';

// Vendor Components
import CreateVendor from '../components/vendor/CreateVendor';
import ListVendors from '../components/vendor/ListVendors';
import VendorDetails from '../components/vendor/VendorDetails';
import UpdateVendor from '../components/vendor/UpdateVendor';

// Supplier Components
import CreateSupplier from '../components/supplier/CreateSupplier';
import ListSuppliers from '../components/supplier/ListSuppliers';
import SupplierDetails from '../components/supplier/SupplierDetails';
import UpdateSupplier from '../components/supplier/UpdateSupplier';

// Routes
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

const AppRouter = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
        } />
        <Route path="/otp-verification" element={
          <OTPVerification />
        } />
        <Route path="/forgot-password" element={
          <ForgotPassword />
        } />
        <Route path="/reset-password" element={
          <ResetPassword />
        } />
        <Route path="/force-change-password" element={
          <PrivateRoute>
            <ForceChangePassword />
          </PrivateRoute>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Warehouse Routes */}
          <Route path="warehouse">
            <Route path="create" element={
              <AdminRoute>
                <CreateWarehouse />
              </AdminRoute>
            } />
            <Route path="update" element={
              <AdminRoute>
                <UpdateWarehouse />
              </AdminRoute>
            } />
          </Route>

          {/* Vendor Routes */}
          <Route path="vendors">
            <Route index element={<ListVendors />} />
            <Route path="create" element={
              <AdminRoute>
                <CreateVendor />
              </AdminRoute>
            } />
            <Route path=":vendorId" element={<VendorDetails />} />
            <Route path="update/:vendorId" element={
              <AdminRoute>
                <UpdateVendor />
              </AdminRoute>
            } />
          </Route>

          {/* Supplier Routes */}
          <Route path="suppliers">
            <Route index element={<ListSuppliers />} />
            <Route path="create" element={
              <AdminRoute>
                <CreateSupplier />
              </AdminRoute>
            } />
            <Route path=":supplierId" element={<SupplierDetails />} />
            <Route path="update/:supplierId" element={
              <AdminRoute>
                <UpdateSupplier />
              </AdminRoute>
            } />
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;