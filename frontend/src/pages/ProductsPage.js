import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Pencil, Trash2, Loader2, Package } from "lucide-react";
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
  getProductStock
} from "../services/apiService";
import { useAuth } from "../components/lib/auth-context";

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
  const [formData, setFormData] = useState({
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
  });

  const roleOptions = [
    { value: "A", label: "A - High Value" },
    { value: "B", label: "B - Medium Value" },
    { value: "C", label: "C - Low Value" },
  ];

  const vedOptions = [
    { value: "V", label: "V - Vital" },
    { value: "E", label: "E - Essential" },
    { value: "D", label: "D - Desirable" },
  ];

  const xyzOptions = [
    { value: "X", label: "X - High Demand" },
    { value: "Y", label: "Y - Medium Demand" },
    { value: "Z", label: "Z - Low Demand" },
  ];

  useEffect(() => {
    loadProducts();
    loadSuppliersAndVendors();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await listProducts();
      const productsWithStock = await Promise.all(
        (data.products || []).map(async (product) => {
          try {
            const stock = await getProductStock(product.product_id);
            return { ...product, stock: stock.total_stock || 0 };
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
      const [suppliersData, vendorsData] = await Promise.all([
        listSuppliers(),
        listVendors(),
      ]);
      setSuppliers(suppliersData);
      setVendors(vendorsData);
    } catch (error) {
      console.error("Failed to load suppliers/vendors:", error);
    }
  };

  const handleOpenCreate = () => {
    setDialogMode("create");
    setFormData({
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
    });
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      product_name: product.product_name,
      brand_name: product.brand_name,
      size: product.size || "",
      description: product.description || "",
      category: product.category,
      quantity: product.quantity || 0,
      unit_price: product.unit_price,
      re_order: product.re_order,
      vendor_id: product.vendor?.vendor_id || "",
      supplier_id: product.supplier?.supplier_id || "",
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
        re_order: parseInt(formData.re_order),
        quantity: parseInt(formData.quantity) || 0,
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

  const filteredProducts = products.filter((p) =>
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku_code?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_id?.toLowerCase().includes(search.toLowerCase())
  );

  const getStockStatus = (stock, reorder) => {
    if (stock <= 0) return { label: "Out of Stock", variant: "destructive" };
    if (stock <= reorder) return { label: "Low Stock", variant: "warning" };
    return { label: "In Stock", variant: "secondary" };
  };

  // Check if user has permission (admin, manager, inventory_manager)
  const canManage = ["admin", "manager", "inventory_manager"].includes(user?.role);

  return (
    <AppLayout title="Products">
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
                          stockStatus.variant === "destructive" || stockStatus.variant === "warning" 
                            ? "text-red-600" 
                            : "text-gray-700"
                        }`}>
                          {product.stock?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="text-sm text-right tabular-nums text-gray-700">
                          ₹{product.unit_price?.toLocaleString()}
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
      </div>

      {/* Create/Edit Product Dialog */}
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
                  <Label className="text-sm font-medium text-gray-700">Product Name *</Label>
                  <Input
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                    className="border-gray-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">Brand *</Label>
                  <Input
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    required
                    className="border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">Size</Label>
                  <Input
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g., M, L, XL, 10mm"
                    className="border-gray-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">Category *</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="border-gray-200"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="border-gray-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">Initial Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="border-gray-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">Unit Price (₹) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    required
                    className="border-gray-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">Reorder Level *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.re_order}
                    onChange={(e) => setFormData({ ...formData, re_order: e.target.value })}
                    required
                    className="border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">Supplier</Label>
                  <Select
                    value={formData.supplier_id}
                    onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.supplier_id} value={s.supplier_id}>
                          {s.supplier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">Vendor</Label>
                  <Select
                    value={formData.vendor_id}
                    onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => (
                        <SelectItem key={v.vendor_id} value={v.vendor_id}>
                          {v.vendor_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">ABC Classification</Label>
                  <Select
                    value={formData.ABC}
                    onValueChange={(value) => setFormData({ ...formData, ABC: value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">VED Classification</Label>
                  <Select
                    value={formData.VED}
                    onValueChange={(value) => setFormData({ ...formData, VED: value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vedOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">XYZ Classification</Label>
                  <Select
                    value={formData.XYZ}
                    onValueChange={(value) => setFormData({ ...formData, XYZ: value })}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {xyzOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
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
    </AppLayout>
  );
}