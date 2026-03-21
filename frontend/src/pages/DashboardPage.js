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
} from "../services/apiService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingPRs: 0,
    pendingQC: 0,
    totalSuppliers: 0,
    totalVendors: 0,
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
      const [products, prs, qcGrns, suppliers, vendors] = await Promise.all([
        listProducts(),
        listPurchaseRequests(),
        getQCPendingGRNs(),
        listSuppliers(),
        listVendors(),
      ]);

      const pendingPRs = (prs || []).filter(pr => pr.status === "Pending" || pr.status === "Finance Pending");
      const lowStock = (products.products || []).filter(p => (p.quantity || 0) <= (p.re_order || 0));

      setStats({
        totalProducts: products.count || products.products?.length || 0,
        pendingPRs: pendingPRs.length,
        pendingQC: qcGrns?.length || 0,
        totalSuppliers: suppliers?.length || 0,
        totalVendors: vendors?.length || 0,
        lowStockItems: lowStock.length,
      });

      // Recent activity from PRs and GRNs
      const activities = [];
      (prs || []).slice(0, 3).forEach(pr => {
        activities.push({
          time: pr.created_at ? new Date(pr.created_at).toLocaleString() : "Recently",
          text: `PR #${pr.pr_id} - ${pr.product?.product_name} (${pr.status})`,
          type: pr.status === "Approved" ? "success" : "warning",
        });
      });
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const roleStats = {
    admin: [
      { label: "Total Products", value: stats.totalProducts, icon: Package, change: "" },
      { label: "Active Users", value: "—", icon: Users, change: "" },
      { label: "Pending PRs", value: stats.pendingPRs, icon: FileText, change: "" },
      { label: "Low Stock Alerts", value: stats.lowStockItems, icon: AlertTriangle, alert: stats.lowStockItems > 0 },
    ],
    manager: [
      { label: "Pending PRs", value: stats.pendingPRs, icon: FileText, change: "" },
      { label: "Total Vendors", value: stats.totalVendors, icon: Truck, change: "" },
      { label: "Total Products", value: stats.totalProducts, icon: Package, change: "" },
      { label: "Low Stock Items", value: stats.lowStockItems, icon: AlertTriangle, alert: stats.lowStockItems > 0 },
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
    ],
  };

  const currentStats = roleStats[user?.role] || roleStats.admin;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            {user?.role?.replace("_", " ") || "Dashboard"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentStats.map((stat) => (
                <Card key={stat.label} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${stat.alert ? "text-destructive" : "text-foreground"}`}>
                          {stat.value}
                        </p>
                        {stat.change && (
                          <p className={`text-xs mt-1 ${stat.alert ? "text-destructive" : "text-muted-foreground"}`}>
                            {stat.change}
                          </p>
                        )}
                      </div>
                      <div className={`p-2 rounded-lg ${stat.alert ? "bg-destructive/10" : "bg-primary/10"}`}>
                        <stat.icon className={`w-4 h-4 ${stat.alert ? "text-destructive" : "text-primary"}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-0">
                    {recentActivity.map((item, i) => (
                      <div key={i} className={`flex items-start gap-3 py-2.5 ${i > 0 ? "border-t" : ""}`}>
                        <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                          item.type === "success" ? "bg-success" : 
                          item.type === "warning" ? "bg-warning" : "bg-primary"
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">{item.text}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
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
    </AppLayout>
  );
}