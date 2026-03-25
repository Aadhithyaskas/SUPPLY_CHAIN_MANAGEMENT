import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import {
  listProducts,
  deleteProduct,
  getProductStock,
} from "../services/apiService";
import { useAuth } from "../components/lib/auth-context";

/* ─── helpers ─── */
const toArray = (res, knownKey = null) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (knownKey && Array.isArray(res[knownKey])) return res[knownKey];
  for (const key of ["results", "data", "items"])
    if (Array.isArray(res[key])) return res[key];
  return Object.values(res).find(Array.isArray) || [];
};

const matchesSearch = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

const getStockStatus = (stock, reorder) => {
  if (stock <= 0)        return { label: "Out of Stock", variant: "destructive" };
  if (stock <= reorder)  return { label: "Low Stock",    variant: "warning" };
  return                        { label: "In Stock",     variant: "secondary" };
};

export default function ProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null); // product_id being deleted

  const canManage = ["admin", "manager", "inventory_manager"].includes(user?.role);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await listProducts();
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

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.product_name}"?`)) return;
    setIsDeleting(product.product_id);
    try {
      await deleteProduct(product.product_id);
      toast({ title: "Success", description: "Product deleted successfully." });
      loadProducts();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  };

  const q = search.toLowerCase();
  const filteredProducts = products.filter(
    (p) =>
      matchesSearch(p.product_name, q) ||
      matchesSearch(p.sku_code, q) ||
      matchesSearch(p.product_id, q)
  );

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
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
          <Button
            size="sm"
            className="h-9 bg-[#1E3A8A] hover:bg-[#1E293B]"
            onClick={() => navigate("/products/create")}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Product
          </Button>
        )}
      </div>

      {/* ── Table ── */}
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
                {canManage && (
                  <TableHead className="text-xs font-semibold text-gray-600 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1E3A8A]" />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.re_order);
                  const isBeingDeleted = isDeleting === product.product_id;
                  return (
                    <TableRow
                      key={product.product_id}
                      className={`hover:bg-gray-50 transition-colors ${isBeingDeleted ? "opacity-40 pointer-events-none" : ""}`}
                    >
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
                      <TableCell
                        className={`text-sm text-right tabular-nums font-medium ${
                          stockStatus.variant !== "secondary" ? "text-red-600" : "text-gray-700"
                        }`}
                      >
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
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                navigate(`/products/edit/${product.product_id}`, {
                                  state: { product },
                                })
                              }
                              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                              title="Edit product"
                            >
                              <Pencil className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Delete product"
                            >
                              {isBeingDeleted ? (
                                <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}