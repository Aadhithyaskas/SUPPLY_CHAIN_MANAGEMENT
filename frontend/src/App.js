import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider, useAuth } from "../src/components/lib/auth-context";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import OTPPage from "./pages/auth/OTPPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ForceChangePasswordPage from "./pages/auth/ForceChangePasswordPage";

// Core Pages
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

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
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
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/otp" element={<OTPPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/force-change-password" element={<ForceChangePasswordPage />} />
            
            {/* Protected Application Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/purchase-requests" element={<ProtectedRoute><PurchaseRequestsPage /></ProtectedRoute>} />
            <Route path="/asn" element={<ASNPage />} />
            <Route path="/grn" element={<ProtectedRoute><GRNPage /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
            <Route path="/warehouses" element={<ProtectedRoute><WarehousesPage /></ProtectedRoute>} />
            <Route path="/outbound" element={<ProtectedRoute><OutboundPage /></ProtectedRoute>} />
            <Route path="/quality-check" element={<ProtectedRoute><QualityCheckPage /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            
            {/* Catch all - redirect to dashboard if authenticated, else login */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;