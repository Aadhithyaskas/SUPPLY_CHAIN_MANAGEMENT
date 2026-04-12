import React from "react";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { useAuth } from "../components/lib/auth-context";
import { Bell } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

export function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path.includes("upload-agreement"))  return "Upload Vendor Agreement";
    if (path.includes("dashboard"))         return "Dashboard";
    if (path.includes("users"))             return "User Management";
    if (path.includes("products"))          return "Products";
    if (path.includes("inventory"))         return "Inventory";
    if (path.includes("purchase-requests")) return "Purchase Requests";
    if (path.includes("asn"))               return "ASN";
    if (path.includes("grn"))               return "GRN";
    if (path.includes("suppliers"))         return "Suppliers";
    if (path.includes("vendors"))           return "Vendors";
    if (path.includes("warehouses"))        return "Warehouses";
    if (path.includes("outbound"))          return "Outbound Orders";
    if (path.includes("quality-check"))     return "Quality Check";
    if (path.includes("finance"))           return "Finance";
    if (path.includes("settings"))          return "Settings";
    return "";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">

        {/* Sidebar — rendered ONCE here, NEVER inside page components */}
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">

          <header className="h-12 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-sm font-semibold text-foreground">
                {getTitle()}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-destructive" />
              </button>
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                {user?.name
                  ? user.name.split(" ").map((n) => n[0]).join("")
                  : "U"}
              </div>
            </div>
          </header>

          {/* ✅ FIX: <Outlet /> was missing — all page content renders here */}
          <main className="flex-1 p-4 overflow-auto">
            <div className="animate-slide-in">
              <Outlet />
            </div>
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
}