import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  listVendors,
  updateVendor,
  deleteVendor,
  getVendor,
} from "../services/apiService";
import { useToast } from "../components/ui/use-toast";

const toArray = (res, knownKey = null) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (knownKey && Array.isArray(res[knownKey])) return res[knownKey];
  for (const key of ["results", "data", "items"]) {
    if (Array.isArray(res[key])) return res[key];
  }
  return Object.values(res).find(Array.isArray) || [];
};

const matchesSearch = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

const EMPTY_FORM = {
  vendor_name: "",
  contact_person: "",
  email: "",
  phone: "",
  lead_time: "",
  address: "",
  city: "",
  state: "",
  country: "",
};

export default function VendorsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("edit"); // edit | delete only
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setIsLoading(true);
    try {
      const data = await listVendors();
      setVendors(toArray(data, "vendors"));
    } catch (error) {
      console.error("Failed to load vendors:", error);
      toast({
        title: "Error",
        description: "Failed to load vendors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = async (vendorId) => {
    setIsLoading(true);
    try {
      const vendor = await getVendor(vendorId);
      setSelectedVendor(vendor);
      setFormData({
        vendor_name:    vendor.vendor_name    ?? "",
        contact_person: vendor.contact_person ?? "",
        email:          vendor.email          ?? "",
        phone:          vendor.phone          ?? "",
        lead_time:      vendor.lead_time      ?? "",
        address:        vendor.address        ?? "",
        city:           vendor.city           ?? "",
        state:          vendor.state          ?? "",
        country:        vendor.country        ?? "",
      });
      setDialogMode("edit");
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to load vendor:", error);
      toast({
        title: "Error",
        description: "Failed to load vendor details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDelete = (vendor) => {
    setSelectedVendor(vendor);
    setDialogMode("delete");
    setDialogOpen(true);
  };

  const setField = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    try {
      if (dialogMode === "edit") {
        await updateVendor(selectedVendor.vendor_id, formData);
        toast({ title: "Success", description: "Vendor updated successfully." });
      } else if (dialogMode === "delete") {
        await deleteVendor(selectedVendor.vendor_id);
        toast({ title: "Success", description: "Vendor deleted successfully." });
      }
      setDialogOpen(false);
      loadVendors();
    } catch (error) {
      console.error("Operation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Operation failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const q = search.toLowerCase();
  const filteredVendors = vendors.filter(
    (v) =>
      matchesSearch(v.vendor_name, q) ||
      matchesSearch(v.vendor_id, q) ||
      matchesSearch(v.contact_person, q)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* ✅ Navigates to dedicated Create Vendor page */}
        <Button size="sm" className="h-9" onClick={() => navigate("/vendors/create")}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Vendor
        </Button>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">ID</TableHead>
                <TableHead className="text-xs font-semibold">Vendor Name</TableHead>
                <TableHead className="text-xs font-semibold">Contact Person</TableHead>
                <TableHead className="text-xs font-semibold">Email</TableHead>
                <TableHead className="text-xs font-semibold">Phone</TableHead>
                <TableHead className="text-xs font-semibold">Lead Time</TableHead>
                <TableHead className="text-xs font-semibold">Location</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No vendors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((v) => (
                  <TableRow key={v.vendor_id}>
                    <TableCell className="text-xs font-mono font-medium">{v.vendor_id}</TableCell>
                    <TableCell className="text-sm font-medium">{v.vendor_name}</TableCell>
                    <TableCell className="text-xs">{v.contact_person || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{v.email || "-"}</TableCell>
                    <TableCell className="text-xs">{v.phone || "-"}</TableCell>
                    <TableCell className="text-xs">{v.lead_time ? `${v.lead_time} days` : "-"}</TableCell>
                    <TableCell className="text-xs">
                      {v.city ? `${v.city}, ${v.state}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={v.is_active !== false ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {v.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(v.vendor_id)}
                          className="p-1.5 rounded hover:bg-muted transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(v)}
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

      {/* Edit Dialog */}
      <Dialog open={dialogOpen && dialogMode === "edit"} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Vendor</DialogTitle>
              <DialogDescription>Update the vendor information.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid gap-2">
                <Label>Vendor Name *</Label>
                <Input value={formData.vendor_name} onChange={setField("vendor_name")} required />
              </div>
              <div className="grid gap-2">
                <Label>Contact Person</Label>
                <Input value={formData.contact_person} onChange={setField("contact_person")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={setField("email")} />
                </div>
                <div className="grid gap-2">
                  <Label>Phone *</Label>
                  <Input value={formData.phone} onChange={setField("phone")} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Lead Time (days) *</Label>
                <Input type="number" min="0" value={formData.lead_time} onChange={setField("lead_time")} required />
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <textarea
                  value={formData.address}
                  onChange={setField("address")}
                  rows={2}
                  placeholder="Enter full address"
                  className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>City</Label>
                  <Input value={formData.city} onChange={setField("city")} />
                </div>
                <div className="grid gap-2">
                  <Label>State</Label>
                  <Input value={formData.state} onChange={setField("state")} />
                </div>
                <div className="grid gap-2">
                  <Label>Country</Label>
                  <Input value={formData.country} onChange={setField("country")} />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={dialogOpen && dialogMode === "delete"} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{selectedVendor?.vendor_name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}