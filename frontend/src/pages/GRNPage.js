import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreHorizontal } from "lucide-react";

const grnData = [
  { id: "GRN-1042", po: "PO-2029", vendor: "MetalPro Inc", items: 5, date: "2026-03-20", status: "received" },
  { id: "GRN-1043", po: "PO-2030", vendor: "WireTech", items: 2, date: "2026-03-19", status: "in-transit" },
  { id: "GRN-1044", po: "PO-2031", vendor: "LubeMax", items: 12, date: "2026-03-19", status: "pending" },
];

export default function GRNPage() {
  return (
    <AppLayout title="Goods Received Note (GRN)">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" className="h-9">New GRN Entry</Button>
        </div>

        <Card className="shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">GRN Number</TableHead>
                <TableHead className="text-xs font-semibold">PO Reference</TableHead>
                <TableHead className="text-xs font-semibold">Vendor</TableHead>
                <TableHead className="text-xs font-semibold text-center">Items</TableHead>
                <TableHead className="text-xs font-semibold">Arrival Date</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grnData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs font-mono font-bold text-primary">{row.id}</TableCell>
                  <TableCell className="text-xs font-mono">{row.po}</TableCell>
                  <TableCell className="text-sm font-medium">{row.vendor}</TableCell>
                  <TableCell className="text-sm text-center">{row.items}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.date}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={row.status === "received" ? "secondary" : "outline"}
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {row.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}