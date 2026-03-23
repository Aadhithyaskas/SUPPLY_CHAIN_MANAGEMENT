import {
  LayoutDashboard,
  Package,
  FileText,
  Truck,
  ClipboardCheck,
  Users,
  Building2,
  UserCheck,
  Warehouse,
  PackageOpen,
  Settings,
  DollarSign,
  CheckSquare,
} from "lucide-react";

const allModules = {
  dashboard: { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  products: { title: "Products", url: "/products", icon: Package },
  inventory: { title: "Inventory", url: "/inventory", icon: Package },
  purchaseRequests: { title: "Purchase Requests", url: "/purchase-requests", icon: FileText },
  asn: { title: "ASN", url: "/asn", icon: Truck },
  grn: { title: "GRN", url: "/grn", icon: ClipboardCheck },
  qualityCheck: { title: "Quality Check", url: "/quality-check", icon: CheckSquare },
  users: { title: "Users", url: "/users", icon: Users },
  vendors: { title: "Vendors", url: "/vendors", icon: Building2 },
  suppliers: { title: "Suppliers", url: "/suppliers", icon: UserCheck },
  warehouses: { title: "Warehouses", url: "/warehouses", icon: Warehouse },
  outbound: { title: "Outbound Orders", url: "/outbound", icon: PackageOpen },
  finance: { title: "Finance", url: "/finance", icon: DollarSign },
  settings: { title: "Settings", url: "/settings", icon: Settings },
};

const roleModules = {
  admin: [
    "dashboard", "products", "inventory", "purchaseRequests", "asn", "grn",
    "users", "vendors", "suppliers", "warehouses", "outbound",
    "qualityCheck", "finance", "settings"
  ],
  manager: ["dashboard", "products", "inventory", "purchaseRequests", "asn", "outbound"],
  supervisor: ["dashboard", "inventory", "asn", "grn"],
  quality_checker: ["dashboard", "qualityCheck", "grn"],  // ✅ Added grn for quality checker
  finance_director: ["dashboard", "finance", "purchaseRequests"],
  inventory_manager: ["dashboard", "products", "inventory", "suppliers", "vendors", "warehouses"],
  quality_assistant: ["dashboard", "qualityCheck"],  // ✅ Added quality_assistant role
};

export function getNavItemsForRole(role) {
  // ✅ Add fallback for undefined roles
  const modules = roleModules[role];
  
  if (!modules) {
    console.warn(`Role "${role}" not found in roleModules. Defaulting to manager.`);
    return roleModules.manager.map((key) => allModules[key]);
  }
  
  return modules.map((key) => allModules[key]);
}