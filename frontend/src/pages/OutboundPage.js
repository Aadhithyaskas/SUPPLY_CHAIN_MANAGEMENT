import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Check, X } from "lucide-react";

const outboundData = [
  { id: "OUT-5567", destination: "Client Alpha - NYC", items: 15, total: "$18,400", date: "2026-03-19", status: "dispatched" },
  { id: "OUT-5568", destination: "Client Beta - LA", items: 8, total: "$7,200", date: "2026-03-19", status: "pending_approval" },
  { id: "OUT-5569", destination: "Client Gamma - Chicago", items: 22, total: "$31,000", date: "2026-03-18", status: "approved" },
  { id: "OUT-5570", destination: "Client Delta - Houston", items: 5, total: "$4,800", date: "2026-03-18", status: "pending_approval" },
  { id: "OUT-5571", destination: "Client Epsilon - Seattle", items: 12, total: "$15,600", date: "2026-03-17", status: "dispatched" },
];

const statusMap = {
  pending_approval: { label: "Pending Approval", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  dispatched: { label: "Dispatched", variant: "secondary" },
};

export default function OutboundPage() {
  const [search, setSearch] = useState("");
  
  const filtered = outboundData.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Outbound Orders">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              className="pl-9 h-9" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Button size="sm" className="h-9">
            <Plus className="w-4 h-4 mr-1.5" /> New Order
          </Button>
        </div>
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">Order ID</TableHead>
                  <TableHead className="text-xs font-semibold">Destination</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Items</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Total</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs font-mono font-medium">{o.id}</TableCell>
                    <TableCell className="text-sm">{o.destination}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{o.items}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums font-medium">{o.total}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{o.date}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[o.status]?.variant || "secondary"} className="text-xs">
                        {statusMap[o.status]?.label || o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {o.status === "pending_approval" && (
                          <>
                            <button className="p-1.5 rounded hover:bg-success/10 transition-colors">
                              <Check className="w-3.5 h-3.5 text-success" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
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