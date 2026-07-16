import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice, cn } from "@/lib/utils";
import { useToastStore } from "@/stores/useToastStore";
import { Search, Loader2, ChevronDown, ChevronUp, Package, Truck, CheckCircle2, Clock, AlertCircle, ShoppingCart } from "lucide-react";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    icon: Clock,         cls: "bg-amber-100 text-amber-700 border-amber-200" },
  processing: { label: "Processing", icon: Package,       cls: "bg-blue-100 text-blue-700 border-blue-200" },
  shipped:    { label: "Shipped",    icon: Truck,         cls: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered:  { label: "Delivered",  icon: CheckCircle2,  cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled:  { label: "Cancelled",  icon: AlertCircle,   cls: "bg-red-100 text-red-700 border-red-200" },
};

const NEXT_STATUS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

function OrderRow({ order, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const nextActions = NEXT_STATUS[order.status] || [];

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
        <td className="px-4 py-3">
          <p className="text-sm font-bold text-slate-800">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm font-medium text-slate-800">{order.full_name}</p>
          <p className="text-xs text-slate-400">{order.email}</p>
        </td>
        <td className="px-4 py-3 text-sm font-bold text-slate-800">{formatPrice(order.total)}</td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase border px-2 py-1 rounded-full ${cfg.cls}`}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1.5">
            {nextActions.map((s) => {
              const sc = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => onUpdateStatus(order.id, s)}
                  className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border transition-all hover:opacity-80 ${sc.cls}`}
                >
                  → {sc.label}
                </button>
              );
            })}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50 border-b border-slate-100">
          <td colSpan={5} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Shipping Address */}
              <div>
                <p className="font-bold text-slate-700 uppercase tracking-wider mb-2">Shipping Address</p>
                <p className="text-slate-600">{order.address}, {order.city}</p>
                <p className="text-slate-600">{order.country} {order.postal_code}</p>
                <p className="text-slate-500 mt-1">Phone: {order.phone}</p>
              </div>
              {/* Order Items */}
              <div>
                <p className="font-bold text-slate-700 uppercase tracking-wider mb-2">Items ({order.items?.length || 0})</p>
                <div className="space-y-1">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-slate-600">{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price_at_purchase * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const addToast = useToastStore((s) => s.addToast);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false });
    if (error) { addToast({ type: "error", title: "Failed to fetch orders" }); }
    else { setOrders(data || []); }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase.channel("admin-orders-v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const updateStatus = async (orderId, status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) { addToast({ type: "error", title: "Update failed" }); }
    else {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      addToast({ type: "success", title: `Order marked as ${status}` });
    }
  };

  const filtered = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.full_name?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Count per status
  const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map((s) => [s, orders.filter((o) => o.status === s).length]));
  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orders.length} total · {formatPrice(totalRevenue)} revenue</p>
        </div>
      </div>

      {/* Status Pipeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).filter(([k]) => k !== "cancelled").map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all hover:shadow-sm",
                statusFilter === key ? `${cfg.cls} shadow-sm` : "bg-white border-slate-200"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${statusFilter === key ? "" : "text-slate-400"}`} />
                <span className={`text-lg font-bold ${statusFilter === key ? "" : "text-slate-700"}`}>{counts[key] || 0}</span>
              </div>
              <p className={`text-[10px] font-black uppercase tracking-wider ${statusFilter === key ? "" : "text-slate-500"}`}>{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order, name or email..."
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
          {statusFilter !== "all" && (
            <button onClick={() => setStatusFilter("all")} className="text-xs text-amber-600 font-semibold hover:text-amber-800">
              Clear filter ×
            </button>
          )}
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} results</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <OrderRow key={order.id} order={order} onUpdateStatus={updateStatus} />
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
