import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatPrice, cn } from "@/lib/utils";
import { useToastStore } from "@/stores/useToastStore";
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Loader2, Package } from "lucide-react";

const STOCK_STATUS = (qty) => {
  if (qty === 0) return { label: "Out of stock", cls: "bg-red-100 text-red-700" };
  if (qty <= 5) return { label: `${qty} left`, cls: "bg-amber-100 text-amber-700" };
  return { label: `${qty} in stock`, cls: "bg-emerald-100 text-emerald-700" };
};

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [filter, setFilter] = useState("all"); // all | active | hidden | low
  const addToast = useToastStore((s) => s.addToast);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, images:product_images(*)")
      .order("created_at", { ascending: false });
    if (error) { addToast({ type: "error", title: "Failed to fetch products", description: error.message }); }
    else { setProducts(data || []); }
    setIsLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && p.is_active) ||
      (filter === "hidden" && !p.is_active) ||
      (filter === "low" && p.stock_quantity <= 5);
    return matchesSearch && matchesFilter;
  });

  const toggleActive = async (id, current) => {
    const { error } = await supabase.from("products").update({ is_active: !current }).eq("id", id);
    if (error) { addToast({ type: "error", title: "Update failed", description: error.message }); }
    else {
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_active: !current } : p));
      addToast({ type: "success", title: `Product ${!current ? "activated" : "hidden"}` });
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product permanently?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { addToast({ type: "error", title: "Delete failed", description: error.message }); }
    else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addToast({ type: "success", title: "Product deleted" });
    }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} products?`)) return;
    setIsBulkDeleting(true);
    const { error } = await supabase.from("products").delete().in("id", selectedIds);
    if (error) { addToast({ type: "error", title: "Bulk delete failed" }); }
    else {
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      addToast({ type: "success", title: "Products deleted" });
    }
    setIsBulkDeleting(false);
  };

  const TABS = [
    { key: "all", label: "All", count: products.length },
    { key: "active", label: "Active", count: products.filter((p) => p.is_active).length },
    { key: "hidden", label: "Hidden", count: products.filter((p) => !p.is_active).length },
    { key: "low", label: "Low Stock", count: products.filter((p) => p.stock_quantity <= 5).length },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} items in catalog</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filter Tabs + Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1 p-3 border-b border-slate-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                filter === tab.key
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              )}
            >
              {tab.label}
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", filter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>
                {tab.count}
              </span>
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 w-48 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={() => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((p) => p.id))}
                      className="w-3.5 h-3.5 rounded accent-amber-500"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const primaryImg = product.images?.find((i) => i.is_primary) || product.images?.[0];
                  const stockInfo = STOCK_STATUS(product.stock_quantity);
                  return (
                    <tr key={product.id} className={cn("border-b border-slate-50 hover:bg-slate-50 transition-colors", selectedIds.includes(product.id) && "bg-amber-50")}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => setSelectedIds((prev) => prev.includes(product.id) ? prev.filter((i) => i !== product.id) : [...prev, product.id])}
                          className="w-3.5 h-3.5 rounded accent-amber-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            {primaryImg ? (
                              <img src={primaryImg.url} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm leading-tight">{product.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{formatPrice(product.price)}</p>
                        {product.compare_at_price && (
                          <p className="text-xs text-slate-400 line-through">{formatPrice(product.compare_at_price)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stockInfo.cls}`}>
                          {stockInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {product.is_active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleActive(product.id, product.is_active)} title={product.is_active ? "Hide" : "Show"} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                            {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <Link to={`/admin/products/${product.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 border border-white/10">
            <span className="text-sm font-semibold">{selectedIds.length} selected</span>
            <div className="w-px h-4 bg-white/20" />
            <button onClick={deleteSelected} disabled={isBulkDeleting} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors disabled:opacity-50">
              {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
            <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-white text-sm transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
