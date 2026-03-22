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
  users: { title: "Users", url: "/users", icon: Users },
  vendors: { title: "Vendors", url: "/vendors", icon: Building2 },
  suppliers: { title: "Suppliers", url: "/suppliers", icon: UserCheck },
  warehouses: { title: "Warehouses", url: "/warehouses", icon: Warehouse },
  outbound: { title: "Outbound Orders", url: "/outbound", icon: PackageOpen },
  qualityCheck: { title: "Quality Check", url: "/quality-check", icon: CheckSquare },
  finance: { title: "Finance", url: "/finance", icon: DollarSign },
  settings: { title: "Settings", url: "/settings", icon: Settings },
};

const roleModules = {
  admin: [
    "dashboard","inventory","purchaseRequests","asn","grn",
    "users","vendors","suppliers","warehouses","outbound",
    "qualityCheck","finance","settings","products"
  ],
  manager: ["dashboard", "inventory", "purchaseRequests", "asn", "outbound","products"],
  supervisor: ["dashboard", "inventory", "asn", "grn"],
  quality_checker: ["dashboard", "qualityCheck"],
  finance_director: ["dashboard", "finance", "purchaseRequests"],
  inventory_manager: ["dashboard", "products", "inventory", "suppliers", "vendors", "warehouses"],
};

export function getNavItemsForRole(role) {
  return roleModules[role].map((key) => allModules[key]);
}
