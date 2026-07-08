import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/stores/useToastStore";
import { Search, Package, AlertTriangle, RefreshCw, Edit, Trash2, Box } from "lucide-react";

import { Link } from "react-router-dom";
import { cn, formatPrice } from "@/lib/utils";
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
            // 1. Try variants
            const { data: vData } = await supabase
                .from("product_variants")
                .select(`*, product:products(*, images:product_images(*))`)
                .order("stock_quantity", { ascending: true });
            if (vData && vData.length > 0) {
                setItems(vData);
                setUseVariants(true);
            }
            else {
                // 2. Base products
                const { data: pData } = await supabase
                    .from("products")
                    .select(`*, images:product_images(*)`)
                    .order("stock_quantity", { ascending: true });
                setItems(pData || []);
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
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || (v.sku && v.sku.toLowerCase().includes(searchQuery.toLowerCase()));
        const stock = v.stock_quantity || 0;
        if (filterType === "low")
            return matchesSearch && stock > 0 && stock <= 5;
        if (filterType === "out")
            return matchesSearch && stock === 0;
        return matchesSearch;
    });
    return (<div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">GLOBAL LEDGER</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
             Managing {items.length} unique storage allocations
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchInventory} isLoading={isLoading} className="rounded-xl border-border">
          <RefreshCw className="w-4 h-4 mr-2"/>
          Synchronize
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => setFilterType("all")} className={cn("p-6 rounded-[2rem] border transition-all text-left group", filterType === "all" ? "bg-black text-white" : "bg-white hover:border-black/20")}>
          <p className="text-[10px] uppercase font-black tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Total Inventory</p>
          <p className="text-3xl font-black mt-1 tabular-nums">{items.length}</p>
        </button>
        <button onClick={() => setFilterType("low")} className={cn("p-6 rounded-[2rem] border transition-all text-left group", filterType === "low" ? "bg-warning text-white" : "bg-white text-warning hover:bg-warning/5")}>
          <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Low Stock Alerts</p>
          <p className="text-3xl font-black mt-1 tabular-nums">{items.filter(v => (v.stock_quantity || 0) > 0 && (v.stock_quantity || 0) <= 5).length}</p>
        </button>
        <button onClick={() => setFilterType("out")} className={cn("p-6 rounded-[2rem] border transition-all text-left group", filterType === "out" ? "bg-error text-white" : "bg-white text-error hover:bg-error/5")}>
          <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Exhausted Stock</p>
          <p className="text-3xl font-black mt-1 tabular-nums">{items.filter(v => (v.stock_quantity || 0) === 0).length}</p>
        </button>
      </div>

      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary"/>
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Ledger by Name, SKU or ID..." className="pl-12 h-14 rounded-2xl border-border bg-surface shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"/>
      </div>

      <div className="bg-surface rounded-[2.5rem] border border-border overflow-hidden shadow-2xl shadow-black/5">
        {/* Mobile View: High-End Cards */}
        <div className="lg:hidden divide-y divide-border">
          {filtered.map((v) => {
            const prod = v.product || v;
            const img = prod.images?.[0]?.url || "/placeholder.jpg";
            return (<div key={v.id} className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="relative w-20 h-24 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                    <img src={img} alt={prod.name}  className="object-cover absolute inset-0 w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-foreground truncate">{prod.name}</h3>
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mt-1">{prod.brand}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                       <Badge variant={(v.stock_quantity || 0) === 0 ? "error" : (v.stock_quantity || 0) <= 5 ? "warning" : "success"} className="text-[9px] font-black px-2 py-0.5">
                         {v.stock_quantity || 0} STOCK
                       </Badge>
                       {useVariants && (<Badge variant="gold" className="text-[9px] font-black px-2 py-0.5">{v.size}</Badge>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                   <span className="text-lg font-black text-gray-900">{formatPrice(prod.price)}</span>
                   <div className="flex items-center gap-2">
                      <Link to={`/admin/products/${prod.id}`}>
                        <button className="p-3 rounded-xl bg-muted/50 text-foreground hover:bg-black hover:text-white transition-all">
                          <Edit className="w-4 h-4"/>
                        </button>
                      </Link>
                      <button className="p-3 rounded-xl bg-error/5 text-error hover:bg-error hover:text-white transition-all">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                   </div>
                </div>
              </div>);
        })}
        </div>

        {/* Desktop View: Professional Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Allocation Details</th>
                <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Pricing</th>
                <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Logistics</th>
                <th className="text-right px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((v) => {
            const prod = v.product || v;
            const img = prod.images?.[0]?.url || "/placeholder.jpg";
            return (<tr key={v.id} className="hover:bg-muted/30 group transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="relative w-16 h-20 rounded-2xl overflow-hidden shadow-sm ring-1 ring-border/50 group-hover:scale-105 transition-transform duration-500">
                          <img src={img} alt={prod.name}  className="object-cover absolute inset-0 w-full h-full object-cover" sizes="64px"/>
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground leading-tight">{prod.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{prod.brand}</p>
                            <span className="w-1 h-1 rounded-full bg-border"/>
                            <p className="text-[10px] font-mono text-muted-foreground opacity-40">ID: {v.id.slice(0, 8)}</p>
                          </div>
                          {useVariants && (<div className="flex gap-1.5 mt-2">
                              <Badge variant="gold" className="text-[8px] font-black px-1.5 py-0.5">{v.size}</Badge>
                              <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0.5 border-border">{v.color}</Badge>
                            </div>)}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground">{formatPrice(prod.price)}</span>
                        {prod.compare_at_price && (<span className="text-[10px] text-muted-foreground line-through opacity-40">{formatPrice(prod.compare_at_price)}</span>)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={(v.stock_quantity || 0) === 0 ? "error" : (v.stock_quantity || 0) <= 5 ? "warning" : "success"} className="font-black text-[9px] px-3 py-1">
                            {(v.stock_quantity || 0)} UNITS AVAILABLE
                          </Badge>
                          {(v.stock_quantity || 0) <= 5 && (v.stock_quantity || 0) > 0 && <AlertTriangle className="w-4 h-4 text-warning animate-pulse"/>}
                        </div>
                        {!useVariants && (<div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">
                            <Box className="w-3 h-3"/> Masterpiece
                          </div>)}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <Link to={`/admin/products/${prod.id}`}>
                            <button className="p-3 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm border border-border group-hover:border-black/20">
                              <Edit className="w-4 h-4"/>
                            </button>
                         </Link>
                         <button className="p-3 rounded-xl hover:bg-error/10 hover:text-error transition-all shadow-sm border border-border">
                            <Trash2 className="w-4 h-4"/>
                         </button>
                      </div>
                    </td>
                  </tr>);
        })}
              {filtered.length === 0 && (<tr>
                  <td colSpan={4} className="px-8 py-32 text-center bg-muted/5">
                    <div className="max-w-xs mx-auto">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                         <Package className="w-10 h-10 text-muted-foreground/30"/>
                      </div>
                      <h3 className="text-xl font-black text-foreground tracking-tight">Ledger Empty</h3>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">No inventory allocations match your refined search criteria.</p>
                      <Button variant="secondary" onClick={() => setSearchQuery("")} className="mt-8 rounded-full">Clear Search</Button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
