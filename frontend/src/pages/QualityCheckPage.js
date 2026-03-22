import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, CheckCircle, Loader2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useToast } from "../components/ui/use-toast";
import {
  getQCPendingGRNs,
  getGRNItems,
  updateGRNItem,
  approveGRN,
  getGRNSummary,
} from "../services/apiService";

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

// Safe search: coerces any value type to string before matching
const matchesSearch = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

// ✅ No <AppLayout> — layout is provided by the router via <Outlet>
export default function QualityCheckPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [pendingGRNs, setPendingGRNs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [grnItems, setGrnItems] = useState([]);
  const [grnSummary, setGrnSummary] = useState(null);
  const [qcDialogOpen, setQcDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPendingGRNs();
  }, []);

  const loadPendingGRNs = async () => {
    setIsLoading(true);
    try {
      const data = await getQCPendingGRNs();
      // ✅ FIX: API may return envelope object — normalise to array
      setPendingGRNs(toArray(data, "grns"));
    } catch (error) {
      console.error("Failed to load pending GRNs:", error);
      toast({ title: "Error", description: "Failed to load pending QC GRNs.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadGRNDetails = async (grn) => {
    const [itemsRes, summaryRes] = await Promise.allSettled([
      getGRNItems(grn.grn_id),
      getGRNSummary(grn.grn_id),
    ]);

    // ✅ FIX: getGRNItems may return { items: [...] } — normalise
    const items   = itemsRes.status   === "fulfilled" ? toArray(itemsRes.value,   "items")   : [];
    // ✅ FIX: getGRNSummary returns a plain object { received, accepted, rejected }
    const summary = summaryRes.status === "fulfilled" ? (summaryRes.value ?? null) : null;

    return { items, summary };
  };

  const handleStartQC = async (grn) => {
    setIsLoading(true);
    try {
      const { items, summary } = await loadGRNDetails(grn);
      setSelectedGRN(grn);
      setGrnItems(items);
      setGrnSummary(summary);
      setQcDialogOpen(true);
    } catch (error) {
      console.error("Failed to load GRN details:", error);
      toast({ title: "Error", description: "Failed to load GRN details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewGRN = async (grn) => {
    setIsLoading(true);
    try {
      const { items, summary } = await loadGRNDetails(grn);
      setSelectedGRN(grn);
      setGrnItems(items);
      setGrnSummary(summary);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Failed to load GRN details:", error);
      toast({ title: "Error", description: "Failed to load GRN details.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQC = async (itemId, acceptedQty, rejectedQty) => {
    setIsSubmitting(true);
    try {
      await updateGRNItem(itemId, {
        accepted_quantity: acceptedQty,
        rejected_quantity: rejectedQty,
      });
      // Refresh items + summary after update
      const { items, summary } = await loadGRNDetails(selectedGRN);
      setGrnItems(items);
      setGrnSummary(summary);
      toast({ title: "Success", description: "QC updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveGRN(selectedGRN.grn_id);
      toast({ title: "Success", description: "GRN approved and inventory updated." });
      setQcDialogOpen(false);
      loadPendingGRNs();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const q = search.toLowerCase();
  // ✅ FIX: grn_id and po_id are integers — use matchesSearch for safe coercion
  const filtered = pendingGRNs.filter(
    (grn) =>
      matchesSearch(grn.grn_id, q) ||
      matchesSearch(grn.po?.po_id, q)
  );

  // "Approve" button is enabled only when every item has at least some QC quantity entered
  const allItemsQCCompleted = grnItems.length > 0 && grnItems.every(
    (item) => (item.accepted_quantity ?? 0) > 0 || (item.rejected_quantity ?? 0) > 0
  );

  const SummaryBanner = ({ summary }) =>
    summary ? (
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Total Received</p>
          <p className="text-lg font-bold">{summary.received ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Accepted</p>
          <p className="text-lg font-bold text-green-600">{summary.accepted ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Rejected</p>
          <p className="text-lg font-bold text-destructive">{summary.rejected ?? 0}</p>
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search GRN..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">GRN ID</TableHead>
                <TableHead className="text-xs font-semibold">PO Reference</TableHead>
                <TableHead className="text-xs font-semibold">Vendor</TableHead>
                <TableHead className="text-xs font-semibold text-center">Items</TableHead>
                <TableHead className="text-xs font-semibold">Receipt Date</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
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
                    No pending QC GRNs found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((grn) => (
                  <TableRow key={grn.grn_id}>
                    <TableCell className="text-xs font-mono font-bold text-primary">
                      {grn.grn_id}
                    </TableCell>
                    <TableCell className="text-xs font-mono">{grn.po?.po_id || "-"}</TableCell>
                    <TableCell className="text-sm">{grn.po?.vendor?.vendor_name || "-"}</TableCell>
                    <TableCell className="text-sm text-center">
                      {grn.items?.length ?? 0}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {grn.receipt_date ? new Date(grn.receipt_date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase">
                        QC Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartQC(grn)}
                          className="p-1.5 rounded hover:bg-green-50 transition-colors"
                          title="Start QC"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleViewGRN(grn)}
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
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

      {/* QC Dialog */}
      <Dialog open={qcDialogOpen} onOpenChange={setQcDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>QC Inspection: {selectedGRN?.grn_id}</DialogTitle>
            <DialogDescription>
              Enter accepted and rejected quantities for each item
            </DialogDescription>
          </DialogHeader>

          <SummaryBanner summary={grnSummary} />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Accepted</TableHead>
                <TableHead className="text-right">Rejected</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grnItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">
                    No items found for this GRN
                  </TableCell>
                </TableRow>
              ) : (
                grnItems.map((item) => (
                  <QCItemRow
                    key={item.grn_item_id}
                    item={item}
                    onUpdate={handleUpdateQC}
                    isSubmitting={isSubmitting}
                  />
                ))
              )}
            </TableBody>
          </Table>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setQcDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleFinalApprove}
              disabled={isSubmitting || !allItemsQCCompleted}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Approve & Update Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>GRN Details: {selectedGRN?.grn_id}</DialogTitle>
          </DialogHeader>

          <SummaryBanner summary={grnSummary} />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Accepted</TableHead>
                <TableHead className="text-right">Rejected</TableHead>
                <TableHead>QC Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grnItems.map((item) => (
                <TableRow key={item.grn_item_id}>
                  <TableCell className="text-sm font-medium">
                    {item.product?.product_name ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">{item.received_quantity ?? 0}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {item.accepted_quantity ?? 0}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {item.rejected_quantity ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.qc_status === "Completed" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {item.qc_status ?? "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── QC Item Row ─────────────────────────────────────────────────────────────
function QCItemRow({ item, onUpdate, isSubmitting }) {
  const [acceptedQty, setAcceptedQty] = useState(item.accepted_quantity ?? 0);
  const [rejectedQty, setRejectedQty] = useState(item.rejected_quantity ?? 0);

  const handleSave = () => {
    const received = item.received_quantity ?? 0;
    if (acceptedQty + rejectedQty > received) {
      alert(`Accepted + Rejected (${acceptedQty + rejectedQty}) cannot exceed Received (${received})`);
      return;
    }
    onUpdate(item.grn_item_id, acceptedQty, rejectedQty);
  };

  const completed = item.qc_status === "Completed";

  return (
    <TableRow>
      <TableCell className="text-sm font-medium">
        {item.product?.product_name ?? "-"}
      </TableCell>
      <TableCell className="text-right">{item.received_quantity ?? 0}</TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          min="0"
          max={item.received_quantity ?? 0}
          value={acceptedQty}
          onChange={(e) => setAcceptedQty(parseInt(e.target.value) || 0)}
          className="w-24 text-right"
          disabled={completed}
        />
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          min="0"
          max={item.received_quantity ?? 0}
          value={rejectedQty}
          onChange={(e) => setRejectedQty(parseInt(e.target.value) || 0)}
          className="w-24 text-right"
          disabled={completed}
        />
      </TableCell>
      <TableCell className="text-center">
        {completed ? (
          <Badge variant="secondary">Completed</Badge>
        ) : (
          <Button size="sm" variant="outline" onClick={handleSave} disabled={isSubmitting}>
            Save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}