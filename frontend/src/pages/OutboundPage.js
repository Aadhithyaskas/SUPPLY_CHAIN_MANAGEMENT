import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Eye, Loader2, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useToast } from "../components/ui/use-toast";
import { listPurchaseOrders, getPurchaseOrder } from "../services/apiService";

const statusMap = {
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  dispatched: { label: "Dispatched", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

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
      // Filter for approved/dispatched orders (outbound)
      const outboundOrders = (data || []).filter(order => 
        order.status === "approved" || order.status === "dispatched"
      );
      setOrders(outboundOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast({
        title: "Error",
        description: "Failed to load outbound orders.",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to load order details.",
        variant: "destructive",
      });
    }
  };

  const filtered = orders.filter((o) =>
    o.po_id?.toLowerCase().includes(search.toLowerCase()) ||
    o.vendor?.vendor_name?.toLowerCase().includes(search.toLowerCase())
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
                    <TableRow key={order.po_id}>
                      <TableCell className="text-xs font-mono font-medium">{order.po_id}</TableCell>
                      <TableCell className="text-sm">{order.vendor?.vendor_name || "-"}</TableCell>
                      <TableCell className="text-sm text-right tabular-nums">
                        {order.order_quantity}
                      </TableCell>
                      <TableCell className="text-sm text-right tabular-nums font-medium">
                        ₹{order.total_amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMap[order.status]?.variant || "outline"} className="text-xs">
                          {statusMap[order.status]?.label || order.status || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => handleViewOrder(order.po_id)}
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
      </div>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details: {selectedOrder?.po_id}</DialogTitle>
            <DialogDescription>
              Vendor: {selectedOrder?.vendor?.vendor_name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <p className="text-xs text-muted-foreground">PR Reference</p>
              <p className="text-sm font-mono">{selectedOrder?.pr?.pr_id || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={statusMap[selectedOrder?.status]?.variant}>
                {statusMap[selectedOrder?.status]?.label || selectedOrder?.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Product</p>
              <p className="text-sm">{selectedOrder?.pr?.product?.product_name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="text-sm">{selectedOrder?.order_quantity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unit Price</p>
              <p className="text-sm">₹{selectedOrder?.pr?.product?.unit_price?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-sm font-bold">₹{selectedOrder?.total_amount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created Date</p>
              <p className="text-sm">{selectedOrder?.created_at ? new Date(selectedOrder.created_at).toLocaleString() : "-"}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}