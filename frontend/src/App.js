import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

import { AuthProvider, useAuth } from "./components/lib/auth-context";
import { AppLayout } from "./components/AppLayout";

// Pages
import UsersPage from "./pages/UsersPage";
import ProductsPage from "./pages/ProductsPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import PurchaseRequestsPage from "./pages/PurchaseRequestsPage";
import ASNPage from "./pages/ASNPage";
import GRNPage from "./pages/GRNPage";
import SuppliersPage from "./pages/SuppliersPage";
import WarehousesPage from "./pages/WarehousesPage";
import OutboundPage from "./pages/OutboundPage";
import QualityCheckPage from "./pages/QualityCheckPage";
import FinancePage from "./pages/FinancePage";
import SettingsPage from "./pages/SettingsPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import OTPPage from "./pages/auth/OTPPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ForceChangePasswordPage from "./pages/auth/ForceChangePasswordPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <AuthProvider>
          <Routes>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/otp" element={<OTPPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/force-change-password" element={<ForceChangePasswordPage />} />

            {/* Protected Routes WITH Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/purchase-requests" element={<PurchaseRequestsPage />} />
              <Route path="/asn" element={<ASNPage />} />
              <Route path="/grn" element={<GRNPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/warehouses" element={<WarehousesPage />} />
              <Route path="/outbound" element={<OutboundPage />} />
              <Route path="/quality-check" element={<QualityCheckPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;