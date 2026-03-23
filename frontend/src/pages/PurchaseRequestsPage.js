import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Check, X, Loader2, Eye, Building2, Package, Calendar, User, Mail, Phone, MapPin, Clock, Tag, FileText } from "lucide-react";
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
  getVendor,
  getProduct,
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
  
  // Detailed view states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailPR, setDetailPR] = useState(null);
  const [detailVendor, setDetailVendor] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

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
      setVendors(toArray(data, "vendors"));
    } catch (error) {
      console.error("Failed to load vendors:", error);
    }
  };

  const handleViewDetails = async (pr) => {
    setIsLoadingDetail(true);
    setDetailDialogOpen(true);
    setDetailPR(pr);
    
    try {
      // Fetch vendor details if vendor_id exists
      if (pr.vendor_id) {
        const vendorData = await getVendor(pr.vendor_id);
        setDetailVendor(vendorData);
      } else {
        setDetailVendor(null);
      }
      
      // Fetch product details if product_id exists
      if (pr.product_id) {
        const productData = await getProduct(pr.product_id);
        setDetailProduct(productData);
      } else {
        setDetailProduct(null);
      }
    } catch (error) {
      console.error("Failed to load details:", error);
      toast({ title: "Error", description: "Failed to load detailed information.", variant: "destructive" });
    } finally {
      setIsLoadingDetail(false);
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
      const product = products.find((p) => String(p.product_id) === String(newPR.product_id));
      const payload = {
        product_id:         newPR.product_id,
        vendor_id:          newPR.vendor_id,
        requested_quantity: parseInt(newPR.requested_quantity),
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
  const filteredPRs = prs.filter(
    (pr) =>
      matchesSearch(pr.pr_id, q) ||
      matchesSearch(pr.product?.product_name, q) ||
      matchesSearch(pr.vendor?.vendor_name, q)
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Purchase Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and approve purchase requests</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search PRs..."
            className="pl-9 h-9 border-gray-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" className="h-9 bg-[#1E3A8A] hover:bg-[#1E293B]" onClick={() => { setNewPR(EMPTY_PR); setCreateDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> Create PR
        </Button>
      </div>

      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-600">PR ID</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Product</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Qty</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Vendor</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Date</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Status</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1E3A8A]" />
                  </TableCell>
                </TableRow>
              ) : filteredPRs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No purchase requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPRs.map((pr) => (
                  <TableRow key={pr.pr_id} className="hover:bg-gray-50">
                    <TableCell className="text-xs font-mono font-medium text-gray-900">{pr.pr_id}</TableCell>
                    <TableCell className="text-sm text-gray-700">{pr.product|| "-"}</TableCell>
                    <TableCell className="text-sm text-right text-gray-700">
                      {(pr.requested_quantity ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-right font-medium text-gray-900">
                      ₹{(pr.total_amount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">{pr.vendor || "-"}</TableCell>
                    <TableCell className="text-xs text-gray-500">
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
                        <button 
                          onClick={() => handleViewDetails(pr)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors" 
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        {canApprove(pr) && (
                          <>
                            <button onClick={() => handleApprove(pr)}
                              className="p-1.5 rounded hover:bg-green-50 transition-colors" title="Approve">
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            </button>
                            <button onClick={() => handleReject(pr)}
                              className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Reject">
                              <X className="w-3.5 h-3.5 text-red-600" />
                            </button>
                          </>
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

      {/* Detailed View Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Purchase Request Details
            </DialogTitle>
            <DialogDescription>
              PR #{detailPR?.pr_id} - Created on {detailPR?.created_at ? new Date(detailPR.created_at).toLocaleString() : "-"}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* PR Summary */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1E3A8A]" />
                  Request Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant={STATUS_MAP[detailPR?.status]?.variant || "outline"} className="mt-1">
                      {STATUS_MAP[detailPR?.status]?.label || detailPR?.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-lg font-bold text-gray-900">₹{(detailPR?.total_amount ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested Quantity</p>
                    <p className="text-sm font-medium text-gray-900">{detailPR?.requested_quantity} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested By</p>
                    <p className="text-sm text-gray-700">{detailPR?.created_by?.username || "System"}</p>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              {detailProduct && (
                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#1E3A8A]" />
                    Product Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Product ID / SKU</p>
                          <p className="text-sm font-mono text-gray-900">{detailProduct.product_id} / {detailProduct.sku_code}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Product Name</p>
                          <p className="text-sm font-medium text-gray-900">{detailProduct.product_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Brand</p>
                          <p className="text-sm text-gray-700">{detailProduct.brand_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="text-sm text-gray-700">{detailProduct.category}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Size / Dimensions</p>
                          <p className="text-sm text-gray-700">{detailProduct.size || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Unit Price / Reorder Level</p>
                          <p className="text-sm text-gray-700">₹{detailProduct.unit_price?.toLocaleString()} / {detailProduct.re_order} units</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Classification</p>
                          <p className="text-sm text-gray-700">ABC: {detailProduct.ABC} | VED: {detailProduct.VED} | XYZ: {detailProduct.XYZ}</p>
                        </div>
                      </div>
                      {detailProduct.description && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Description</p>
                            <p className="text-sm text-gray-600">{detailProduct.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Vendor Details */}
              {detailVendor && (
                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1E3A8A]" />
                    Vendor Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Vendor ID</p>
                          <p className="text-sm font-mono text-gray-900">{detailVendor.vendor_id}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Vendor Name</p>
                          <p className="text-sm font-medium text-gray-900">{detailVendor.vendor_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Contact Person</p>
                          <p className="text-sm text-gray-700">{detailVendor.contact_person}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm text-gray-700">{detailVendor.email || "-"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm text-gray-700">{detailVendor.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Lead Time</p>
                          <p className="text-sm text-gray-700">{detailVendor.lead_time} days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm text-gray-700">{detailVendor.address}, {detailVendor.city}, {detailVendor.state}, {detailVendor.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Timeline */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1E3A8A]" />
                  Approval Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      detailPR?.status === "Approved" ? "bg-green-500" : 
                      detailPR?.status === "Rejected" ? "bg-red-500" : 
                      detailPR?.status === "Finance Pending" ? "bg-yellow-500" :
                      detailPR?.status === "Manager Approved" ? "bg-blue-500" : "bg-gray-300"
                    }`} />
                    <p className="text-sm text-gray-700">
                      {detailPR?.status === "Pending" && "Awaiting Manager Approval"}
                      {detailPR?.status === "Manager Approved" && "Manager Approved - Under Finance Review"}
                      {detailPR?.status === "Finance Pending" && "Awaiting Finance Director Approval"}
                      {detailPR?.status === "Approved" && "Approved - Purchase Order Created"}
                      {detailPR?.status === "Rejected" && "Request Rejected"}
                    </p>
                  </div>
                  {detailPR?.total_amount > 5000 && detailPR?.status !== "Approved" && detailPR?.status !== "Rejected" && (
                    <div className="flex items-center gap-3 pl-4 border-l-2 border-yellow-400">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <p className="text-sm text-yellow-700">High-value request (₹{(detailPR.total_amount).toLocaleString()}) requires Finance Director approval</p>
                    </div>
                  )}
                  {detailPR?.status === "Approved" && (
                    <div className="flex items-center gap-3 pl-4 border-l-2 border-green-400">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-sm text-green-700">Purchase Order has been created and email sent to vendor</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              className={actionType === "approve" ? "bg-[#1E3A8A] hover:bg-[#1E293B]" : ""}
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
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
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
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
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
                  onChange={(e) => setNewPR({ ...newPR, requested_quantity: e.target.value })} required 
                  className="border-gray-200" />
              </div>
              {newPR.product_id && newPR.requested_quantity && (() => {
                const p = products.find((p) => String(p.product_id) === String(newPR.product_id));
                if (!p) return null;
                const total = parseInt(newPR.requested_quantity) * (p.unit_price ?? 0);
                return (
                  <p className="text-xs text-gray-500">
                    Estimated total: <span className="font-medium text-gray-900">₹{total.toLocaleString()}</span>
                    {total > 5000 && <span className="ml-2 text-yellow-600">(Requires Finance approval)</span>}
                  </p>
                );
              })()}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#1E3A8A] hover:bg-[#1E293B]">
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