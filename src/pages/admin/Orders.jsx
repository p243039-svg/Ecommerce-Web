import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { useToastStore } from "@/stores/useToastStore";
import { Search, Filter, MoreVertical, Truck, Package, CheckCircle2, Clock, AlertCircle } from "lucide-react";
const statusConfig = {
    pending: { label: "Pending", variant: "warning", icon: Clock },
    processing: { label: "Processing", variant: "gold", icon: Package },
    shipped: { label: "Shipped", variant: "default", icon: Truck },
    delivered: { label: "Delivered", variant: "success", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", variant: "error", icon: AlertCircle },
};
export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const addToast = useToastStore((s) => s.addToast);
    const [statusFilter, setStatusFilter] = useState(null);
    const stats = [
        { id: "pending", label: "Pending", icon: Clock, color: "bg-warning/10 text-warning", border: "border-warning/20" },
        { id: "processing", label: "Processing", icon: Package, color: "bg-gold/10 text-gold", border: "border-gold/20" },
        { id: "shipped", label: "Shipped", icon: Truck, color: "bg-primary/10 text-primary", border: "border-primary/20" },
        { id: "delivered", label: "Delivered", icon: CheckCircle2, color: "bg-success/10 text-success", border: "border-success/20" },
    ];
    const fetchOrders = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("orders")
            .select("*, items:order_items(*)")
            .order("created_at", { ascending: false });
        if (error) {
            addToast({ type: "error", title: "Failed to fetch orders", description: error.message });
        }
        else {
            setOrders(data || []);
        }
        setIsLoading(false);
    };
    useEffect(() => {
        fetchOrders();
        // Subscribe to real-time changes
        const channel = supabase
            .channel("admin-orders")
            .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
            fetchOrders();
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
    const updateStatus = async (orderId, status) => {
        const { error } = await supabase
            .from("orders")
            .update({ status })
            .eq("id", orderId);
        if (error) {
            addToast({ type: "error", title: "Update failed", description: error.message });
        }
        else {
            addToast({
                type: "success",
                title: "Order updated",
                description: `Status changed to ${status}`,
            });
            fetchOrders();
        }
    };
    const filtered = orders.filter((o) => {
        const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    return (<div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Order Queue</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Managing {orders.length} active transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
            {statusFilter && (<Button variant="ghost" size="sm" onClick={() => setStatusFilter(null)} className="text-xs">
                Clear Filter
              </Button>)}
           <Button variant="secondary" size="sm" onClick={fetchOrders} isLoading={isLoading}>
             Refresh
           </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
            const count = orders.filter(o => o.status === stat.id).length;
            const isActive = statusFilter === stat.id;
            return (<button key={stat.id} onClick={() => setStatusFilter(isActive ? null : stat.id)} className={cn("bg-surface p-5 rounded-3xl border transition-all duration-300 text-left group hover:shadow-lg", isActive ? cn(stat.border, "ring-2 ring-primary/20 bg-primary/5 shadow-md scale-105 z-10") : "border-border")}>
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl transition-colors", stat.color)}>
                  <stat.icon className="w-6 h-6"/>
                </div>
                <span className="text-3xl font-black tabular-nums tracking-tighter">{count}</span>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
            </button>);
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by ID, name or email..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"/>
        </div>
        <Button variant="secondary" className="rounded-xl">
          <Filter className="w-4 h-4"/>
          Filter
        </Button>
      </div>

      {/* Orders Table */}
      {/* Orders Container */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        {/* Mobile View: Order Cards */}
        <div className="lg:hidden divide-y divide-border">
          {filtered.map((order) => {
            const config = statusConfig[order.status];
            return (<div key={order.id} className="p-5 space-y-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <Badge variant={config.variant} className="text-[9px] font-black italic tracking-widest leading-none px-3 py-1.5 ring-2 ring-white">
                    {config.label.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between py-2 border-y border-border/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{order.full_name}</span>
                    <span className="text-[10px] text-muted-foreground">{order.email}</span>
                  </div>
                  <span className="text-base font-black text-gray-900 tabular-nums">
                    {formatPrice(order.total)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">{order.payment_method}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className={cn("px-4 py-2 rounded-xl border border-border bg-white text-xs font-black focus:outline-none shadow-sm", order.status === "pending" && "text-warning", order.status === "processing" && "text-gold", order.status === "shipped" && "text-primary", order.status === "delivered" && "text-success")}>
                        <option value="pending">PENDING</option>
                        <option value="processing">PROCESSING</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                   </div>
                </div>
              </div>);
        })}
        </div>

        {/* Desktop View: Professional Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Order ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">
                  Customer
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Total
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
            const config = statusConfig[order.status];
            return (<tr key={order.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {order.payment_method.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{order.full_name}</span>
                        <span className="text-[10px] text-muted-foreground">{order.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-foreground tabular-nums">
                        {formatPrice(order.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={config.variant} className="font-bold tracking-tighter shadow-sm">
                        {config.label.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className={cn("px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-bold focus:outline-none transition-all", order.status === "pending" && "border-warning/50 text-warning", order.status === "processing" && "border-gold/50 text-gold", order.status === "shipped" && "border-primary/50 text-primary", order.status === "delivered" && "border-success/50 text-success")}>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <MoreVertical className="w-4 h-4"/>
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
