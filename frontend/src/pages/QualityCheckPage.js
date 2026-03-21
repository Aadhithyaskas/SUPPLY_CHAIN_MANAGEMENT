import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Search, CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
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
      setPendingGRNs(data);
    } catch (error) {
      console.error("Failed to load pending GRNs:", error);
      toast({
        title: "Error",
        description: "Failed to load pending QC GRNs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQC = async (grn) => {
    setIsLoading(true);
    try {
      const [items, summary] = await Promise.all([
        getGRNItems(grn.grn_id),
        getGRNSummary(grn.grn_id),
      ]);
      setSelectedGRN(grn);
      setGrnItems(items);
      setGrnSummary(summary);
      setQcDialogOpen(true);
    } catch (error) {
      console.error("Failed to load GRN details:", error);
      toast({
        title: "Error",
        description: "Failed to load GRN details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewGRN = async (grn) => {
    setIsLoading(true);
    try {
      const [items, summary] = await Promise.all([
        getGRNItems(grn.grn_id),
        getGRNSummary(grn.grn_id),
      ]);
      setSelectedGRN(grn);
      setGrnItems(items);
      setGrnSummary(summary);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Failed to load GRN details:", error);
      toast({
        title: "Error",
        description: "Failed to load GRN details.",
        variant: "destructive",
      });
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
      
      // Refresh items
      const items = await getGRNItems(selectedGRN.grn_id);
      const summary = await getGRNSummary(selectedGRN.grn_id);
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

  const filtered = pendingGRNs.filter((grn) =>
    grn.grn_id?.toLowerCase().includes(search.toLowerCase()) ||
    grn.po?.po_id?.toLowerCase().includes(search.toLowerCase())
  );

  const allItemsQCCompleted = grnItems.every(
    item => item.accepted_quantity > 0 || item.rejected_quantity > 0
  );

  return (
    <AppLayout title="Quality Check">
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
                        {grn.items?.length || 0}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {grn.receipt_date ? new Date(grn.receipt_date).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="warning" className="text-xs uppercase">
                          QC Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartQC(grn)}
                            className="p-1.5 rounded hover:bg-success/10 transition-colors"
                            title="Start QC"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-success" />
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
      </div>

      {/* QC Dialog */}
      <Dialog open={qcDialogOpen} onOpenChange={setQcDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>QC Inspection: {selectedGRN?.grn_id}</DialogTitle>
            <DialogDescription>
              Enter accepted and rejected quantities for each item
            </DialogDescription>
          </DialogHeader>

          {grnSummary && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Received</p>
                <p className="text-lg font-bold">{grnSummary.received}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Accepted</p>
                <p className="text-lg font-bold text-success">{grnSummary.accepted}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-lg font-bold text-destructive">{grnSummary.rejected}</p>
              </div>
            </div>
          )}

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
              {grnItems.map((item) => (
                <QCItemRow
                  key={item.grn_item_id}
                  item={item}
                  onUpdate={handleUpdateQC}
                  isSubmitting={isSubmitting}
                />
              ))}
            </TableBody>
          </Table>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setQcDialogOpen(false)}>
              Cancel
            </Button>
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

          {grnSummary && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Received</p>
                <p className="text-lg font-bold">{grnSummary.received}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Accepted</p>
                <p className="text-lg font-bold text-success">{grnSummary.accepted}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-lg font-bold text-destructive">{grnSummary.rejected}</p>
              </div>
            </div>
          )}

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
                    {item.product?.product_name}
                  </TableCell>
                  <TableCell className="text-right">{item.received_quantity}</TableCell>
                  <TableCell className="text-right text-success">
                    {item.accepted_quantity || 0}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {item.rejected_quantity || 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.qc_status === "Completed" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {item.qc_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

// QC Item Row Component
function QCItemRow({ item, onUpdate, isSubmitting }) {
  const [acceptedQty, setAcceptedQty] = useState(item.accepted_quantity || 0);
  const [rejectedQty, setRejectedQty] = useState(item.rejected_quantity || 0);

  const handleSave = () => {
    if (acceptedQty + rejectedQty > item.received_quantity) {
      alert("Accepted + Rejected cannot exceed Received quantity");
      return;
    }
    onUpdate(item.grn_item_id, acceptedQty, rejectedQty);
  };

  return (
    <TableRow>
      <TableCell className="text-sm font-medium">{item.product?.product_name}</TableCell>
      <TableCell className="text-right">{item.received_quantity}</TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          min="0"
          max={item.received_quantity}
          value={acceptedQty}
          onChange={(e) => setAcceptedQty(parseInt(e.target.value) || 0)}
          className="w-24 text-right"
          disabled={item.qc_status === "Completed"}
        />
      </TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          min="0"
          max={item.received_quantity}
          value={rejectedQty}
          onChange={(e) => setRejectedQty(parseInt(e.target.value) || 0)}
          className="w-24 text-right"
          disabled={item.qc_status === "Completed"}
        />
      </TableCell>
      <TableCell className="text-center">
        {item.qc_status !== "Completed" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            Save
          </Button>
        )}
        {item.qc_status === "Completed" && (
          <Badge variant="secondary">Completed</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}