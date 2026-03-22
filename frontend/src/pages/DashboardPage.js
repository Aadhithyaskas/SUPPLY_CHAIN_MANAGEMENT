import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../components/lib/auth-context";
import { Card, CardContent } from "../components/ui/card";
import { Package, FileText, Truck, ClipboardCheck, AlertTriangle, TrendingUp, Users, DollarSign, Loader2 } from "lucide-react";
import {
  listProducts,
  listPurchaseRequests,
  getQCPendingGRNs,
  listSuppliers,
  listVendors,
  listEmployees,
  getProductStock,
} from "../services/apiService";

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
      const [products, prs, qcGrns, suppliers, vendors, employees] = await Promise.all([
        listProducts(),
        listPurchaseRequests(),
        getQCPendingGRNs(),
        listSuppliers(),
        listVendors(),
        listEmployees(),
      ]);

      const pendingPRs = (prs || []).filter(pr => 
        pr.status === "Pending" || pr.status === "Finance Pending"
      );
      
      // Calculate low stock items
      let lowStockCount = 0;
      const productList = products?.products || [];
      for (const product of productList) {
        try {
          const stock = await getProductStock(product.product_id);
          if ((stock?.total_stock || 0) <= (product.re_order || 0)) {
            lowStockCount++;
          }
        } catch (e) {
          console.error(`Failed to get stock for product ${product.product_id}:`, e);
          // Skip if stock check fails
        }
      }

      setStats({
        totalProducts: products?.count || productList.length,
        pendingPRs: pendingPRs.length,
        pendingQC: qcGrns?.length || 0,
        totalSuppliers: suppliers?.length || 0,
        totalVendors: vendors?.length || 0,
        totalEmployees: employees?.length || 0,
        lowStockItems: lowStockCount,
      });

      // Recent activity from PRs
      const activities = [];
      (prs || []).slice(0, 5).forEach(pr => {
        activities.push({
          time: pr.created_at ? new Date(pr.created_at).toLocaleString() : "Recently",
          text: `PR #${pr.pr_id} - ${pr.product?.product_name || "Product"} (${pr.status})`,
          type: pr.status === "Approved" ? "success" : 
                 pr.status === "Rejected" ? "error" : "warning",
        });
      });
      setRecentActivity(activities);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const roleStats = {
    admin: [
      { label: "Total Products", value: stats.totalProducts, icon: Package, change: "" },
      { label: "Employees", value: stats.totalEmployees, icon: Users, change: "" },
      { label: "Pending PRs", value: stats.pendingPRs, icon: FileText, change: "" },
      { label: "Low Stock", value: stats.lowStockItems, icon: AlertTriangle, alert: stats.lowStockItems > 0 },
    ],
    manager: [
      { label: "Pending PRs", value: stats.pendingPRs, icon: FileText, change: "" },
      { label: "Total Vendors", value: stats.totalVendors, icon: Truck, change: "" },
      { label: "Total Products", value: stats.totalProducts, icon: Package, change: "" },
      { label: "Low Stock", value: stats.lowStockItems, icon: AlertTriangle, alert: stats.lowStockItems > 0 },
    ],
    supervisor: [
      { label: "Pending QC", value: stats.pendingQC, icon: ClipboardCheck, change: "" },
      { label: "Total Suppliers", value: stats.totalSuppliers, icon: Truck, change: "" },
      { label: "Total Products", value: stats.totalProducts, icon: Package, change: "" },
      { label: "Low Stock", value: stats.lowStockItems, icon: AlertTriangle, alert: stats.lowStockItems > 0 },
    ],
    quality_checker: [
      { label: "Pending QC", value: stats.pendingQC, icon: ClipboardCheck, change: "" },
      { label: "Total Products", value: stats.totalProducts, icon: Package, change: "" },
      { label: "Low Stock", value: stats.lowStockItems, icon: AlertTriangle, alert: stats.lowStockItems > 0 },
    ],
    finance_director: [
      { label: "Pending Approvals", value: stats.pendingPRs, icon: FileText, change: "" },
      { label: "Total Vendors", value: stats.totalVendors, icon: DollarSign, change: "" },
      { label: "Total Products", value: stats.totalProducts, icon: Package, change: "" },
    ],
    inventory_manager: [
      { label: "Total Products", value: stats.totalProducts, icon: Package, change: "" },
      { label: "Low Stock", value: stats.lowStockItems, icon: AlertTriangle, alert: stats.lowStockItems > 0 },
      { label: "Suppliers", value: stats.totalSuppliers, icon: Users, change: "" },
      { label: "Vendors", value: stats.totalVendors, icon: Truck, change: "" },
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
                        {stat.change && (
                          <p className={`text-xs mt-1 ${stat.alert ? "text-red-600" : "text-gray-500"}`}>
                            {stat.change}
                          </p>
                        )}
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
                      <div key={i} className={`flex items-start gap-3 py-2.5 ${i > 0 ? "border-t border-gray-100" : ""}`}>
                        <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                          item.type === "success" ? "bg-green-500" : 
                          item.type === "error" ? "bg-red-500" : "bg-yellow-500"
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