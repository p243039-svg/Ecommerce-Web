import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { DollarSign, ShoppingCart, Package, TrendingUp, ArrowUpRight, } from "lucide-react";
export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetchDashboardData();
    }, []);
    const fetchDashboardData = async () => {
        setIsLoading(true);
        const [prodRes, orderRes, customerRes] = await Promise.all([
            supabase.from("products").select("*"),
            supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false }),
            supabase.from("orders").select("email", { count: "exact" }),
        ]);
        if (prodRes.data)
            setProducts(prodRes.data);
        if (orderRes.data)
            setOrders(orderRes.data);
        setIsLoading(false);
    };
    const deliveredOrders = orders.filter(o => o.status === "delivered");
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.email)).size;
    const activeProducts = products.filter((p) => p.is_active).length;
    const pendingOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const lowStock = products.filter((p) => p.is_active && p.stock_quantity > 0 && p.stock_quantity <= 5);
    const outOfStock = products.filter((p) => p.is_active && p.stock_quantity === 0);
    const stats = [
        {
            label: "Total Revenue",
            value: formatPrice(totalRevenue),
            icon: DollarSign,
            change: `+${((totalRevenue / 1000) * 100).toFixed(1)}%`,
            color: "text-success",
        },
        {
            label: "Total Orders",
            value: totalOrders.toString(),
            icon: ShoppingCart,
            change: `${orders.filter(o => o.status === 'pending').length} New`,
            color: "text-warning",
        },
        {
            label: "Happy Customers",
            value: uniqueCustomers.toString(),
            icon: TrendingUp,
            change: "Lifetime",
            color: "text-primary",
        },
        {
            label: "Active Items",
            value: activeProducts.toString(),
            icon: Package,
            change: `${lowStock.length} Low stock`,
            color: "text-error",
        },
    ];
    return (<div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter uppercase">Atelier Insights</h1>
        <p className="text-[10px] sm:text-xs font-black text-amber-700 uppercase tracking-widest mt-1">Experience the pulse of your brand</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (<div key={i} className="bg-surface rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary"/>
              </div>
              <span className={`text-xs font-medium ${stat.color} flex items-center gap-0.5`}>
                {stat.change}
                <ArrowUpRight className="w-3 h-3"/>
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
          </div>))}
      </div>

      {/* Revenue Chart (Simplified) */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <h2 className="text-sm sm:text-lg font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-tight">
          <TrendingUp className="w-5 h-5 text-amber-700"/>
          Revenue Performance
        </h2>
        <div className="flex items-end gap-1 sm:gap-2 h-32 sm:h-48">
          {[65, 45, 78, 52, 90, 68, 85, 72, 95, 60, 82, 88].map((val, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-colors" style={{ height: `${val}%` }}/>
              <span className="text-[9px] text-muted-foreground">
                {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
              </span>
            </div>))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Orders
          </h2>
          <div className="space-y-3">
            {orders.map((order) => (<div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items?.length || 0} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    {formatPrice(order.total)}
                  </p>
                  <Badge variant={order.status === "delivered"
                ? "success"
                : order.status === "processing"
                    ? "gold"
                    : "default"}>
                    {order.status}
                  </Badge>
                </div>
              </div>))}
            {orders.length === 0 && (<p className="text-sm text-muted-foreground py-4 text-center">No recent orders</p>)}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Stock Alerts
          </h2>
          <div className="space-y-3">
            {outOfStock.map((p) => (<div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-error/5">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <Badge variant="error">Out of Stock</Badge>
              </div>))}
            {lowStock.map((p) => (<div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-warning/5">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <Badge variant="warning">{p.stock_quantity} left</Badge>
              </div>))}
            {outOfStock.length === 0 && lowStock.length === 0 && (<p className="text-sm text-muted-foreground">All products well stocked!</p>)}
          </div>
        </div>
      </div>
    </div>);
}
