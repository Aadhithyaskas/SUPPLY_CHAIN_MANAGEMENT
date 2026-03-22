import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../components/ui/use-toast";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listSuppliers,
  listVendors,
  getProductStock,
} from "../services/apiService";
import { useAuth } from "../components/lib/auth-context";

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

const EMPTY_FORM = {
  product_name: "",
  brand_name: "",
  size: "",
  description: "",
  category: "",
  quantity: 0,
  unit_price: "",
  re_order: "",
  vendor_id: "",
  supplier_id: "",
  ABC: "A",
  VED: "V",
  XYZ: "X",
};

const ABC_OPTIONS = [
  { value: "A", label: "A - High Value" },
  { value: "B", label: "B - Medium Value" },
  { value: "C", label: "C - Low Value" },
];
const VED_OPTIONS = [
  { value: "V", label: "V - Vital" },
  { value: "E", label: "E - Essential" },
  { value: "D", label: "D - Desirable" },
];
const XYZ_OPTIONS = [
  { value: "X", label: "X - High Demand" },
  { value: "Y", label: "Y - Medium Demand" },
  { value: "Z", label: "Z - Low Demand" },
];

const getStockStatus = (stock, reorder) => {
  if (stock <= 0)       return { label: "Out of Stock", variant: "destructive" };
  if (stock <= reorder) return { label: "Low Stock",    variant: "warning" };
  return                       { label: "In Stock",     variant: "secondary" };
};

// ✅ No <AppLayout> — layout is provided by the router via <Outlet>
export default function ProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const canManage = ["admin", "manager", "inventory_manager"].includes(user?.role);

  useEffect(() => {
    loadProducts();
    loadSuppliersAndVendors();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await listProducts();
      // ✅ FIX: use toArray so { products: [...] } and bare arrays both work
      const productList = toArray(data, "products");

      const productsWithStock = await Promise.all(
        productList.map(async (product) => {
          try {
            const stock = await getProductStock(product.product_id);
            return { ...product, stock: stock?.total_stock ?? 0 };
          } catch {
            return { ...product, stock: 0 };
          }
        })
      );
      setProducts(productsWithStock);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuppliersAndVendors = async () => {
    try {
      const [suppliersRes, vendorsRes] = await Promise.allSettled([
        listSuppliers(),
        listVendors(),
      ]);
      // ✅ FIX: normalise both responses — they may be envelope objects
      setSuppliers(suppliersRes.status === "fulfilled" ? toArray(suppliersRes.value, "suppliers") : []);
      setVendors(vendorsRes.status   === "fulfilled" ? toArray(vendorsRes.value,   "vendors")   : []);
    } catch (error) {
      console.error("Failed to load suppliers/vendors:", error);
    }
  };

  const handleOpenCreate = () => {
    setDialogMode("create");
    setFormData(EMPTY_FORM);
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      product_name: product.product_name   ?? "",
      brand_name:   product.brand_name     ?? "",
      size:         product.size           ?? "",
      description:  product.description    ?? "",
      category:     product.category       ?? "",
      quantity:     product.quantity       ?? 0,
      unit_price:   product.unit_price     ?? "",
      re_order:     product.re_order       ?? "",
      // ✅ FIX: coerce IDs to string for shadcn <Select> controlled value matching
      vendor_id:    String(product.vendor?.vendor_id     ?? ""),
      supplier_id:  String(product.supplier?.supplier_id ?? ""),
      ABC: product.ABC || "A",
      VED: product.VED || "V",
      XYZ: product.XYZ || "X",
    });
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete ${product.product_name}?`)) return;
    setIsSubmitting(true);
    try {
      await deleteProduct(product.product_id);
      toast({ title: "Success", description: "Product deleted successfully." });
      loadProducts();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        unit_price: parseInt(formData.unit_price),
        re_order:   parseInt(formData.re_order),
        quantity:   parseInt(formData.quantity) || 0,
      };
      if (dialogMode === "create") {
        await createProduct(productData);
        toast({ title: "Success", description: "Product created successfully." });
      } else {
        await updateProduct(selectedProduct.product_id, productData);
        toast({ title: "Success", description: "Product updated successfully." });
      }
      setDialogOpen(false);
      loadProducts();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const q = search.toLowerCase();
  // ✅ FIX: product_id / sku_code may be integers — use matchesSearch for safe coercion
  const filteredProducts = products.filter(
    (p) =>
      matchesSearch(p.product_name, q) ||
      matchesSearch(p.sku_code,     q) ||
      matchesSearch(p.product_id,   q)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, SKU, or ID..."
            className="pl-9 h-9 border-gray-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canManage && (
          <Button size="sm" className="h-9 bg-[#1E3A8A] hover:bg-[#1E293B]" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Product
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-600">Product ID</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">SKU</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Product Name</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Category</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Stock</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Unit Price</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600">Status</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1E3A8A]" />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.re_order);
                  return (
                    <TableRow key={product.product_id} className="hover:bg-gray-50">
                      <TableCell className="text-xs font-mono font-medium text-gray-600">
                        {product.product_id}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-gray-500">
                        {product.sku_code}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900">
                        {product.product_name}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {product.category}
                      </TableCell>
                      <TableCell className={`text-sm text-right tabular-nums font-medium ${
                        stockStatus.variant !== "secondary" ? "text-red-600" : "text-gray-700"
                      }`}>
                        {(product.stock ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-right tabular-nums text-gray-700">
                        ₹{(product.unit_price ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={stockStatus.variant === "warning" ? "destructive" : stockStatus.variant}
                          className="text-xs"
                        >
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canManage && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {dialogMode === "create" ? "Add New Product" : "Edit Product"}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === "create"
                  ? "Fill in the product details below. SKU will be auto-generated."
                  : "Update product information."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Product Name *</Label>
                  <Input value={formData.product_name} className="border-gray-200"
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label>Brand *</Label>
                  <Input value={formData.brand_name} className="border-gray-200"
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Size</Label>
                  <Input value={formData.size} placeholder="e.g., M, L, XL, 10mm" className="border-gray-200"
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Category *</Label>
                  <Input value={formData.category} className="border-gray-200"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={formData.description} rows={3} className="border-gray-200"
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Initial Quantity</Label>
                  <Input type="number" min="0" value={formData.quantity} className="border-gray-200"
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="grid gap-2">
                  <Label>Unit Price (₹) *</Label>
                  <Input type="number" min="0" value={formData.unit_price} className="border-gray-200"
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label>Reorder Level *</Label>
                  <Input type="number" min="0" value={formData.re_order} className="border-gray-200"
                    onChange={(e) => setFormData({ ...formData, re_order: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Supplier</Label>
                  <Select value={formData.supplier_id}
                    onValueChange={(v) => setFormData({ ...formData, supplier_id: v })}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        // ✅ FIX: value must be a string for shadcn Select to match correctly
                        <SelectItem key={s.supplier_id} value={String(s.supplier_id)}>
                          {s.supplier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Vendor</Label>
                  <Select value={formData.vendor_id}
                    onValueChange={(v) => setFormData({ ...formData, vendor_id: v })}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => (
                        // ✅ FIX: same string coercion for vendor_id
                        <SelectItem key={v.vendor_id} value={String(v.vendor_id)}>
                          {v.vendor_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>ABC Classification</Label>
                  <Select value={formData.ABC} onValueChange={(v) => setFormData({ ...formData, ABC: v })}>
                    <SelectTrigger className="border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ABC_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>VED Classification</Label>
                  <Select value={formData.VED} onValueChange={(v) => setFormData({ ...formData, VED: v })}>
                    <SelectTrigger className="border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VED_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>XYZ Classification</Label>
                  <Select value={formData.XYZ} onValueChange={(v) => setFormData({ ...formData, XYZ: v })}>
                    <SelectTrigger className="border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {XYZ_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#1E3A8A] hover:bg-[#1E293B]">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {dialogMode === "create" ? "Create Product" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}