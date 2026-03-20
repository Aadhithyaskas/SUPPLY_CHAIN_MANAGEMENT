import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const financeData = [
  { id: "INV-8801", boe: "BOE-5540", amount: 12400.50, duty: 1240.05, gst: 2232.09, status: "paid", date: "2026-03-15" },
  { id: "INV-8802", boe: "BOE-5541", amount: 8500.00, duty: 850.00, gst: 1530.00, status: "pending", date: "2026-03-18" },
  { id: "INV-8803", boe: "BOE-5542", amount: 21000.00, duty: 2100.00, gst: 3780.00, status: "overdue", date: "2026-03-10" },
];

export default function FinancePage() {
  const [search, setSearch] = useState("");

  const filtered = financeData.filter(item => 
    item.id.toLowerCase().includes(search.toLowerCase()) || 
    item.boe.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Finance & Customs Duty">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search Invoice or BOE..." 
              className="pl-9 h-9" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-1.5" /> Export Report
          </Button>
        </div>

        <Card className="shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Invoice ID</TableHead>
                <TableHead className="text-xs font-semibold">BOE Ref</TableHead>
                <TableHead className="text-xs font-semibold text-right">Assessable Value</TableHead>
                <TableHead className="text-xs font-semibold text-right">Duty (BCD+SWS)</TableHead>
                <TableHead className="text-xs font-semibold text-right">GST (18%)</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total Payable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-mono font-medium">{item.id}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{item.boe}</TableCell>
                  <TableCell className="text-sm text-right tabular-nums">${item.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right text-orange-600">${item.duty.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right text-blue-600">${item.gst.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.status === "paid" ? "secondary" : item.status === "overdue" ? "destructive" : "outline"}
                      className="capitalize text-[10px]"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-right tabular-nums">
                    ${(item.amount + item.duty + item.gst).toLocaleString()}
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