import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Pencil, Trash2, AlertTriangle, Loader2, PlusCircle, MinusCircle } from "lucide-react";
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
import { useToast } from "../components/ui/use-toast";
import {
  listProducts,
  getProductStock,
  updateProduct,
  deleteProduct,
  addStock,
  removeStock,
  listSuppliers,
  listVendors,
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

// Safe case-insensitive match for any value type
const matchesSearch = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

const getStockStatus = (stock, reorder) => {
  if (stock <= 0) return "critical";
  if (stock <= reorder) return "low";
  return "ok";
};

// ✅ No <AppLayout> — layout is provided by the router via <Outlet>
export default function InventoryPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockAction, setStockAction] = useState("add");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [editFormData, setEditFormData] = useState({
    product_name: "",
    brand_name: "",
    size: "",
    description: "",
    category: "",
    unit_price: "",
    re_order: "",
    vendor_id: "",
    supplier_id: "",
  });

  useEffect(() => {
    loadInventory();
    loadSuppliers();
    loadVendors();
  }, []);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const products = await listProducts();
      const productList = toArray(products, "products");

      const productsWithStock = await Promise.all(
        productList.map(async (product) => {
          try {
            const stock = await getProductStock(product.product_id);
            const total = stock?.total_stock ?? 0;
            return {
              ...product,
              total_stock: total,
              status: getStockStatus(total, product.re_order ?? 0),
            };
          } catch {
            return { ...product, total_stock: 0, status: "ok" };
          }
        })
      );
      setInventoryData(productsWithStock);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      toast({ title: "Error", description: "Failed to load inventory data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await listSuppliers();
      // ✅ FIX: listSuppliers may return an envelope object, not a bare array
      setSuppliers(toArray(data));
    } catch (error) {
      console.error("Failed to load suppliers:", error);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await listVendors();
      // ✅ FIX: same shape-safety for vendors
      setVendors(toArray(data));
    } catch (error) {
      console.error("Failed to load vendors:", error);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditFormData({
      product_name: product.product_name ?? "",
      brand_name: product.brand_name ?? "",
      size: product.size ?? "",
      description: product.description ?? "",
      category: product.category ?? "",
      unit_price: product.unit_price ?? "",
      re_order: product.re_order ?? "",
      vendor_id: String(product.vendor?.vendor_id ?? ""),
      supplier_id: String(product.supplier?.supplier_id ?? ""),
    });
    setEditDialogOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProduct(selectedProduct.product_id, editFormData);
      toast({ title: "Success", description: "Product updated successfully." });
      setEditDialogOpen(false);
      loadInventory();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to update product.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete ${product.product_name}?`)) return;
    setIsSubmitting(true);
    try {
      await deleteProduct(product.product_id);
      toast({ title: "Success", description: "Product deleted successfully." });
      loadInventory();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to delete product.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockAction = (product, action) => {
    setSelectedProduct(product);
    setStockAction(action);
    setStockQuantity("");
    setStockDialogOpen(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockQuantity || parseInt(stockQuantity) <= 0) {
      toast({ title: "Error", description: "Please enter a valid quantity.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const qty = parseInt(stockQuantity);
      if (stockAction === "add") {
        await addStock(selectedProduct.product_id, qty);
        toast({ title: "Success", description: `Added ${qty} units to ${selectedProduct.product_name}.` });
      } else {
        await removeStock(selectedProduct.product_id, qty);
        toast({ title: "Success", description: `Removed ${qty} units from ${selectedProduct.product_name}.` });
      }
      setStockDialogOpen(false);
      loadInventory();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to update stock.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const q = search.toLowerCase();
  // ✅ FIX: product_id and sku_code may be numbers — use matchesSearch() for safe coercion
  const filteredInventory = inventoryData.filter(
    (item) =>
      matchesSearch(item.product_name, q) ||
      matchesSearch(item.sku_code, q) ||
      matchesSearch(item.product_id, q)
  );

  const lowStockCount = inventoryData.filter((i) => i.status !== "ok").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU or product name..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" className="h-9" asChild>
          <a href="/products/create">
            <Plus className="w-4 h-4 mr-1.5" /> Add Product
          </a>
        </Button>
      </div>

      {lowStockCount > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
          <CardContent className="flex items-center gap-3 p-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-medium">{lowStockCount} items</span>{" "}
              are at or below reorder threshold
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold w-[100px]">SKU</TableHead>
                <TableHead className="text-xs font-semibold">Product Name</TableHead>
                <TableHead className="text-xs font-semibold">Supplier</TableHead>
                <TableHead className="text-xs font-semibold">Vendor</TableHead>
                <TableHead className="text-xs font-semibold text-right">Stock</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold text-right">Unit Price</TableHead>
                <TableHead className="text-xs font-semibold text-right">Reorder At</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item.product_id}>
                    <TableCell className="text-xs font-mono">{item.sku_code}</TableCell>
                    <TableCell className="text-sm font-medium">{item.product_name}</TableCell>
                    <TableCell className="text-xs">{item.supplier?.supplier_name || "-"}</TableCell>
                    <TableCell className="text-xs">{item.vendor?.vendor_name || "-"}</TableCell>
                    <TableCell className={`text-sm text-right font-medium tabular-nums ${item.status !== "ok" ? "text-destructive" : ""}`}>
                      {(item.total_stock ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">{item.category}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">
                      ₹{(item.unit_price ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{item.re_order}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === "ok" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {item.status === "critical" ? "Critical" : item.status === "low" ? "Low Stock" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleStockAction(item, "add")} className="p-1.5 rounded hover:bg-green-50 transition-colors" title="Add Stock">
                          <PlusCircle className="w-3.5 h-3.5 text-green-600" />
                        </button>
                        <button onClick={() => handleStockAction(item, "remove")} className="p-1.5 rounded hover:bg-destructive/10 transition-colors" title="Remove Stock">
                          <MinusCircle className="w-3.5 h-3.5 text-destructive" />
                        </button>
                        <button onClick={() => handleEditProduct(item)} className="p-1.5 rounded hover:bg-muted transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDeleteProduct(item)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors" title="Delete">
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

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleUpdateProduct}>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information for {selectedProduct?.product_name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input id="product_name" value={editFormData.product_name}
                    onChange={(e) => setEditFormData({ ...editFormData, product_name: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="brand_name">Brand *</Label>
                  <Input id="brand_name" value={editFormData.brand_name}
                    onChange={(e) => setEditFormData({ ...editFormData, brand_name: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="size">Size</Label>
                  <Input id="size" value={editFormData.size}
                    onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input id="category" value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="unit_price">Unit Price (₹) *</Label>
                  <Input id="unit_price" type="number" value={editFormData.unit_price}
                    onChange={(e) => setEditFormData({ ...editFormData, unit_price: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="re_order">Reorder Level *</Label>
                  <Input id="re_order" type="number" value={editFormData.re_order}
                    onChange={(e) => setEditFormData({ ...editFormData, re_order: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Supplier</Label>
                  <Select value={editFormData.supplier_id}
                    onValueChange={(value) => setEditFormData({ ...editFormData, supplier_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.supplier_id} value={String(s.supplier_id)}>
                          {s.supplier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Vendor</Label>
                  <Select value={editFormData.vendor_id}
                    onValueChange={(value) => setEditFormData({ ...editFormData, vendor_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => (
                        <SelectItem key={v.vendor_id} value={String(v.vendor_id)}>
                          {v.vendor_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <form onSubmit={handleStockSubmit}>
            <DialogHeader>
              <DialogTitle>{stockAction === "add" ? "Add Stock" : "Remove Stock"}</DialogTitle>
              <DialogDescription>
                {stockAction === "add"
                  ? `Add stock to ${selectedProduct?.product_name}`
                  : `Remove stock from ${selectedProduct?.product_name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min="1" value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)} required />
              </div>
              {stockAction === "remove" && (
                <p className="text-xs text-muted-foreground">
                  Current stock: {selectedProduct?.total_stock ?? 0} units
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStockDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant={stockAction === "add" ? "default" : "destructive"} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {stockAction === "add" ? "Add Stock" : "Remove Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}