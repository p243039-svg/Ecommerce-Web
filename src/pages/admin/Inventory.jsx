import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/stores/useToastStore";
import { Search, AlertTriangle, RefreshCw, Edit2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
export default function InventoryPage() {
    const [items, setItems] = useState([]);
    const [useVariants, setUseVariants] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const addToast = useToastStore((s) => s.addToast);
    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            // 1. Try to fetch from variants first
            const { data: variantData } = await supabase
                .from("product_variants")
                .select(`*, product:products(name, brand, id)`)
                .order("stock_quantity", { ascending: true });
            if (variantData && variantData.length > 0) {
                setItems(variantData);
                setUseVariants(true);
            }
            else {
                // 2. If no variants, show base products stock
                const { data: productData } = await supabase
                    .from("products")
                    .select("id, name, brand, stock_quantity")
                    .order("stock_quantity", { ascending: true });
                setItems(productData || []);
                setUseVariants(false);
            }
        }
        catch (err) {
            addToast({ type: "error", title: "Inventory error", description: err.message });
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchInventory();
    }, []);
    const filtered = items.filter(v => {
        const name = v.product?.name || v.name || "";
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const stock = v.stock_quantity || 0;
        if (filterType === "low")
            return matchesSearch && stock > 0 && stock <= 5;
        if (filterType === "out")
            return matchesSearch && stock === 0;
        return matchesSearch;
    });
    return (<div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Global Inventory</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {useVariants
            ? `Monitoring ${items.length} unique variants`
            : `Viewing stock for ${items.length} master products`}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchInventory} isLoading={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2"/>
          Reload
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <button onClick={() => setFilterType("all")} className={cn("flex-1 p-4 rounded-2xl border transition-all text-left", filterType === "all" ? "bg-black text-white" : "bg-white")}>
          <p className="text-[10px] uppercase font-black opacity-60">Total Items</p>
          <p className="text-2xl font-black mt-1">{items.length}</p>
        </button>
        <button onClick={() => setFilterType("low")} className={cn("flex-1 p-4 rounded-2xl border transition-all text-left", filterType === "low" ? "bg-warning text-white" : "bg-white text-warning")}>
          <p className="text-[10px] uppercase font-black opacity-60">Low Stock</p>
          <p className="text-2xl font-black mt-1">{items.filter(v => v.stock_quantity > 0 && v.stock_quantity <= 5).length}</p>
        </button>
        <button onClick={() => setFilterType("out")} className={cn("flex-1 p-4 rounded-2xl border transition-all text-left", filterType === "out" ? "bg-error text-white" : "bg-white text-error")}>
          <p className="text-[10px] uppercase font-black opacity-60">Out of Stock</p>
          <p className="text-2xl font-black mt-1">{items.filter(v => v.stock_quantity === 0).length}</p>
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search inventory..." className="pl-10 h-12"/>
      </div>

      <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-8 py-5 text-xs font-black uppercase tracking-widest">Item Name</th>
              <th className="text-left px-8 py-5 text-xs font-black uppercase tracking-widest">Structure</th>
              <th className="text-left px-8 py-5 text-xs font-black uppercase tracking-widest">Stock Level</th>
              <th className="text-right px-8 py-5 text-xs font-black uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((v) => (<tr key={v.id} className="hover:bg-muted/30">
                <td className="px-8 py-5">
                  <p className="text-sm font-bold">{v.product?.name || v.name}</p>
                  <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">{v.product?.brand || v.brand}</p>
                </td>
                <td className="px-8 py-5">
                  {useVariants ? (<div className="flex gap-2">
                      <Badge variant="secondary">{v.size}</Badge>
                      <Badge variant="outline">{v.color}</Badge>
                    </div>) : (<Badge variant="secondary" className="bg-primary/5 text-primary">Master Piece</Badge>)}
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-black", v.stock_quantity === 0 ? "text-error" : v.stock_quantity <= 5 ? "text-warning" : "")}>
                       {v.stock_quantity} Units
                    </span>
                    {v.stock_quantity <= 5 && <AlertTriangle className="w-4 h-4 text-warning"/>}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <Link to={`/admin/products/${v.product?.id || v.id}`}>
                    <button className="p-2 rounded-lg hover:bg-black hover:text-white transition-all"><Edit2 className="w-4 h-4"/></button>
                  </Link>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>);
}
