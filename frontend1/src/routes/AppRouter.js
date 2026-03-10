import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import Layout from '../components/Layout';
import DeleteEmployee from '../components/admin/DeleteEmployee';
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
import DeleteVendor from '../components/vendor/DeleteVendor';

// Supplier Components
import CreateSupplier from '../components/supplier/CreateSupplier';
import ListSuppliers from '../components/supplier/ListSuppliers';
import SupplierDetails from '../components/supplier/SupplierDetails';
import UpdateSupplier from '../components/supplier/UpdateSupplier';
import DeleteSupplier from '../components/supplier/DeleteSupplier';

// Admin Components
import AdminCreateUser from '../components/admin/AdminCreateUser';
// import AdminDashboard from '../components/admin/AdminDashboard';
import ListEmployees from '../components/admin/ListEmployees';
import UpdateEmployee from '../components/admin/UpdateEmployee';

// Routes
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
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

        {/* ========== PROTECTED ROUTES ========== */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          {/* Dashboard */}
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Force Password Change (Special case) */}
          <Route path="force-change-password" element={
            <PrivateRoute>
              <ForceChangePassword />
            </PrivateRoute>
          } />

          {/* ===== VENDOR ROUTES ===== */}
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

          {/* ===== SUPPLIER ROUTES ===== */}
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

          {/* ===== WAREHOUSE ROUTES ===== */}
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

          {/* ===== ADMIN ROUTES ===== */}
          <Route path="admin">
            <Route index element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
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
          </Route>
        </Route>

        {/* ===== 404 - NOT FOUND ===== */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};
// Add these imports



// Add these routes inside your admin section
<Route path="admin">
  <Route index element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  } />
  <Route path="dashboard" element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  } />
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
  
  {/* Update and Delete routes */}
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

export default AppRouter;