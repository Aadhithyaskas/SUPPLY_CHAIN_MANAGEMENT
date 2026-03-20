import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, UserPlus } from "lucide-react";

const asnData = [
  { id: "ASN-3021", vendor: "FastTrack Supply", items: 12, eta: "2026-03-20", status: "in_transit", assignedTo: "—" },
  { id: "ASN-3022", vendor: "BuildEx Co", items: 5, eta: "2026-03-21", status: "pending", assignedTo: "Sarah Chen" },
  { id: "ASN-3023", vendor: "ElectroParts", items: 8, eta: "2026-03-19", status: "arrived", assignedTo: "Sarah Chen" },
  { id: "ASN-3024", vendor: "PPE Direct", items: 3, eta: "2026-03-22", status: "in_transit", assignedTo: "—" },
  { id: "ASN-3025", vendor: "HeavyDuty Co", items: 2, eta: "2026-03-23", status: "pending", assignedTo: "—" },
];

const statusStyles = {
  pending: { label: "Pending", variant: "outline" },
  in_transit: { label: "In Transit", variant: "default" },
  arrived: { label: "Arrived", variant: "secondary" },
};

export default function ASNPage() {
  const [search, setSearch] = useState("");
  
  const filtered = asnData.filter((a) =>
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.vendor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Advanced Shipment Notices">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search ASN..." 
              className="pl-9 h-9" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Button size="sm" className="h-9">
            <Plus className="w-4 h-4 mr-1.5" /> New ASN
          </Button>
        </div>

        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">ASN ID</TableHead>
                  <TableHead className="text-xs font-semibold">Vendor</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Items</TableHead>
                  <TableHead className="text-xs font-semibold">ETA</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Assigned To</TableHead>
                  <TableHead className="text-xs font-semibold text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((asn) => (
                  <TableRow key={asn.id}>
                    <TableCell className="text-xs font-mono font-medium">{asn.id}</TableCell>
                    <TableCell className="text-sm">{asn.vendor}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{asn.items}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{asn.eta}</TableCell>
                    <TableCell>
                      <Badge variant={statusStyles[asn.status]?.variant || "secondary"} className="text-xs">
                        {statusStyles[asn.status]?.label || asn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{asn.assignedTo}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {asn.assignedTo === "—" && (
                          <button className="p-1.5 rounded hover:bg-primary/10 transition-colors" title="Assign Supervisor">
                            <UserPlus className="w-3.5 h-3.5 text-primary" />
                          </button>
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