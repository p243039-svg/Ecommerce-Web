import React, { useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "@/lib/supabase";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/stores/useToastStore";
import { Search, Plus, Edit, Trash2, Eye, EyeOff, } from "lucide-react";
export default function AdminProductsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const addToast = useToastStore((s) => s.addToast);
    const fetchProducts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select(`
        *,
        images:product_images(*)
      `)
            .order("created_at", { ascending: false });
        if (error) {
            addToast({ type: "error", title: "Failed to fetch products", description: error.message });
        }
        else {
            setProducts(data || []);
        }
        setIsLoading(false);
    };
    React.useEffect(() => {
        fetchProducts();
    }, []);
    const filtered = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const toggleSelect = (id) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };
    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        }
        else {
            setSelectedIds(filtered.map((p) => p.id));
        }
    };
    const deleteMultipleProducts = async () => {
        if (!selectedIds.length)
            return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`))
            return;
        setIsBulkDeleting(true);
        const { error } = await supabase
            .from("products")
            .delete()
            .in("id", selectedIds);
        if (error) {
            addToast({ type: "error", title: "Bulk delete failed", description: error.message });
        }
        else {
            setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
            addToast({ type: "success", title: "Products deleted successfully" });
            setSelectedIds([]);
        }
        setIsBulkDeleting(false);
    };
    const toggleActive = async (id, currentStatus) => {
        const { error } = await supabase
            .from("products")
            .update({ is_active: !currentStatus })
            .eq("id", id);
        if (error) {
            addToast({ type: "error", title: "Update failed", description: error.message });
        }
        else {
            setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p)));
            addToast({ type: "success", title: "Product status updated" });
        }
    };
    const deleteProduct = async (id) => {
        if (!confirm("Are you sure you want to delete this product?"))
            return;
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
            addToast({ type: "error", title: "Delete failed", description: error.message });
        }
        else {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            addToast({ type: "success", title: "Product deleted" });
        }
    };
    return (<div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Managing {products.length} luxury items
          </p>
        </div>
        <Link to="/admin/products/new">
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4"/>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Bulk Toolbar */}
      {selectedIds.length > 0 && (<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-foreground text-background px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-border/10">
            <span className="text-sm font-bold tracking-tight">
              {selectedIds.length} ITEMS SELECTED
            </span>
            <div className="h-4 w-px bg-background/20"/>
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={deleteMultipleProducts} className="hover:bg-error/90" isLoading={isBulkDeleting}>
                <Trash2 className="w-4 h-4"/>
                Delete Permanently
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedIds([])} className="bg-background/10 text-background hover:bg-background/20">
                Cancel
              </Button>
            </div>
          </div>
        </div>)}

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search our collection..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"/>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-4 w-10">
                  <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-border text-primary focus:ring-primary"/>
                </th>
                <th className="text-left px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Product Details
                </th>
                <th className="text-left px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Price
                </th>
                <th className="text-left px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                  Stock
                </th>
                <th className="text-left px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                  Status
                </th>
                <th className="text-right px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            return (<tr key={product.id} className={cn("border-b border-border last:border-0 hover:bg-surface-hover transition-all", isSelected && "bg-primary/5")}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(product.id)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary"/>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-18 rounded-xl overflow-hidden shadow-sm ring-1 ring-border/50">
                          <img src={product.images?.[0]?.url || "/placeholder.jpg"} alt={product.name}  className="object-cover absolute inset-0 w-full h-full object-cover" sizes="56px"/>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter opacity-60">
                            ID: {product.id.slice(0, 8)} • {product.brand}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_at_price && (<span className="text-[10px] text-muted-foreground line-through opacity-50">
                            {formatPrice(product.compare_at_price)}
                          </span>)}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <Badge variant={product.stock_quantity === 0
                    ? "error"
                    : product.stock_quantity <= 5
                        ? "warning"
                        : "success"} className="font-bold tabular-nums">
                        {product.stock_quantity} UNIT
                      </Badge>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <Badge variant={product.is_active ? "success" : "default"} className="font-bold">
                        {product.is_active ? "ACTIVE" : "HIDDEN"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleActive(product.id, product.is_active)} className="p-2 rounded-xl hover:bg-surface-hover transition-all text-muted-foreground hover:text-foreground" title={product.is_active ? "Hide" : "Show"}>
                          {product.is_active ? (<EyeOff className="w-4 h-4"/>) : (<Eye className="w-4 h-4"/>)}
                        </button>
                        <Link to={`/admin/products/${product.id}`} className="p-2 rounded-xl hover:bg-surface-hover transition-all text-muted-foreground hover:text-primary">
                          <Edit className="w-4 h-4"/>
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-xl hover:bg-surface-hover transition-all text-muted-foreground hover:text-error">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
