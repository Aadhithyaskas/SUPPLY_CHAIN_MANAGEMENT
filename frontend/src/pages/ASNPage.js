import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Eye, Loader2, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  listASN, getASN, createASN, createASNItem,
  listVendors, listProducts, listPurchaseOrders,
} from "../services/apiService";
import { useToast } from "../components/ui/use-toast";

/* ─── helpers ─── */
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

const STATUS_STYLES = {
  pending:    { label: "Pending",    variant: "outline"     },
  in_transit: { label: "In Transit", variant: "default"     },
  arrived:    { label: "Arrived",    variant: "secondary"   },
  completed:  { label: "Completed",  variant: "success"     },
  cancelled:  { label: "Cancelled",  variant: "destructive" },
};

const EMPTY_FORM = {
  asn_number: "",
  po: "",
  vendor: "",
  shipment_date: "",
  expected_arrival_date: "",
  driver_name: "",
  driver_phone: "",
  vehicle_num: "",
  notes: "",
};

const EMPTY_ITEM = { product: "", expected_quantity: "", unit_cost: "" };

/* ════════════════════════════════════════════════════════════ */
export default function ASNPage() {
  const { toast } = useToast();

  /* list state */
  const [search, setSearch]       = useState("");
  const [asnData, setAsnData]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* view dialog */
  const [viewOpen, setViewOpen]       = useState(false);
  const [selectedASN, setSelectedASN] = useState(null);

  /* create dialog */
  const [createOpen, setCreateOpen] = useState(false);
  const [step, setStep]             = useState(1);
  const [saving, setSaving]         = useState(false);

  /* form data */
  const [form, setForm]   = useState(EMPTY_FORM);
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  /* reference data */
  const [vendors, setVendors]         = useState([]);
  const [products, setProducts]       = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  /* ── load on mount ── */
  useEffect(() => { loadASNs(); }, []);

  const loadASNs = async () => {
    setIsLoading(true);
    try {
      const data = await listASN();
      setAsnData(toArray(data, "asns"));
    } catch {
      toast({ title: "Error", description: "Failed to load ASNs.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── open create dialog ── */
  const openCreate = async () => {
    setForm(EMPTY_FORM);
    setItems([{ ...EMPTY_ITEM }]);
    setStep(1);
    setCreateOpen(true);
    try {
      const [vRes, pRes, poRes] = await Promise.all([
        listVendors(),
        listProducts(),
        listPurchaseOrders(),
      ]);
      setVendors(toArray(vRes, "vendors"));
      setProducts(toArray(pRes, "products"));
      setPurchaseOrders(toArray(poRes, "purchase_orders"));
    } catch {
      toast({ title: "Warning", description: "Could not load reference data.", variant: "destructive" });
    }
  };

  /* ── view ── */
  const handleView = async (asnId) => {
    try {
      const asn = await getASN(asnId);
      setSelectedASN(asn);
      setViewOpen(true);
    } catch {
      toast({ title: "Error", description: "Failed to load ASN details.", variant: "destructive" });
    }
  };

  /* ── form field helpers ── */
  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const setItemField = (idx, key, val) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const addItem    = () => setItems((arr) => [...arr, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setItems((arr) => arr.filter((_, i) => i !== idx));

  /* ── step 1 validation ── */
  const step1Valid =
    form.asn_number.trim() &&
    form.po &&
    form.vendor &&
    form.shipment_date &&
    form.expected_arrival_date;

  /* ── submit ── */
  const handleSubmit = async () => {
    const validItems = items.filter((it) => it.product && it.expected_quantity);
    if (!validItems.length) {
      toast({
        title: "Error",
        description: "Add at least one item with product and quantity.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    let createdAsnId = null;

    try {
      /* 1️⃣  Create ASN header */
      const payload = {
        asn_number: form.asn_number.trim(),
        po: form.po,
        vendor: form.vendor,
        shipment_date: form.shipment_date,
        expected_arrival_date: form.expected_arrival_date,
        ...(form.driver_name  && { driver_name:  form.driver_name  }),
        ...(form.driver_phone && { driver_phone: form.driver_phone }),
        ...(form.vehicle_num  && { vehicle_num:  form.vehicle_num  }),
        ...(form.notes        && { notes:        form.notes        }),
      };

      console.log("Creating ASN:", payload);
      const asnRes = await createASN(payload);
      console.log("ASN response:", asnRes);

      // Extract ASN ID from response (supports multiple response formats)
      createdAsnId = asnRes?.asn_id ?? asnRes?.id ?? asnRes?.data?.asn_id ?? asnRes?.data?.id ?? null;

      if (!createdAsnId) {
        throw new Error("ASN created but no ID returned from server.");
      }

      /* 2️⃣  Create items - match backend ASNItem model fields */
      // Backend ASNItem expects: asn (foreign key), product, expected_quantity, shipped_quantity
      // Note: shipped_quantity is required in the model (no default)
      for (let i = 0; i < validItems.length; i++) {
        const it = validItems[i];
        const itemPayload = {
          asn: createdAsnId,                    // FK to ASN
          product: it.product,                  // Product ID
          expected_quantity: Number(it.expected_quantity),  // Expected base units
          shipped_quantity: Number(it.expected_quantity),   // Initially same as expected (updated when ASN arrives)
        };
        
        // Optional: add unit_cost if your backend supports it (not in current ASNItem model)
        // If you need unit_cost, you'd need to add it to ASNItem model first
        if (it.unit_cost && parseFloat(it.unit_cost) > 0) {
          // Note: unit_cost is not in your current ASNItem model
          // You can either:
          // 1. Add unit_cost field to ASNItem model
          // 2. Store it elsewhere (e.g., notes)
          // 3. Ignore it for now
          console.log("Note: unit_cost not stored in current ASNItem model");
        }
        
        console.log(`Creating item ${i + 1}/${validItems.length}:`, itemPayload);
        await createASNItem(itemPayload);
      }

      toast({ 
        title: "Success", 
        description: `ASN ${form.asn_number} created with ${validItems.length} item(s).` 
      });
      setCreateOpen(false);
      loadASNs();

    } catch (err) {
      console.error("ASN creation error:", err);
      toast({
        title: "Error",
        description: createdAsnId
          ? `ASN created but items failed: ${err.message}`
          : `Failed to create ASN: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ── filter ── */
  const q        = search.toLowerCase();
  const filtered = asnData.filter(
    (asn) => matchesSearch(asn.asn_id, q) || matchesSearch(asn.vendor_name, q)
  );

  /* ════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-4">

      {/* ── toolbar ── */}
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
        <Button size="sm" className="h-9" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1.5" /> New ASN
        </Button>
      </div>

      {/* ── table ── */}
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
                    <TableCell className="text-sm">{asn.vendor_name || "-"}</TableCell>
                    <TableCell className="text-right">{asn.items?.length ?? 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {asn.shipment_date ? new Date(asn.shipment_date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {asn.expected_arrival_date ? new Date(asn.expected_arrival_date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-xs">{asn.driver_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_STYLES[asn.status]?.variant || "secondary"} className="text-xs">
                        {STATUS_STYLES[asn.status]?.label || asn.status || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleView(asn.asn_id)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ══════════════════════════════════════════
          CREATE DIALOG  (2-step)
      ══════════════════════════════════════════ */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!saving) setCreateOpen(o); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New ASN — Step {step} of 2</DialogTitle>
            <DialogDescription>
              {step === 1 ? "Shipment & driver details" : "Add line items"}
            </DialogDescription>
          </DialogHeader>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4 py-2">

              {/* ASN Number */}
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium">
                  ASN Number <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. ASN-2024-001"
                  value={form.asn_number}
                  onChange={(e) => setField("asn_number", e.target.value)}
                />
              </div>

              {/* Purchase Order */}
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium">
                  Purchase Order <span className="text-destructive">*</span>
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.po}
                  onChange={(e) => setField("po", e.target.value)}
                >
                  <option value="">Select PO…</option>
                  {purchaseOrders.map((po) => (
                    <option
                      key={po.id ?? po.po_id}
                      value={po.id ?? po.po_id}
                    >
                      {po.po_number ?? po.order_number ?? po.id ?? po.po_id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor */}
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium">
                  Vendor <span className="text-destructive">*</span>
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.vendor}
                  onChange={(e) => setField("vendor", e.target.value)}
                >
                  <option value="">Select vendor…</option>
                  {vendors.map((v) => (
                    <option key={v.id ?? v.vendor_id} value={v.id ?? v.vendor_id}>
                      {v.vendor_name ?? v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipment Date */}
              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Shipment Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={form.shipment_date}
                  onChange={(e) => setField("shipment_date", e.target.value)}
                />
              </div>

              {/* Expected Arrival */}
              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Expected Arrival <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={form.expected_arrival_date}
                  onChange={(e) => setField("expected_arrival_date", e.target.value)}
                />
              </div>

              {/* Driver Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Driver Name</label>
                <Input
                  placeholder="Driver name"
                  value={form.driver_name}
                  onChange={(e) => setField("driver_name", e.target.value)}
                />
              </div>

              {/* Driver Phone */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Driver Phone</label>
                <Input
                  placeholder="+91 XXXXX XXXXX"
                  value={form.driver_phone}
                  onChange={(e) => setField("driver_phone", e.target.value)}
                />
              </div>

              {/* Vehicle Number */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Vehicle Number</label>
                <Input
                  placeholder="TN 01 AB 1234"
                  value={form.vehicle_num}
                  onChange={(e) => setField("vehicle_num", e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium">Notes</label>
                <textarea
                  rows={2}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none"
                  placeholder="Any additional notes…"
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="space-y-3 py-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-end border rounded-md p-3 bg-muted/20"
                >
                  {/* Product */}
                  <div className="col-span-6 space-y-1">
                    <label className="text-xs font-medium">
                      Product <span className="text-destructive">*</span>
                    </label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      value={item.product}
                      onChange={(e) => setItemField(idx, "product", e.target.value)}
                    >
                      <option value="">Select product…</option>
                      {products.map((p) => (
                        <option key={p.id ?? p.product_id} value={p.id ?? p.product_id}>
                          {p.product_name ?? p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Expected Quantity (in base units) */}
                  <div className="col-span-3 space-y-1">
                    <label className="text-xs font-medium">
                      Expected Qty <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={item.expected_quantity}
                      onChange={(e) => setItemField(idx, "expected_quantity", e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">In base units</p>
                  </div>

                  {/* Unit Cost (optional - not stored in current model) */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium">Unit Cost</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.unit_cost}
                      onChange={(e) => setItemField(idx, "unit_cost", e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground">Optional</p>
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      className="p-1.5 rounded hover:bg-destructive/10 disabled:opacity-30 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addItem} className="w-full">
                <Plus className="w-4 h-4 mr-1.5" /> Add Item
              </Button>
              
              {/* Note about unit_cost */}
              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                <p className="font-medium">Note:</p>
                <p>• Quantity is in <strong>base units</strong> (e.g., pieces, kg, liters)</p>
                <p>• Unit cost is currently informational only (not stored in ASNItem model)</p>
              </div>
            </div>
          )}

          {/* ── footer ── */}
          <DialogFooter className="gap-2 pt-2">
            {step === 1 ? (
              <>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={() => setStep(2)} disabled={!step1Valid}>
                  Next: Add Items →
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {saving ? "Creating…" : "Create ASN"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════
          VIEW DIALOG
      ══════════════════════════════════════════ */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ASN Details</DialogTitle>
            <DialogDescription>{selectedASN?.vendor_name ?? "-"}</DialogDescription>
          </DialogHeader>

          {selectedASN && (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <p className="text-muted-foreground">ASN ID</p>
                <p className="font-mono font-medium">{selectedASN.asn_id}</p>

                <p className="text-muted-foreground">ASN Number</p>
                <p className="font-mono">{selectedASN.asn_number || "-"}</p>

                <p className="text-muted-foreground">Status</p>
                <Badge variant={STATUS_STYLES[selectedASN.status]?.variant || "secondary"} className="w-fit text-xs">
                  {STATUS_STYLES[selectedASN.status]?.label || selectedASN.status}
                </Badge>

                <p className="text-muted-foreground">Driver</p>
                <p>{selectedASN.driver_name || "-"}</p>

                <p className="text-muted-foreground">Driver Phone</p>
                <p>{selectedASN.driver_phone || "-"}</p>

                <p className="text-muted-foreground">Vehicle No.</p>
                <p>{selectedASN.vehicle_num || "-"}</p>

                <p className="text-muted-foreground">Shipment Date</p>
                <p>{selectedASN.shipment_date ? new Date(selectedASN.shipment_date).toLocaleDateString() : "-"}</p>

                <p className="text-muted-foreground">Expected Arrival</p>
                <p>{selectedASN.expected_arrival_date ? new Date(selectedASN.expected_arrival_date).toLocaleDateString() : "-"}</p>

                {selectedASN.items?.length > 0 && (
                  <>
                    <p className="text-muted-foreground col-span-2 font-medium pt-2 border-t">
                      Items ({selectedASN.items.length})
                    </p>
                    {selectedASN.items.map((item, index) => (
                      <div key={index} className="col-span-2 text-xs text-muted-foreground pl-2">
                        <p>• {item.product_name ?? `Item ${index + 1}`}</p>
                        <p className="pl-4">Expected: {item.expected_quantity ?? 0} units</p>
                        <p className="pl-4">Shipped: {item.shipped_quantity ?? 0} units</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}              