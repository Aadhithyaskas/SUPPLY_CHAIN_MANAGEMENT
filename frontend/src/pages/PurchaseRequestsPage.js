import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Check, X, Loader2, Eye } from "lucide-react";
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
  listPurchaseRequests,
  managerApprovePR,
  financeApprovePR,
  listProducts,
  listVendors,
} from "../services/apiService";
import { useToast } from "../components/ui/use-toast";

const statusMap = {
  Pending: { label: "Pending", variant: "outline" },
  "Manager Approved": { label: "Manager Approved", variant: "default" },
  "Finance Pending": { label: "Finance Review", variant: "warning" },
  Approved: { label: "Approved", variant: "secondary" },
  Rejected: { label: "Rejected", variant: "destructive" },
};

export default function PurchaseRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [prs, setPrs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [actionType, setActionType] = useState(null); // approve or reject
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [newPR, setNewPR] = useState({
    product_id: "",
    vendor_id: "",
    requested_quantity: "",
  });

  const isManager = ["manager", "admin"].includes(user?.role);
  const isFinance = ["finance_director", "admin"].includes(user?.role);

  useEffect(() => {
    loadPRs();
    loadProducts();
    loadVendors();
  }, []);

  const loadPRs = async () => {
    setIsLoading(true);
    try {
      const data = await listPurchaseRequests();
      setPrs(data);
    } catch (error) {
      console.error("Failed to load purchase requests:", error);
      toast({
        title: "Error",
        description: "Failed to load purchase requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await listProducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await listVendors();
      setVendors(data);
    } catch (error) {
      console.error("Failed to load vendors:", error);
    }
  };

  const handleApprove = (pr) => {
    setSelectedPR(pr);
    setActionType("approve");
    setDialogOpen(true);
  };

  const handleReject = (pr) => {
    setSelectedPR(pr);
    setActionType("reject");
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    setIsSubmitting(true);
    try {
      if (actionType === "approve") {
        // Check if PR needs finance approval
        if (selectedPR.total_amount > 5000 && !isFinance && isManager) {
          // Manager approval for high-value PR
          await managerApprovePR(selectedPR.pr_id);
          toast({
            title: "Success",
            description: "PR approved. Awaiting Finance Director approval.",
          });
        } else if (selectedPR.total_amount <= 5000 && isManager) {
          // Manager approves low-value PR
          await managerApprovePR(selectedPR.pr_id);
          toast({
            title: "Success",
            description: "PR approved and PO created.",
          });
        } else if (selectedPR.status === "Finance Pending" && isFinance) {
          // Finance approves
          await financeApprovePR(selectedPR.pr_id);
          toast({
            title: "Success",
            description: "PR approved by Finance. PO created.",
          });
        } else {
          toast({
            title: "Error",
            description: "You don't have permission to approve this PR.",
            variant: "destructive",
          });
          setDialogOpen(false);
          return;
        }
        loadPRs();
      } else if (actionType === "reject") {
        // Reject PR (update status to Rejected)
        // Note: Your backend doesn't have a reject endpoint yet
        // This would need to be implemented
        toast({
          title: "Info",
          description: "Reject functionality coming soon.",
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Action failed:", error);
      toast({
        title: "Error",
        description: error.message || "Action failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePR = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const product = products.find((p) => p.product_id === newPR.product_id);
      const vendor = vendors.find((v) => v.vendor_id === newPR.vendor_id);
      const total_amount = newPR.requested_quantity * product.unit_price;

      // Note: Your backend needs a create PR endpoint
      // This is a placeholder until the endpoint is implemented
      toast({
        title: "Info",
        description: "Create PR endpoint coming soon. Use admin panel for now.",
      });
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create PR:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPRs = prs.filter(
    (pr) =>
      pr.pr_id?.toLowerCase().includes(search.toLowerCase()) ||
      pr.product?.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  const canApprove = (pr) => {
    if (pr.status === "Pending" && isManager) return true;
    if (pr.status === "Finance Pending" && isFinance) return true;
    return false;
  };

  return (
    <AppLayout title="Purchase Requests">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search PRs..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" className="h-9" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Create PR
          </Button>
        </div>

        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">PR ID</TableHead>
                  <TableHead className="text-xs font-semibold">Product</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Qty</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-semibold">Vendor</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredPRs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No purchase requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPRs.map((pr) => (
                    <TableRow key={pr.pr_id}>
                      <TableCell className="text-xs font-mono font-medium">{pr.pr_id}</TableCell>
                      <TableCell className="text-sm">{pr.product?.product_name || "-"}</TableCell>
                      <TableCell className="text-sm text-right tabular-nums">
                        {pr.requested_quantity?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-right tabular-nums font-medium">
                        ₹{pr.total_amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs">{pr.vendor?.vendor_name || "-"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {pr.created_at ? new Date(pr.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusMap[pr.status]?.variant || "outline"}
                          className="text-xs"
                        >
                          {statusMap[pr.status]?.label || pr.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canApprove(pr) && (
                            <>
                              <button
                                onClick={() => handleApprove(pr)}
                                className="p-1.5 rounded hover:bg-success/10 transition-colors"
                                title="Approve"
                              >
                                <Check className="w-3.5 h-3.5 text-success" />
                              </button>
                              <button
                                onClick={() => handleReject(pr)}
                                className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                                title="Reject"
                              >
                                <X className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            </>
                          )}
                          <button
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                            title="View Details"
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

      {/* Approval Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Purchase Request" : "Reject Purchase Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? selectedPR?.total_amount > 5000 && isManager && !isFinance
                  ? `This PR requires Finance Director approval. Total amount: ₹${selectedPR?.total_amount?.toLocaleString()}`
                  : `Are you sure you want to approve PR ${selectedPR?.pr_id}?`
                : `Are you sure you want to reject PR ${selectedPR?.pr_id}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleConfirmAction}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create PR Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreatePR}>
            <DialogHeader>
              <DialogTitle>Create Purchase Request</DialogTitle>
              <DialogDescription>
                Select product, vendor, and quantity to create a purchase request.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Product</Label>
                <Select
                  value={newPR.product_id}
                  onValueChange={(value) => setNewPR({ ...newPR, product_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.product_id} value={product.product_id}>
                        {product.product_name} - ₹{product.unit_price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Vendor</Label>
                <Select
                  value={newPR.vendor_id}
                  onValueChange={(value) => setNewPR({ ...newPR, vendor_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.vendor_id} value={vendor.vendor_id}>
                        {vendor.vendor_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Requested Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={newPR.requested_quantity}
                  onChange={(e) => setNewPR({ ...newPR, requested_quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create PR
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}