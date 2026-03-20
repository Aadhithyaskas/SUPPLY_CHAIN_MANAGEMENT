import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const prData = [
  { id: "PR-2087", product: "Steel Bolts M10", qty: 5000, amount: "$12,500", requester: "James Miller", date: "2026-03-18", status: "pending", needsFinance: false },
  { id: "PR-2088", product: "Forklift Battery 48V", qty: 15, amount: "$45,000", requester: "James Miller", date: "2026-03-17", status: "pending_finance", needsFinance: true },
  { id: "PR-2089", product: "Safety Gloves L", qty: 500, amount: "$2,250", requester: "Sarah Chen", date: "2026-03-17", status: "approved", needsFinance: false },
  { id: "PR-2090", product: "PVC Pipes 2\"", qty: 1000, amount: "$8,400", requester: "James Miller", date: "2026-03-16", status: "rejected", needsFinance: false },
  { id: "PR-2091", product: "Hydraulic Oil 5L", qty: 200, amount: "$6,800", requester: "Sarah Chen", date: "2026-03-15", status: "approved", needsFinance: false },
  { id: "PR-2092", product: "Industrial Motor 5HP", qty: 3, amount: "$52,000", requester: "James Miller", date: "2026-03-15", status: "pending_finance", needsFinance: true },
];

const statusMap = {
  pending: { label: "Pending", variant: "outline" },
  pending_finance: { label: "Finance Review", variant: "default" },
  approved: { label: "Approved", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function PurchaseRequestsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  
  const filtered = prData.filter((p) =>
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.product.toLowerCase().includes(search.toLowerCase())
  );

  const canApprove = ["manager", "finance_director", "admin"].includes(user?.role);

  return (
    <AppLayout title="Purchase Requests">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search PRs..." 
              className="pl-9 h-9" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Button size="sm" className="h-9">
            <Plus className="w-4 h-4 mr-1.5" /> Create PR
          </Button>
        </div>

        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">PR ID</TableHead>
                  <TableHead className="text-xs font-semibold">Product</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Qty</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-semibold">Requested By</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell className="text-xs font-mono font-medium">{pr.id}</TableCell>
                    <TableCell className="text-sm">{pr.product}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{pr.qty.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums font-medium">{pr.amount}</TableCell>
                    <TableCell className="text-xs">{pr.requester}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{pr.date}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[pr.status]?.variant || "secondary"} className="text-xs">
                        {statusMap[pr.status]?.label || pr.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canApprove && (
                          (pr.status === "pending") || 
                          (pr.status === "pending_finance" && ["finance_director", "admin"].includes(user?.role))
                        ) && (
                          <>
                            <button className="p-1.5 rounded hover:bg-success/10 transition-colors" title="Approve">
                              <Check className="w-3.5 h-3.5 text-success" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors" title="Reject">
                              <X className="w-3.5 h-3.5 text-destructive" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 rounded hover:bg-muted transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}