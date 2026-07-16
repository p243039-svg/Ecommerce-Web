import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, ArrowUpRight, AlertTriangle, CheckCircle2, Clock, Truck } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const [prodRes, orderRes] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false }).limit(50),
    ]);
    if (prodRes.data) setProducts(prodRes.data);
    if (orderRes.data) setOrders(orderRes.data);
    setIsLoading(false);
  };

  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const uniqueCustomers = new Set(orders.map((o) => o.email)).size;
  const activeProducts = products.filter((p) => p.is_active).length;
  const lowStock = products.filter((p) => p.is_active && p.stock_quantity > 0 && p.stock_quantity <= 5);
  const outOfStock = products.filter((p) => p.is_active && p.stock_quantity === 0);

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", change: `${deliveredOrders.length} fulfilled orders`, up: true },
    { label: "Total Orders", value: orders.length.toString(), icon: ShoppingCart, iconBg: "bg-blue-100", iconColor: "text-blue-600", change: `${pendingCount} pending`, up: pendingCount > 0 },
    { label: "Customers", value: uniqueCustomers.toString(), icon: Users, iconBg: "bg-purple-100", iconColor: "text-purple-600", change: "Lifetime unique", up: true },
    { label: "Active Products", value: activeProducts.toString(), icon: Package, iconBg: "bg-amber-100", iconColor: "text-amber-600", change: `${lowStock.length} low stock`, up: lowStock.length === 0 },
  ];

  // Build monthly revenue chart (last 6 months)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthOrders = orders.filter((o) => {
      const od = new Date(o.created_at);
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear() && o.status === "delivered";
    });
    return {
      label: d.toLocaleDateString("en", { month: "short" }),
      value: monthOrders.reduce((s, o) => s + Number(o.total), 0),
    };
  });
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back — here's what's happening at ANTIQUE.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-emerald-600" : "text-amber-600"}`}>
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{isLoading ? "—" : stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800">Revenue Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months delivered orders</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              Live data
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthlyRevenue.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[9px] text-slate-500">{m.value > 0 ? formatPrice(m.value) : ""}</span>
                <div
                  className="w-full bg-amber-400 hover:bg-amber-500 rounded-t-lg transition-colors cursor-default"
                  style={{ height: `${Math.max((m.value / maxRevenue) * 100, 4)}%` }}
                  title={`${m.label}: ${formatPrice(m.value)}`}
                />
                <span className="text-[10px] text-slate-500 font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Stock Alerts
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {outOfStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-100">
                <p className="text-xs font-medium text-slate-700 truncate pr-2">{p.name}</p>
                <span className="text-[9px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded-full shrink-0">Out</span>
              </div>
            ))}
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-xs font-medium text-slate-700 truncate pr-2">{p.name}</p>
                <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">{p.stock_quantity} left</span>
              </div>
            ))}
            {outOfStock.length === 0 && lowStock.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-sm text-slate-500">All products well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.slice(0, 8).map((order) => (
            <div key={order.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-slate-500">{order.full_name || order.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold text-slate-800">{formatPrice(order.total)}</p>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-500"}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
