import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

// Layout
import Layout from '../components/Layout';

// Auth Components
import Login from '../components/auth/Login';
import OTPVerification from '../components/auth/OTPVerification';
import ForgotPassword from '../components/auth/ForgotPassword';
import ResetPassword from '../components/auth/ResetPassword';
import ForceChangePassword from '../components/auth/ForceChangePassword';
import LoginSuccess from '../components/auth/LoginSuccess';

// Dashboard
import Dashboard from '../components/dashboard/Dashboard';

// Warehouse Components
import CreateWarehouse from '../components/warehouse/CreateWarehouse';
import UpdateWarehouse from '../components/warehouse/UpdateWarehouse';
import WarehouseList from '../components/warehouse/WarehouseList';

// Vendor Components
import CreateVendor from '../components/vendor/CreateVendor';
import ListVendors from '../components/vendor/ListVendors';
import VendorDetails from '../components/vendor/VendorDetails';
import UpdateVendor from '../components/vendor/UpdateVendor';
import DeleteVendor from '../components/vendor/DeleteVendor';

// Supplier Components
import CreateSupplier from '../components/supplier/CreateSupplier';
import ListSuppliers from '../components/supplier/ListSuppliers';
import SupplierDetails from '../components/supplier/SupplierDetails';
import UpdateSupplier from '../components/supplier/UpdateSupplier';
import DeleteSupplier from '../components/supplier/DeleteSupplier';

// Admin Components
import AdminCreateUser from '../components/admin/AdminCreateUser';
import ListEmployees from '../components/admin/ListEmployees';
import UpdateEmployee from '../components/admin/UpdateEmployee';
import DeleteEmployee from '../components/admin/DeleteEmployee';

// Routes
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show global loader while checking authentication
  if (loading) {
    return <Loader fullScreen text="Loading application..." />;
  }

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
        <Route path="/login-success" element={
          <PrivateRoute>
            <LoginSuccess />
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
          
          <Route path="force-change-password" element={
            <PrivateRoute>
              <ForceChangePassword />
            </PrivateRoute>
          } />

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
            <Route path="delete/:vendorId" element={
              <AdminRoute>
                <DeleteVendor />
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
            <Route path="delete/:supplierId" element={
              <AdminRoute>
                <DeleteSupplier />
              </AdminRoute>
            } />
          </Route>

          {/* Warehouse Routes */}
          <Route path="warehouse">
            <Route index element={<WarehouseList />} />
            <Route path="list" element={<WarehouseList />} />
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

          {/* Admin Routes */}
          <Route path="admin">
            <Route index element={<Navigate to="/admin/employees" />} />
            <Route path="create-user" element={
              <AdminRoute>
                <AdminCreateUser />
              </AdminRoute>
            } />
            <Route path="employees" element={
              <AdminRoute>
                <ListEmployees />
              </AdminRoute>
            } />
            <Route path="update-employee/:employeeId" element={
              <AdminRoute>
                <UpdateEmployee />
              </AdminRoute>
            } />
            <Route path="delete-employee/:employeeId" element={
              <AdminRoute>
                <DeleteEmployee />
              </AdminRoute>
            } />
          </Route>
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;