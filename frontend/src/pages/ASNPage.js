import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout.js";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { listASN, getASN, deleteASN, listVendors } from "../services/apiService";
import { useToast } from "../components/ui/use-toast";

const statusStyles = {
  pending: { label: "Pending", variant: "outline" },
  in_transit: { label: "In Transit", variant: "default" },
  arrived: { label: "Arrived", variant: "secondary" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export default function ASNPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [asnData, setAsnData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedASN, setSelectedASN] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadASNs();
  }, []);

  const loadASNs = async () => {
    setIsLoading(true);
    try {
      const data = await listASN();
      setAsnData(data);
    } catch (error) {
      console.error("Failed to load ASNs:", error);
      toast({
        title: "Error",
        description: "Failed to load ASNs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewASN = async (asnId) => {
    try {
      const asn = await getASN(asnId);
      setSelectedASN(asn);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Failed to load ASN details:", error);
      toast({
        title: "Error",
        description: "Failed to load ASN details.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteASN = async (asnId) => {
    if (!window.confirm("Are you sure you want to delete this ASN?")) return;
    setIsSubmitting(true);
    try {
      await deleteASN(asnId);
      toast({ title: "Success", description: "ASN deleted successfully." });
      loadASNs();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = asnData.filter((a) =>
    a.asn_id?.toLowerCase().includes(search.toLowerCase()) ||
    a.vendor?.vendor_name?.toLowerCase().includes(search.toLowerCase())
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
          <Button size="sm" className="h-9" asChild>
            <a href="/asn/create">
              <Plus className="w-4 h-4 mr-1.5" /> New ASN
            </a>
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
                  <TableHead className="text-xs font-semibold">Shipment Date</TableHead>
                  <TableHead className="text-xs font-semibold">ETA</TableHead>
                  <TableHead className="text-xs font-semibold">Driver</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No ASNs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((asn) => (
                    <TableRow key={asn.asn_id}>
                      <TableCell className="text-xs font-mono font-medium">{asn.asn_id}</TableCell>
                      <TableCell className="text-sm">{asn.vendor?.vendor_name || "-"}</TableCell>
                      <TableCell className="text-sm text-right tabular-nums">
                        {asn.items?.length || 0}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {asn.shipment_date ? new Date(asn.shipment_date).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {asn.expected_arrival_date ? new Date(asn.expected_arrival_date).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-xs">{asn.driver_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={statusStyles[asn.status]?.variant || "secondary"} className="text-xs">
                          {statusStyles[asn.status]?.label || asn.status || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewASN(asn.asn_id)}
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteASN(asn.asn_id)}
                            className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                            title="Delete"
                            disabled={isSubmitting}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* View ASN Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ASN Details: {selectedASN?.asn_id}</DialogTitle>
            <DialogDescription>
              Vendor: {selectedASN?.vendor?.vendor_name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <p className="text-xs text-muted-foreground">ASN Number</p>
              <p className="text-sm font-mono">{selectedASN?.asn_number}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={statusStyles[selectedASN?.status]?.variant}>
                {statusStyles[selectedASN?.status]?.label || selectedASN?.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Shipment Date</p>
              <p className="text-sm">{selectedASN?.shipment_date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expected Arrival</p>
              <p className="text-sm">{selectedASN?.expected_arrival_date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vehicle Number</p>
              <p className="text-sm">{selectedASN?.vehicle_num || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Driver</p>
              <p className="text-sm">{selectedASN?.driver_name} / {selectedASN?.driver_phone}</p>
            </div>
          </div>

          {selectedASN?.items?.length > 0 && (
            <>
              <h4 className="text-sm font-semibold mt-2">Items</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Expected</TableHead>
                    <TableHead className="text-right">Shipped</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedASN.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.product?.product_name}</TableCell>
                      <TableCell className="text-right">{item.expected_quantity}</TableCell>
                      <TableCell className="text-right">{item.shipped_quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}