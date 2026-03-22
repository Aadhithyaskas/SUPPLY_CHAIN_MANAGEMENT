import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Trash2, Eye, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { listASN, getASN, deleteASN } from "../services/apiService";
import { useToast } from "../components/ui/use-toast";

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

const STATUS_STYLES = {
  pending:    { label: "Pending",    variant: "outline" },
  in_transit: { label: "In Transit", variant: "default" },
  arrived:    { label: "Arrived",    variant: "secondary" },
  completed:  { label: "Completed",  variant: "success" },
  cancelled:  { label: "Cancelled",  variant: "destructive" },
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
      // ✅ FIX: listASN may return { asns: [...] } or { results: [...] } — not a bare array
      setAsnData(toArray(data, "asns"));
    } catch (error) {
      console.error("Failed to load ASNs:", error);
      toast({ title: "Error", description: "Failed to load ASNs.", variant: "destructive" });
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
      toast({ title: "Error", description: "Failed to load ASN details.", variant: "destructive" });
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

  const q = search.toLowerCase();
  // ✅ FIX: asn_id is an integer from Django — use matchesSearch for safe coercion
  const filtered = asnData.filter(
    (a) =>
      matchesSearch(a.asn_id, q) ||
      matchesSearch(a.vendor?.vendor_name, q)
  );

  return (
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
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
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
                    <TableCell className="text-right">{asn.items?.length ?? 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {asn.shipment_date
                        ? new Date(asn.shipment_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {asn.expected_arrival_date
                        ? new Date(asn.expected_arrival_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-xs">{asn.driver_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_STYLES[asn.status]?.variant || "secondary"} className="text-xs">
                        {STATUS_STYLES[asn.status]?.label || asn.status || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleViewASN(asn.asn_id)}
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteASN(asn.asn_id)}
                          disabled={isSubmitting}
                          className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                          title="Delete"
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ASN Details</DialogTitle>
            <DialogDescription>{selectedASN?.vendor?.vendor_name ?? "—"}</DialogDescription>
          </DialogHeader>

          {selectedASN && (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <p className="text-muted-foreground">ASN ID</p>
                <p className="font-mono font-medium">{selectedASN.asn_id}</p>

                <p className="text-muted-foreground">Status</p>
                <Badge variant={STATUS_STYLES[selectedASN.status]?.variant || "secondary"} className="w-fit text-xs">
                  {STATUS_STYLES[selectedASN.status]?.label || selectedASN.status}
                </Badge>

                <p className="text-muted-foreground">Driver</p>
                <p>{selectedASN.driver_name || "-"}</p>

                <p className="text-muted-foreground">Vehicle No.</p>
                <p>{selectedASN.vehicle_number || "-"}</p>

                <p className="text-muted-foreground">Shipment Date</p>
                <p>
                  {selectedASN.shipment_date
                    ? new Date(selectedASN.shipment_date).toLocaleDateString()
                    : "-"}
                </p>

                <p className="text-muted-foreground">Expected Arrival</p>
                <p>
                  {selectedASN.expected_arrival_date
                    ? new Date(selectedASN.expected_arrival_date).toLocaleDateString()
                    : "-"}
                </p>

                {selectedASN.items?.length > 0 && (
                  <>
                    <p className="text-muted-foreground col-span-2 font-medium pt-2 border-t">
                      Items ({selectedASN.items.length})
                    </p>
                    {selectedASN.items.map((item, i) => (
                      <p key={i} className="col-span-2 text-xs text-muted-foreground pl-2">
                        • {item.product?.product_name ?? `Item ${i + 1}`} — Qty: {item.quantity ?? 0}
                      </p>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}