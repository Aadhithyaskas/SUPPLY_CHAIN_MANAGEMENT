import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Package, FileText, Truck, ClipboardCheck, AlertTriangle, TrendingUp, Users, DollarSign } from "lucide-react";

const stats = {
  admin: [
    { label: "Total Products", value: "2,847", icon: Package, change: "+12%" },
    { label: "Active Users", value: "34", icon: Users, change: "+2" },
    { label: "Pending PRs", value: "8", icon: FileText, change: "-3" },
    { label: "Low Stock Alerts", value: "15", icon: AlertTriangle, change: "+5", alert: true },
  ],
  manager: [
    { label: "Pending PRs", value: "8", icon: FileText, change: "3 urgent" },
    { label: "Outbound Orders", value: "12", icon: Truck, change: "+4" },
    { label: "Inventory Value", value: "$1.2M", icon: TrendingUp, change: "+8%" },
    { label: "Low Stock Items", value: "15", icon: AlertTriangle, change: "", alert: true },
  ],
  supervisor: [
    { label: "Pending GRN", value: "5", icon: ClipboardCheck, change: "2 urgent" },
    { label: "ASN Assigned", value: "3", icon: Truck, change: "+1" },
    { label: "Items Received", value: "342", icon: Package, change: "today" },
    { label: "Low Stock", value: "15", icon: AlertTriangle, change: "", alert: true },
  ],
  quality_checker: [
    { label: "Pending QC", value: "7", icon: ClipboardCheck, change: "3 urgent" },
    { label: "Passed Today", value: "18", icon: Package, change: "+6" },
    { label: "Rejected Today", value: "2", icon: AlertTriangle, change: "", alert: true },
    { label: "Total Inspected", value: "20", icon: TrendingUp, change: "today" },
  ],
  finance_director: [
    { label: "Pending Approvals", value: "4", icon: FileText, change: "2 high-value" },
    { label: "Monthly Spend", value: "$248K", icon: DollarSign, change: "+12%" },
    { label: "Profit Margin", value: "24.5%", icon: TrendingUp, change: "+1.2%" },
    { label: "Budget Utilized", value: "67%", icon: Package, change: "of Q1" },
  ],
};

const recentActivity = [
  { time: "2 min ago", text: "GRN #1042 verified by Sarah Chen", type: "success" },
  { time: "15 min ago", text: "PR #2087 pending Finance Director approval ($45,000)", type: "warning" },
  { time: "32 min ago", text: "ASN #3021 assigned to Supervisor", type: "info" },
  { time: "1 hr ago", text: "QC Rejected: SKU-4421 — Damaged packaging", type: "error" },
  { time: "2 hrs ago", text: "Outbound Order #5567 dispatched", type: "success" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  const roleStats = stats[user.role] || stats.admin;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Welcome back, {user.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            {user.role?.replace("_", " ")} Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roleStats.map((stat) => (
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
            <div className="space-y-0">
              {recentActivity.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 py-2.5 ${i > 0 ? "border-t" : ""}`}>
                  <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                    item.type === "success" ? "bg-success" : 
                    item.type === "warning" ? "bg-warning" : 
                    item.type === "error" ? "bg-destructive" : "bg-primary"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}