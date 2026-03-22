import { useState, useEffect } from "react";
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
  createPurchaseRequest,
  managerApprovePR,
  financeApprovePR,
  listProducts,
  listVendors,
} from "../services/apiService";
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

// Safe search: coerces any value type to string before matching
const matchesSearch = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

const STATUS_MAP = {
  Pending:           { label: "Pending",          variant: "outline" },
  "Manager Approved":{ label: "Manager Approved", variant: "default" },
  "Finance Pending": { label: "Finance Review",   variant: "warning" },
  Approved:          { label: "Approved",         variant: "secondary" },
  Rejected:          { label: "Rejected",         variant: "destructive" },
};

const EMPTY_PR = {
  product_id: "",
  vendor_id: "",
  requested_quantity: "",
};

// ✅ No <AppLayout> — layout is provided by the router via <Outlet>
export default function PurchaseRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [prs, setPrs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [newPR, setNewPR] = useState(EMPTY_PR);

  const isManager = ["manager", "admin"].includes(user?.role);
  const isFinance  = ["finance_director", "admin"].includes(user?.role);

  useEffect(() => {
    loadPRs();
    loadProducts();
    loadVendors();
  }, []);

  const loadPRs = async () => {
    setIsLoading(true);
    try {
      const data = await listPurchaseRequests();
      // ✅ FIX: response may be { results: [...] } or bare array
      setPrs(toArray(data));
    } catch (error) {
      console.error("Failed to load purchase requests:", error);
      toast({ title: "Error", description: "Failed to load purchase requests.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await listProducts();
      setProducts(toArray(data, "products"));
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await listVendors();
      // ✅ FIX: listVendors may return envelope object
      setVendors(toArray(data, "vendors"));
    } catch (error) {
      console.error("Failed to load vendors:", error);
    }
  };

  const handleApprove = (pr) => { setSelectedPR(pr); setActionType("approve"); setDialogOpen(true); };
  const handleReject  = (pr) => { setSelectedPR(pr); setActionType("reject");  setDialogOpen(true); };

  const handleConfirmAction = async () => {
    setIsSubmitting(true);
    try {
      if (actionType === "approve") {
        if (selectedPR.status === "Finance Pending" && isFinance) {
          await financeApprovePR(selectedPR.pr_id);
          toast({ title: "Success", description: "PR approved by Finance. PO created." });
        } else if (isManager) {
          await managerApprovePR(selectedPR.pr_id);
          const msg = selectedPR.total_amount > 5000 && !isFinance
            ? "PR approved. Awaiting Finance Director approval."
            : "PR approved and PO created.";
          toast({ title: "Success", description: msg });
        } else {
          toast({ title: "Error", description: "You don't have permission to approve this PR.", variant: "destructive" });
          setDialogOpen(false);
          return;
        }
        loadPRs();
      } else {
        // Reject placeholder — backend endpoint not yet implemented
        toast({ title: "Info", description: "Reject functionality coming soon." });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Action failed:", error);
      toast({ title: "Error", description: error.message || "Action failed.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePR = async (e) => {
    e.preventDefault();
    if (!newPR.product_id || !newPR.vendor_id || !newPR.requested_quantity) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ FIX: was a placeholder toast — now actually calls the API
      // Find product to compute total_amount client-side (backend may do this too)
      const product = products.find((p) => String(p.product_id) === String(newPR.product_id));
      const payload = {
        product_id:         newPR.product_id,
        vendor_id:          newPR.vendor_id,
        requested_quantity: parseInt(newPR.requested_quantity),
        // total_amount included if product found; backend should compute it authoritatively
        ...(product ? { total_amount: parseInt(newPR.requested_quantity) * (product.unit_price ?? 0) } : {}),
      };

      await createPurchaseRequest(payload);
      toast({ title: "Success", description: "Purchase request created successfully." });
      setCreateDialogOpen(false);
      setNewPR(EMPTY_PR);
      loadPRs();
    } catch (error) {
      console.error("Failed to create PR:", error);
      toast({ title: "Error", description: error.message || "Failed to create purchase request.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canApprove = (pr) => {
    if (pr.status === "Pending" && isManager) return true;
    if (pr.status === "Finance Pending" && isFinance) return true;
    return false;
  };

  const q = search.toLowerCase();
  // ✅ FIX: pr_id is an integer from Django — use matchesSearch for safe coercion
  const filteredPRs = prs.filter(
    (pr) =>
      matchesSearch(pr.pr_id, q) ||
      matchesSearch(pr.product?.product_name, q)
  );

  return (
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
        <Button size="sm" className="h-9" onClick={() => { setNewPR(EMPTY_PR); setCreateDialogOpen(true); }}>
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
                      {(pr.requested_quantity ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-right tabular-nums font-medium">
                      ₹{(pr.total_amount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">{pr.vendor?.vendor_name || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {pr.created_at ? new Date(pr.created_at).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={STATUS_MAP[pr.status]?.variant || "outline"}
                        className="text-xs"
                      >
                        {STATUS_MAP[pr.status]?.label || pr.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canApprove(pr) && (
                          <>
                            <button onClick={() => handleApprove(pr)}
                              className="p-1.5 rounded hover:bg-green-50 transition-colors" title="Approve">
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            </button>
                            <button onClick={() => handleReject(pr)}
                              className="p-1.5 rounded hover:bg-destructive/10 transition-colors" title="Reject">
                              <X className="w-3.5 h-3.5 text-destructive" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 rounded hover:bg-muted transition-colors" title="View Details">
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

      {/* Approval / Rejection Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Purchase Request" : "Reject Purchase Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? selectedPR?.total_amount > 5000 && isManager && !isFinance
                  ? `This PR requires Finance Director approval. Total: ₹${(selectedPR?.total_amount ?? 0).toLocaleString()}`
                  : `Are you sure you want to approve PR #${selectedPR?.pr_id}?`
                : `Are you sure you want to reject PR #${selectedPR?.pr_id}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
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
                <Select value={newPR.product_id}
                  onValueChange={(v) => setNewPR({ ...newPR, product_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      // ✅ FIX: coerce to string for shadcn Select value matching
                      <SelectItem key={p.product_id} value={String(p.product_id)}>
                        {p.product_name} — ₹{(p.unit_price ?? 0).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Vendor</Label>
                <Select value={newPR.vendor_id}
                  onValueChange={(v) => setNewPR({ ...newPR, vendor_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      // ✅ FIX: coerce to string
                      <SelectItem key={v.vendor_id} value={String(v.vendor_id)}>
                        {v.vendor_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Requested Quantity</Label>
                <Input type="number" min="1" value={newPR.requested_quantity}
                  onChange={(e) => setNewPR({ ...newPR, requested_quantity: e.target.value })} required />
              </div>
              {/* Show computed total if product selected */}
              {newPR.product_id && newPR.requested_quantity && (() => {
                const p = products.find((p) => String(p.product_id) === String(newPR.product_id));
                if (!p) return null;
                const total = parseInt(newPR.requested_quantity) * (p.unit_price ?? 0);
                return (
                  <p className="text-xs text-muted-foreground">
                    Estimated total: <span className="font-medium text-foreground">₹{total.toLocaleString()}</span>
                    {total > 5000 && <span className="ml-2 text-yellow-600">(Requires Finance approval)</span>}
                  </p>
                );
              })()}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create PR
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}