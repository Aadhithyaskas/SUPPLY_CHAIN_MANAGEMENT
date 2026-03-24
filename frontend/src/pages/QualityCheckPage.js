import { useState, useEffect, useCallback } from "react";
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
  qcUpdateGRNItem,
  approveGRN,
  getGRNSummary,
} from "../services/apiService";

// Improved toArray function to handle different response formats
const toArray = (res, knownKey = null) => {
  if (!res) return [];
  
  // If it's already an array, return it
  if (Array.isArray(res)) return res;
  
  // If we know the key where the array lives
  if (knownKey && Array.isArray(res[knownKey])) return res[knownKey];
  
  // Check for common response patterns
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.results)) return res.results;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.grns)) return res.grns;
  
  // If none of the above, try to find the first array in the object
  for (const key in res) {
    if (Array.isArray(res[key])) {
      return res[key];
    }
  }
  
  return [];
};

const matchesSearch = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

export default function QualityCheckPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [pendingGRNs, setPendingGRNs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [grnItems, setGrnItems] = useState([]);
  const [grnSummary, setGrnSummary] = useState(null);
  const [qcDialogOpen, setQcDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPendingGRNs = useCallback(async () => {
    console.log("Loading pending GRNs...");
    setIsLoading(true);
    setError(null);
    try {
      const response = await getQCPendingGRNs();
      console.log("Raw API response:", response);
      
      // GRNQCPendingListView returns array directly with GRNReadSerializer
      // The response should be an array of GRNs
      let grns = [];
      if (Array.isArray(response)) {
        grns = response;
      } else if (response && typeof response === 'object') {
        // Handle wrapped responses
        grns = response.data || response.results || response.grns || [];
        if (!Array.isArray(grns)) {
          grns = Object.values(response).find(val => Array.isArray(val)) || [];
        }
      }
      
      console.log("Processed GRNs:", grns);
      setPendingGRNs(grns);
      
      if (grns.length === 0) {
        console.log("No pending GRNs found");
      }
    } catch (error) {
      console.error("Failed to load pending GRNs:", error);
      setError(error.message || "Failed to load pending QC GRNs.");
      toast({ 
        title: "Error", 
        description: error.message || "Failed to load pending QC GRNs.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
      console.log("Loading complete");
    }
  }, [toast]);

  useEffect(() => {
    loadPendingGRNs();
  }, [loadPendingGRNs]);

  const loadGRNDetails = async (grn) => {
    console.log("Loading GRN details for:", grn.grn_id);
    try {
      // Get GRN items
      let items = [];
      try {
        const itemsResponse = await getGRNItems(grn.grn_id);
        console.log("Items response:", itemsResponse);
        
        if (Array.isArray(itemsResponse)) {
          items = itemsResponse;
        } else if (itemsResponse && typeof itemsResponse === 'object') {
          items = itemsResponse.data || itemsResponse.results || itemsResponse.items || [];
          if (!Array.isArray(items)) {
            items = Object.values(itemsResponse).find(val => Array.isArray(val)) || [];
          }
        }
      } catch (error) {
        console.error("Error loading items:", error);
        items = [];
      }
      
      // Get GRN summary
      let summary = null;
      try {
        const summaryResponse = await getGRNSummary(grn.grn_id);
        console.log("Summary response:", summaryResponse);
        summary = summaryResponse || null;
      } catch (error) {
        console.error("Error loading summary:", error);
        summary = null;
      }
      
      console.log("Loaded items:", items.length);
      console.log("Loaded summary:", summary);
      
      return { items, summary };
    } catch (error) {
      console.error("Error loading GRN details:", error);
      throw error;
    }
  };

  const handleStartQC = async (grn) => {
    console.log("Starting QC for GRN:", grn.grn_id);
    setIsLoading(true);
    try {
      const { items, summary } = await loadGRNDetails(grn);
      setSelectedGRN(grn);
      setGrnItems(items);
      setGrnSummary(summary);
      setQcDialogOpen(true);
    } catch (error) {
      console.error("Failed to load GRN details:", error);
      toast({ 
        title: "Error", 
        description: "Failed to load GRN details.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewGRN = async (grn) => {
    console.log("Viewing GRN:", grn.grn_id);
    setIsLoading(true);
    try {
      const { items, summary } = await loadGRNDetails(grn);
      setSelectedGRN(grn);
      setGrnItems(items);
      setGrnSummary(summary);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Failed to load GRN details:", error);
      toast({ 
        title: "Error", 
        description: "Failed to load GRN details.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQC = async (itemId, acceptedQty, rejectedQty) => {
    console.log("Updating QC for item:", itemId, { acceptedQty, rejectedQty });
    setIsSubmitting(true);
    try {
      await qcUpdateGRNItem(itemId, {
        accepted_quantity: acceptedQty,
        rejected_quantity: rejectedQty,
      });
      console.log("QC update successful");
      
      // Refresh items after update
      const { items, summary } = await loadGRNDetails(selectedGRN);
      setGrnItems(items);
      setGrnSummary(summary);
      toast({ title: "Success", description: "QC updated successfully." });
    } catch (error) {
      console.error("Failed to update QC:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update QC.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalApprove = async () => {
    console.log("Final approving GRN:", selectedGRN?.grn_id);
    setIsSubmitting(true);
    try {
      await approveGRN(selectedGRN.grn_id);
      console.log("GRN approved successfully");
      toast({ 
        title: "Success", 
        description: "GRN approved and inventory updated." 
      });
      setQcDialogOpen(false);
      await loadPendingGRNs(); // Refresh the list
    } catch (error) {
      console.error("Failed to approve GRN:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to approve GRN.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allItemsQCd = grnItems.length > 0 &&
    grnItems.every((item) => item.qc_status === "Completed");
  const pendingCount = grnItems.filter((i) => i.qc_status !== "Completed").length;

  const q = search.toLowerCase();
  const filtered = pendingGRNs.filter(
    (grn) =>
      matchesSearch(grn.grn_id, q) ||
      matchesSearch(grn.po_id, q) ||
      matchesSearch(grn.grn_number, q)
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

  // Show loading state
  if (isLoading && pendingGRNs.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Check</h1>
          <p className="text-sm text-gray-500 mt-1">
            Inspect received goods and update acceptance/rejection quantities
          </p>
        </div>
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading pending GRNs...</p>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Check</h1>
          <p className="text-sm text-gray-500 mt-1">
            Inspect received goods and update acceptance/rejection quantities
          </p>
        </div>
        <Card className="p-8 text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={loadPendingGRNs}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quality Check</h1>
        <p className="text-sm text-gray-500 mt-1">
          Inspect received goods and update acceptance/rejection quantities
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search GRN, PO or GRN number..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={loadPendingGRNs}
          disabled={isLoading}
          size="sm"
        >
          Refresh
        </Button>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">GRN ID</TableHead>
                <TableHead className="text-xs font-semibold">GRN Number</TableHead>
                <TableHead className="text-xs font-semibold">PO Reference</TableHead>
                <TableHead className="text-xs font-semibold">Receipt Date</TableHead>
                <TableHead className="text-xs font-semibold">Received By</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading GRNs...</p>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {pendingGRNs.length === 0 
                      ? "No pending QC GRNs found" 
                      : "No matching GRNs found"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((grn) => (
                  <TableRow key={grn.grn_id}>
                    <TableCell className="text-xs font-mono font-bold text-primary">
                      {grn.grn_id}
                    </TableCell>
                    <TableCell className="text-xs">{grn.grn_number || "-"}</TableCell>
                    <TableCell className="text-xs font-mono">{grn.po_id || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {grn.receipt_date ? new Date(grn.receipt_date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-xs">{grn.received_by_username || "-"}</TableCell>
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
              Save each item individually, then click Approve when all are done.
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
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    <p className="mt-2">Loading items...</p>
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
            <Button variant="outline" onClick={() => setQcDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleFinalApprove}
              disabled={isSubmitting || !allItemsQCd}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {allItemsQCd
                ? "Approve & Update Inventory"
                : `Approve (${pendingCount} item${pendingCount !== 1 ? "s" : ""} pending)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>GRN Details: {selectedGRN?.grn_id}</DialogTitle>
            <DialogDescription>
              Complete details of the Goods Received Note including all items and QC status.
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
                <TableHead>QC Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grnItems.map((item) => (
                <TableRow key={item.grn_item_id}>
                  <TableCell className="text-sm font-medium">
                    {item.product_name ?? "-"}
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
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// QC Item Row Component
function QCItemRow({ item, onUpdate, isSubmitting }) {
  const [acceptedQty, setAcceptedQty] = useState(item.accepted_quantity ?? 0);
  const [rejectedQty, setRejectedQty] = useState(item.rejected_quantity ?? 0);

  const received = item.received_quantity ?? 0;
  const isOverLimit = acceptedQty + rejectedQty > received;
  const completed = item.qc_status === "Completed";

  const handleSave = () => {
    if (isOverLimit) return;
    onUpdate(item.grn_item_id, acceptedQty, rejectedQty);
  };

  return (
    <TableRow>
      <TableCell className="text-sm font-medium">{item.product_name ?? "-"}</TableCell>
      <TableCell className="text-right">{received}</TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          min="0"
          max={received}
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
          max={received}
          value={rejectedQty}
          onChange={(e) => setRejectedQty(parseInt(e.target.value) || 0)}
          className={`w-24 text-right ${isOverLimit ? "border-red-400" : ""}`}
          disabled={completed}
        />
        {isOverLimit && (
          <p className="text-xs text-red-500 mt-1">Exceeds received ({received})</p>
        )}
      </TableCell>
      <TableCell className="text-center">
        {completed ? (
          <Badge variant="secondary">Completed</Badge>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSubmitting || isOverLimit}
          >
            Save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}