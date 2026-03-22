import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Eye, CheckCircle, Loader2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useAuth } from "../components/lib/auth-context";
import {
  listGRNs,
  getGRN,
  getGRNItems,
  updateGRNItem,
  approveGRN,
  getQCPendingGRNs,
  getMyGRNs,
  getGRNSummary,
  listASN,
  listPurchaseOrders,
} from "../services/apiService";
import { useToast } from "../components/ui/use-toast";

const statusMap = {
  RECEIVED: { label: "Received", variant: "outline" },
  QC_PENDING: { label: "QC Pending", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "secondary" },
};

export default function GRNPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [grns, setGrns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [qcDialogOpen, setQcDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [grnItems, setGrnItems] = useState([]);
  const [grnSummary, setGrnSummary] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [asnList, setAsnList] = useState([]);
  const [poList, setPoList] = useState([]);
  const [newGRN, setNewGRN] = useState({
    po_id: "",
    asn_id: "",
    receipt_date: "",
  });

  const isSupervisor = ["supervisor", "admin"].includes(user?.role);
  const isQC = ["quality_checker", "admin"].includes(user?.role);

  useEffect(() => {
    loadGRNs();
    loadASNs();
    loadPOs();
  }, []);

  const loadGRNs = async () => {
    setIsLoading(true);
    try {
      let data;
      if (isSupervisor) {
        data = await getMyGRNs();
        data = data.data || [];
      } else if (isQC) {
        data = await getQCPendingGRNs();
      } else {
        data = await listGRNs();
      }
      setGrns(data);
    } catch (error) {
      console.error("Failed to load GRNs:", error);
      toast({
        title: "Error",
        description: "Failed to load GRNs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadASNs = async () => {
    try {
      const data = await listASN();
      setAsnList(data);
    } catch (error) {
      console.error("Failed to load ASNs:", error);
    }
  };

  const loadPOs = async () => {
    try {
      const data = await listPurchaseOrders();
      setPoList(data);
    } catch (error) {
      console.error("Failed to load POs:", error);
    }
  };

  const handleViewGRN = async (grnId) => {
    setIsLoading(true);
    try {
      const grn = await getGRN(grnId);
      const items = await getGRNItems(grnId);
      const summary = await getGRNSummary(grnId);
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

  const handleQCApprove = (grn) => {
    setSelectedGRN(grn);
    setQcDialogOpen(true);
  };

  const handleQCUpdate = async (grnItemId, acceptedQty, rejectedQty) => {
    setIsSubmitting(true);
    try {
      await updateGRNItem(grnItemId, {
        accepted_quantity: acceptedQty,
        rejected_quantity: rejectedQty,
      });
      toast({
        title: "Success",
        description: "QC updated successfully.",
      });
      // Refresh items
      const items = await getGRNItems(selectedGRN.grn_id);
      setGrnItems(items);
    } catch (error) {
      console.error("Failed to update QC:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update QC.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveGRN(selectedGRN.grn_id);
      toast({
        title: "Success",
        description: "GRN approved and inventory updated.",
      });
      setQcDialogOpen(false);
      loadGRNs();
    } catch (error) {
      console.error("Failed to approve GRN:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve GRN.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGRN = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create GRN via supervisor endpoint
      toast({
        title: "Info",
        description: "Create GRN endpoint coming soon.",
      });
      setCreateDialogOpen(false);
      loadGRNs();
    } catch (error) {
      console.error("Failed to create GRN:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create GRN.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGRNs = grns.filter(
    (grn) =>
      grn.grn_id?.toLowerCase().includes(search.toLowerCase()) ||
      grn.po?.po_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Goods Received Notes</h1>
        <p className="text-sm text-gray-500 mt-1">Manage goods receipts and quality control</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search GRN or PO..."
            className="pl-9 h-9 border-gray-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isSupervisor && (
          <Button size="sm" className="h-9 bg-[#1E3A8A] hover:bg-[#1E293B]" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> New GRN Entry
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-600">GRN Number</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">PO Reference</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">ASN Reference</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Receipt Date</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Received By</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Status</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1E3A8A]" />
                  </TableCell>
                </TableRow>
              ) : filteredGRNs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No GRNs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGRNs.map((grn) => (
                  <TableRow key={grn.grn_id} className="hover:bg-gray-50">
                    <TableCell className="text-xs font-mono font-bold text-[#1E3A8A]">
                      {grn.grn_id}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-gray-600">{grn.po?.po_id || "-"}</TableCell>
                    <TableCell className="text-xs font-mono text-gray-500">
                      {grn.asn?.asn_id || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {grn.receipt_date ? new Date(grn.receipt_date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {grn.received_by?.username || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusMap[grn.status]?.variant || "outline"}
                        className="text-xs uppercase"
                      >
                        {statusMap[grn.status]?.label || grn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewGRN(grn.grn_id)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        {isQC && grn.status === "QC_PENDING" && (
                          <button
                            onClick={() => handleQCApprove(grn)}
                            className="p-1.5 rounded hover:bg-green-50 transition-colors"
                            title="QC Approve"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View GRN Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>GRN Details: {selectedGRN?.grn_id}</DialogTitle>
            <DialogDescription>
              PO: {selectedGRN?.po?.po_id} | Status: {selectedGRN?.status}
            </DialogDescription>
          </DialogHeader>

          {grnSummary && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
              <div>
                <p className="text-xs text-gray-500">Total Received</p>
                <p className="text-lg font-bold text-gray-900">{grnSummary.received}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Accepted</p>
                <p className="text-lg font-bold text-green-600">{grnSummary.accepted}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rejected</p>
                <p className="text-lg font-bold text-red-600">{grnSummary.rejected}</p>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-600">Product</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Received</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Accepted</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Rejected</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">QC Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grnItems.map((item) => (
                <TableRow key={item.grn_item_id}>
                  <TableCell className="text-sm font-medium text-gray-900">
                    {item.product?.product_name}
                  </TableCell>
                  <TableCell className="text-right text-gray-700">{item.received_quantity}</TableCell>
                  <TableCell className="text-right text-green-600">{item.accepted_quantity || 0}</TableCell>
                  <TableCell className="text-right text-red-600">{item.rejected_quantity || 0}</TableCell>
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

      {/* QC Approval Dialog */}
      <Dialog open={qcDialogOpen} onOpenChange={setQcDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>QC Approval: {selectedGRN?.grn_id}</DialogTitle>
            <DialogDescription>
              Update accepted and rejected quantities for each item.
            </DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-600">Product</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Received</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Accepted</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Rejected</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grnItems.map((item) => (
                <QCItemRow
                  key={item.grn_item_id}
                  item={item}
                  onUpdate={handleQCUpdate}
                  isSubmitting={isSubmitting}
                />
              ))}
            </TableBody>
          </Table>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setQcDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinalApprove} disabled={isSubmitting} className="bg-[#1E3A8A] hover:bg-[#1E293B]">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Final Approve & Update Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create GRN Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateGRN}>
            <DialogHeader>
              <DialogTitle>Create New GRN</DialogTitle>
              <DialogDescription>
                Select PO and ASN to create a Goods Received Note.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-700">Purchase Order</Label>
                <Select
                  value={newGRN.po_id}
                  onValueChange={(value) => setNewGRN({ ...newGRN, po_id: value })}
                  required
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select PO" />
                  </SelectTrigger>
                  <SelectContent>
                    {poList.map((po) => (
                      <SelectItem key={po.po_id} value={po.po_id}>
                        {po.po_id} - ₹{po.total_amount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-700">ASN (Optional)</Label>
                <Select
                  value={newGRN.asn_id}
                  onValueChange={(value) => setNewGRN({ ...newGRN, asn_id: value })}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select ASN" />
                  </SelectTrigger>
                  <SelectContent>
                    {asnList.map((asn) => (
                      <SelectItem key={asn.asn_id} value={asn.asn_id}>
                        {asn.asn_id} - {asn.vendor?.vendor_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-700">Receipt Date</Label>
                <Input
                  type="date"
                  value={newGRN.receipt_date}
                  onChange={(e) => setNewGRN({ ...newGRN, receipt_date: e.target.value })}
                  required
                  className="border-gray-200"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#1E3A8A] hover:bg-[#1E293B]">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create GRN
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
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
      <TableCell className="text-sm font-medium text-gray-900">{item.product?.product_name}</TableCell>
      <TableCell className="text-right text-gray-700">{item.received_quantity}</TableCell>
      <TableCell className="text-right">
        <Input
          type="number"
          min="0"
          max={item.received_quantity}
          value={acceptedQty}
          onChange={(e) => setAcceptedQty(parseInt(e.target.value) || 0)}
          className="w-24 text-right border-gray-200"
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
          className="w-24 text-right border-gray-200"
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
            className="border-gray-200"
          >
            Save
          </Button>
        )}
        {item.qc_status === "Completed" && (
          <Badge variant="secondary" className="text-xs">
            Completed
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}