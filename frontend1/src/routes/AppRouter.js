import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loader from "../components/common/Loader";
import Layout from "../components/Layout";

import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";

/* Auth */
import Login from "../components/auth/Login";
import OTPVerification from "../components/auth/OTPVerification";
import ForgotPassword from "../components/auth/ForgotPassword";
import ResetPassword from "../components/auth/ResetPassword";
import ForceChangePassword from "../components/auth/ForceChangePassword";
import LoginSuccess from "../components/auth/LoginSuccess";

/* Dashboard */
import Dashboard from "../components/dashboard/Dashboard";

/* Vendors */
import ListVendors from "../components/vendor/ListVendors";
import CreateVendor from "../components/vendor/CreateVendor";
import VendorDetails from "../components/vendor/VendorDetails";
import UpdateVendor from "../components/vendor/UpdateVendor";
import DeleteVendor from "../components/vendor/DeleteVendor";

/* Suppliers */
import ListSuppliers from "../components/supplier/ListSuppliers";
import CreateSupplier from "../components/supplier/CreateSupplier";
import SupplierDetails from "../components/supplier/SupplierDetails";
import UpdateSupplier from "../components/supplier/UpdateSupplier";
import DeleteSupplier from "../components/supplier/DeleteSupplier";

/* Warehouse */
import WarehouseList from "../components/warehouse/WarehouseList";
import CreateWarehouse from "../components/warehouse/CreateWarehouse";
import UpdateWarehouse from "../components/warehouse/UpdateWarehouse";

/* Admin */
import AdminCreateUser from "../components/admin/AdminCreateUser";
import ListEmployees from "../components/admin/ListEmployees";
import UpdateEmployee from "../components/admin/UpdateEmployee";
import DeleteEmployee from "../components/admin/DeleteEmployee";

const AppRoutes = () => {

  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Loading application..." />;
  }

  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
        />

        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* PROTECTED ROUTES */}

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >

          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />

          <Route path="force-change-password" element={<ForceChangePassword />} />

          <Route path="login-success" element={<LoginSuccess />} />

          {/* Vendors */}
          <Route path="vendors" element={<ListVendors />} />
          <Route path="vendors/:vendorId" element={<VendorDetails />} />

          <Route
            path="vendors/create"
            element={
              <AdminRoute>
                <CreateVendor />
              </AdminRoute>
            }
          />

          <Route
            path="vendors/update/:vendorId"
            element={
              <AdminRoute>
                <UpdateVendor />
              </AdminRoute>
            }
          />

          <Route
            path="vendors/delete/:vendorId"
            element={
              <AdminRoute>
                <DeleteVendor />
              </AdminRoute>
            }
          />

          {/* Suppliers */}
          <Route path="suppliers" element={<ListSuppliers />} />
          <Route path="suppliers/:supplierId" element={<SupplierDetails />} />

          <Route
            path="suppliers/create"
            element={
              <AdminRoute>
                <CreateSupplier />
              </AdminRoute>
            }
          />

          <Route
            path="suppliers/update/:supplierId"
            element={
              <AdminRoute>
                <UpdateSupplier />
              </AdminRoute>
            }
          />

          <Route
            path="suppliers/delete/:supplierId"
            element={
              <AdminRoute>
                <DeleteSupplier />
              </AdminRoute>
            }
          />

          {/* Warehouse */}
          <Route path="warehouse" element={<WarehouseList />} />

          <Route
            path="warehouse/create"
            element={
              <AdminRoute>
                <CreateWarehouse />
              </AdminRoute>
            }
          />

          <Route
            path="warehouse/update"
            element={
              <AdminRoute>
                <UpdateWarehouse />
              </AdminRoute>
            }
          />

          {/* Admin */}
          <Route
            path="admin/create-user"
            element={
              <AdminRoute>
                <AdminCreateUser />
              </AdminRoute>
            }
          />

          <Route
            path="admin/employees"
            element={
              <AdminRoute>
                <ListEmployees />
              </AdminRoute>
            }
          />

          <Route
            path="admin/update-employee/:employeeId"
            element={
              <AdminRoute>
                <UpdateEmployee />
              </AdminRoute>
            }
          />

          <Route
            path="admin/delete-employee/:employeeId"
            element={
              <AdminRoute>
                <DeleteEmployee />
              </AdminRoute>
            }
          />

        </Route>

        {/* 404 */}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;
