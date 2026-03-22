import { useState, useEffect } from "react";
import { useAuth } from "../components/lib/auth-context";
import { Card, CardContent } from "../components/ui/card";
import {
  Package, FileText, Truck, ClipboardCheck,
  AlertTriangle, Users, DollarSign, Loader2,
} from "lucide-react";
import {
  listProducts,
  listPurchaseRequests,
  getQCPendingGRNs,
  listSuppliers,
  listVendors,
  listEmployees,
  getProductStock,
} from "../services/apiService";

// Normalise any API response shape to a plain array
const toArray = (res, knownKey = null) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (knownKey && Array.isArray(res[knownKey])) return res[knownKey];
  for (const key of ["results", "data", "items"]) {
    if (Array.isArray(res[key])) return res[key];
  }
  const firstArr = Object.values(res).find(Array.isArray);
  return firstArr || [];
};

// ✅ NO <AppLayout> import or usage here.
// AppLayout lives in the router and wraps every page via <Outlet />.
// Adding it here would nest layout→sidebar→layout→sidebar infinitely.
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingPRs: 0,
    pendingQC: 0,
    totalSuppliers: 0,
    totalVendors: 0,
    totalEmployees: 0,
    lowStockItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, prsRes, qcGrnsRes, suppliersRes, vendorsRes, employeesRes] =
        await Promise.allSettled([
          listProducts(),
          listPurchaseRequests(),
          getQCPendingGRNs(),
          listSuppliers(),
          listVendors(),
          listEmployees(),
        ]);

      const getValue = (s) => (s.status === "fulfilled" ? s.value : null);

      const productsData  = getValue(productsRes);
      const prsData       = getValue(prsRes);
      const qcGrnsData    = getValue(qcGrnsRes);
      const suppliersData = getValue(suppliersRes);
      const vendorsData   = getValue(vendorsRes);
      const employeesData = getValue(employeesRes);

      const productList  = Array.isArray(productsData?.products)
        ? productsData.products
        : toArray(productsData, "products");

      const prList       = toArray(prsData);
      const qcList       = toArray(qcGrnsData);
      const supplierList = toArray(suppliersData);
      const vendorList   = toArray(vendorsData);
      const employeeList = toArray(employeesData);

      const pendingPRs = prList.filter(
        (pr) => pr.status === "Pending" || pr.status === "Finance Pending"
      );

      // Parallel stock fetch
      let lowStockCount = 0;
      if (productList.length > 0) {
        const stockResults = await Promise.allSettled(
          productList.map((p) => getProductStock(p.product_id))
        );
        stockResults.forEach((result, i) => {
          if (result.status === "fulfilled") {
            const stock   = result.value?.total_stock ?? 0;
            const reorder = productList[i]?.re_order ?? 0;
            if (stock <= reorder) lowStockCount++;
          }
        });
      }

      setStats({
        totalProducts:  productsData?.count ?? productList.length,
        pendingPRs:     pendingPRs.length,
        pendingQC:      qcList.length,
        totalSuppliers: supplierList.length,
        totalVendors:   vendorList.length,
        totalEmployees: employeeList.length,
        lowStockItems:  lowStockCount,
      });

      setRecentActivity(
        prList.slice(0, 5).map((pr) => ({
          time: pr.created_at
            ? new Date(pr.created_at).toLocaleString()
            : "Recently",
          text: `PR #${pr.pr_id} - ${pr.product?.product_name || "Product"} (${pr.status})`,
          type:
            pr.status === "Approved" ? "success" :
            pr.status === "Rejected" ? "error"   : "warning",
        }))
      );
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const roleStats = {
    admin: [
      { label: "Total Products", value: stats.totalProducts,  icon: Package,      alert: false },
      { label: "Employees",      value: stats.totalEmployees, icon: Users,         alert: false },
      { label: "Pending PRs",    value: stats.pendingPRs,     icon: FileText,      alert: false },
      { label: "Low Stock",      value: stats.lowStockItems,  icon: AlertTriangle, alert: stats.lowStockItems > 0 },
    ],
    manager: [
      { label: "Pending PRs",    value: stats.pendingPRs,    icon: FileText,      alert: false },
      { label: "Total Vendors",  value: stats.totalVendors,  icon: Truck,         alert: false },
      { label: "Total Products", value: stats.totalProducts, icon: Package,       alert: false },
      { label: "Low Stock",      value: stats.lowStockItems, icon: AlertTriangle, alert: stats.lowStockItems > 0 },
    ],
    supervisor: [
      { label: "Pending QC",      value: stats.pendingQC,      icon: ClipboardCheck, alert: false },
      { label: "Total Suppliers", value: stats.totalSuppliers, icon: Truck,           alert: false },
      { label: "Total Products",  value: stats.totalProducts,  icon: Package,         alert: false },
      { label: "Low Stock",       value: stats.lowStockItems,  icon: AlertTriangle,   alert: stats.lowStockItems > 0 },
    ],
    quality_checker: [
      { label: "Pending QC",     value: stats.pendingQC,     icon: ClipboardCheck, alert: false },
      { label: "Total Products", value: stats.totalProducts, icon: Package,         alert: false },
      { label: "Low Stock",      value: stats.lowStockItems, icon: AlertTriangle,   alert: stats.lowStockItems > 0 },
    ],
    finance_director: [
      { label: "Pending Approvals", value: stats.pendingPRs,    icon: FileText,   alert: false },
      { label: "Total Vendors",     value: stats.totalVendors,  icon: DollarSign, alert: false },
      { label: "Total Products",    value: stats.totalProducts, icon: Package,    alert: false },
    ],
    inventory_manager: [
      { label: "Total Products", value: stats.totalProducts,  icon: Package,      alert: false },
      { label: "Low Stock",      value: stats.lowStockItems,  icon: AlertTriangle, alert: stats.lowStockItems > 0 },
      { label: "Suppliers",      value: stats.totalSuppliers, icon: Users,         alert: false },
      { label: "Vendors",        value: stats.totalVendors,   icon: Truck,         alert: false },
    ],
  };

  const currentStats = roleStats[user?.role] || roleStats.manager;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-sm text-gray-500 capitalize">
          {user?.role?.replace(/_/g, " ") || "Dashboard"} Dashboard
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentStats.map((stat, index) => (
              <Card key={index} className="shadow-sm border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.alert ? "text-red-600" : "text-gray-900"}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.alert ? "bg-red-50" : "bg-[#1E3A8A]/10"}`}>
                      <stat.icon className={`w-4 h-4 ${stat.alert ? "text-red-600" : "text-[#1E3A8A]"}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-0">
                  {recentActivity.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 py-2.5 ${i > 0 ? "border-t border-gray-100" : ""}`}
                    >
                      <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                        item.type === "success" ? "bg-green-500" :
                        item.type === "error"   ? "bg-red-500"   : "bg-yellow-500"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700">{item.text}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}