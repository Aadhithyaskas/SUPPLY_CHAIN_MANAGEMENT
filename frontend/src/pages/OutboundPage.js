import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Eye, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { useToast } from "../components/ui/use-toast";
import { listPurchaseOrders, getPurchaseOrder } from "../services/apiService";

// Normalise any API response to a plain array
const toArray = (res, knownKey = null) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (knownKey && Array.isArray(res[knownKey])) return res[knownKey];
  for (const key of ["results", "data", "items"]) {
    if (Array.isArray(res[key])) return res[key];
  }
  return Object.values(res).find(Array.isArray) || [];
};

// Safe search — coerces any value type to string before matching
const matchesSearch = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

const STATUS_MAP = {
  pending:    { label: "Pending",    variant: "outline" },
  approved:   { label: "Approved",   variant: "default" },
  dispatched: { label: "Dispatched", variant: "secondary" },
  cancelled:  { label: "Cancelled",  variant: "destructive" },
};

// ✅ No <AppLayout> — layout is provided by the router via <Outlet>
export default function OutboundPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await listPurchaseOrders();
      // ✅ FIX: listPurchaseOrders hits /purchase-requests/ as a fallback and may
      // return an envelope object — normalise before filtering
      const all = toArray(data);
      setOrders(
        all.filter((o) => o.status === "approved" || o.status === "dispatched")
      );
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast({ title: "Error", description: "Failed to load outbound orders.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const order = await getPurchaseOrder(orderId);
      setSelectedOrder(order);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Failed to load order details:", error);
      toast({ title: "Error", description: "Failed to load order details.", variant: "destructive" });
    }
  };

  const q = search.toLowerCase();
  // ✅ FIX: po_id / pr_id are integers — use matchesSearch for safe coercion
  const filtered = orders.filter(
    (o) =>
      matchesSearch(o.po_id, q) ||
      matchesSearch(o.pr_id, q) ||
      matchesSearch(o.vendor?.vendor_name, q)
  );

  return (
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
        <Button size="sm" className="h-9" asChild>
          <a href="/purchase-requests">
            <Plus className="w-4 h-4 mr-1.5" /> New Order
          </a>
        </Button>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">PO ID</TableHead>
                <TableHead className="text-xs font-semibold">Vendor</TableHead>
                <TableHead className="text-xs font-semibold text-right">Quantity</TableHead>
                <TableHead className="text-xs font-semibold text-right">Total Amount</TableHead>
                <TableHead className="text-xs font-semibold">Created Date</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No outbound orders found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <TableRow key={order.po_id ?? order.pr_id}>
                    <TableCell className="text-xs font-mono font-medium">
                      {order.po_id ?? order.pr_id}
                    </TableCell>
                    <TableCell className="text-sm">{order.vendor?.vendor_name || "-"}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">
                      {order.order_quantity ?? order.requested_quantity ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm text-right tabular-nums font-medium">
                      ₹{(order.total_amount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={STATUS_MAP[order.status]?.variant || "outline"}
                        className="text-xs"
                      >
                        {STATUS_MAP[order.status]?.label || order.status || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleViewOrder(order.po_id ?? order.pr_id)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Order Details: {selectedOrder?.po_id ?? selectedOrder?.pr_id}
            </DialogTitle>
            <DialogDescription>
              Vendor: {selectedOrder?.vendor?.vendor_name ?? "-"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">PR Reference</p>
              <p className="font-mono">
                {selectedOrder?.pr?.pr_id ?? selectedOrder?.pr_id ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge
                variant={STATUS_MAP[selectedOrder?.status]?.variant || "outline"}
                className="text-xs mt-0.5"
              >
                {STATUS_MAP[selectedOrder?.status]?.label || selectedOrder?.status || "-"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Product</p>
              <p>
                {selectedOrder?.pr?.product?.product_name ??
                  selectedOrder?.product?.product_name ??
                  "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p>{selectedOrder?.order_quantity ?? selectedOrder?.requested_quantity ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unit Price</p>
              <p>
                ₹{(
                  selectedOrder?.pr?.product?.unit_price ??
                  selectedOrder?.product?.unit_price ??
                  0
                ).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="font-bold">
                ₹{(selectedOrder?.total_amount ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Created Date</p>
              <p>
                {selectedOrder?.created_at
                  ? new Date(selectedOrder.created_at).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}