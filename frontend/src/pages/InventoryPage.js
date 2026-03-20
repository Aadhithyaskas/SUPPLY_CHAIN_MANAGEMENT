import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";

const inventoryData = [
  { sku: "SKU-1001", name: "Steel Bolts M10", supplier: "MetalPro Inc", vendor: "FastTrack Supply", stock: 2400, location: "Zone A → Shelf 1 → Rack 3 → Bin 7", reorder: 500, status: "ok" },
  { sku: "SKU-1002", name: "PVC Pipes 2\"", supplier: "PipeWorks Ltd", vendor: "BuildEx Co", stock: 120, location: "Zone B → Shelf 2 → Rack 1 → Bin 2", reorder: 200, status: "low" },
  { sku: "SKU-1003", name: "Copper Wire 14AWG", supplier: "WireTech", vendor: "ElectroParts", stock: 5600, location: "Zone A → Shelf 3 → Rack 2 → Bin 5", reorder: 1000, status: "ok" },
  { sku: "SKU-1004", name: "Safety Gloves L", supplier: "SafeGear Co", vendor: "PPE Direct", stock: 45, location: "Zone C → Shelf 1 → Rack 1 → Bin 1", reorder: 100, status: "critical" },
  { sku: "SKU-1005", name: "Hydraulic Oil 5L", supplier: "LubeMax", vendor: "IndSupply", stock: 380, location: "Zone D → Shelf 4 → Rack 2 → Bin 8", reorder: 100, status: "ok" },
  { sku: "SKU-1006", name: "Packing Tape 48mm", supplier: "PackRight", vendor: "OfficeHub", stock: 80, location: "Zone A → Shelf 2 → Rack 4 → Bin 3", reorder: 150, status: "low" },
  { sku: "SKU-1007", name: "LED Panel Light", supplier: "BrightLux", vendor: "ElectroParts", stock: 920, location: "Zone B → Shelf 1 → Rack 3 → Bin 6", reorder: 200, status: "ok" },
  { sku: "SKU-1008", name: "Forklift Battery 48V", supplier: "PowerCell", vendor: "HeavyDuty Co", stock: 8, location: "Zone D → Shelf 1 → Rack 1 → Bin 1", reorder: 10, status: "critical" },
];

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  const filtered = inventoryData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = inventoryData.filter(i => i.status !== "ok").length;

  return (
    <AppLayout title="Inventory">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU or product name..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" className="h-9">
            <Plus className="w-4 h-4 mr-1.5" /> Add Product
          </Button>
        </div>

        {/* Low stock alert section */}
        {lowStockCount > 0 && (
          <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
            <CardContent className="flex items-center gap-3 p-3">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-medium">{lowStockCount} items</span>{" "}
                are at or below reorder threshold
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold w-[100px]">SKU</TableHead>
                  <TableHead className="text-xs font-semibold">Product Name</TableHead>
                  <TableHead className="text-xs font-semibold">Supplier</TableHead>
                  <TableHead className="text-xs font-semibold">Vendor</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Stock</TableHead>
                  <TableHead className="text-xs font-semibold">Location</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Reorder At</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="text-xs font-mono">{item.sku}</TableCell>
                    <TableCell className="text-sm font-medium">{item.name}</TableCell>
                    <TableCell className="text-xs">{item.supplier}</TableCell>
                    <TableCell className="text-xs">{item.vendor}</TableCell>
                    <TableCell className={`text-sm text-right font-medium tabular-nums ${item.status !== "ok" ? "text-destructive" : ""}`}>
                      {item.stock.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.location}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{item.reorder}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "ok" ? "secondary" : "destructive"} className="text-xs">
                        {item.status === "critical" ? "Critical" : item.status === "low" ? "Low" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-muted transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
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