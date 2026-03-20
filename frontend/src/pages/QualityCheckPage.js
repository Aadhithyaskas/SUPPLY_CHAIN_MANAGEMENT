import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const qcData = [
  { id: "QC-401", grn: "GRN-1042", product: "LED Panel Light", qty: 8, inspector: "Mike Davis", date: "2026-03-19", status: "pending" },
  { id: "QC-400", grn: "GRN-1041", product: "Steel Bolts M10", qty: 48, inspector: "Mike Davis", date: "2026-03-18", status: "passed" },
  { id: "QC-399", grn: "GRN-1040", product: "PVC Pipes 2\"", qty: 100, inspector: "Anna Lee", date: "2026-03-17", status: "passed" },
  { id: "QC-398", grn: "GRN-1039", product: "Safety Gloves L", qty: 250, inspector: "Mike Davis", date: "2026-03-16", status: "pending" },
  { id: "QC-397", grn: "GRN-1038", product: "Copper Wire 14AWG", qty: 30, inspector: "Anna Lee", date: "2026-03-15", status: "rejected" },
];

const statusMap = {
  pending: { label: "Pending", variant: "outline" },
  passed: { label: "QC Passed", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function QualityCheckPage() {
  const [search, setSearch] = useState("");
  
  const filtered = qcData.filter((q) =>
    q.id.toLowerCase().includes(search.toLowerCase()) ||
    q.product.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Quality Check">
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search inspections..." 
            className="pl-9 h-9" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">QC ID</TableHead>
                  <TableHead className="text-xs font-semibold">GRN Ref</TableHead>
                  <TableHead className="text-xs font-semibold">Product</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Qty</TableHead>
                  <TableHead className="text-xs font-semibold">Inspector</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="text-xs font-mono font-medium">{q.id}</TableCell>
                    <TableCell className="text-xs font-mono">{q.grn}</TableCell>
                    <TableCell className="text-sm">{q.product}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{q.qty}</TableCell>
                    <TableCell className="text-xs">{q.inspector}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{q.date}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[q.status]?.variant || "secondary"} className="text-xs">
                        {statusMap[q.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {q.status === "pending" && (
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded hover:bg-success/10 transition-colors" title="Pass">
                            <Check className="w-3.5 h-3.5 text-success" />
                          </button>
                          <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors" title="Reject">
                            <X className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      )}
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