import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDate, isValidUUID } from "@/lib/utils";
import { Package, Lock, ChevronRight, User, LogOut } from "lucide-react";
const statusVariant = {
    pending: "warning",
    processing: "gold",
    shipped: "default",
    delivered: "success",
    cancelled: "error",
};
export default function OrdersPage() {
    const user = useAuthStore((s) => s.user);
    const [orders, setOrders] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        if (user?.id) {
            fetchOrders();
        }
        else {
            setIsLoading(false);
        }
    }, [user]);
    const fetchOrders = async () => {
        setIsLoading(true);
        // Build filter parts safely to avoid 400 error on non-UUID identifiers (like 'admin-id')
        const filterParts = [];
        if (user?.id && isValidUUID(user.id))
            filterParts.push(`user_id.eq.${user.id}`);
        if (user?.email)
            filterParts.push(`email.eq.${user.email}`);
        if (filterParts.length === 0) {
            setOrders([]);
            setIsLoading(false);
            return;
        }
        const { data, error } = await supabase
            .from("orders")
            .select("*, items:order_items(*)")
            .or(filterParts.join(','))
            .order("created_at", { ascending: false });
        if (!error && data) {
            setOrders(data);
        }
        setIsLoading(false);
    };
    if (!user) {
        return (<div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center animate-fade-in">
          <Lock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4"/>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in Required</h1>
          <Link to="/login"><Button size="lg">Sign In</Button></Link>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-[#f4ebe0] relative overflow-hidden font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Subtle Texture Layer */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }}/>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 animate-fade-in">
        <h1 className="text-4xl font-serif text-[#4a3f35] italic mb-10 text-center lg:text-left tracking-tighter">Order History</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#fffdfa] rounded-[32px] border border-[#e2d6c5] p-8 text-center shadow-sm">
              <div className="w-24 h-24 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="text-3xl font-serif italic text-amber-900">
                  {(user.first_name || "?").charAt(0)}{(user.last_name || "").charAt(0)}
                </span>
              </div>
              <h2 className="text-xl font-serif italic text-[#4a3f35]">
                {user.first_name || "Guest"} {user.last_name || ""}
              </h2>
              <p className="text-[11px] font-black text-[#8c7e6c] uppercase tracking-[0.2em] mt-2">{user.email}</p>
              <Badge variant="gold" className="mt-4 px-4 py-1 text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-900 border-amber-200">
                {user.role === "admin" ? "Admin" : "Member"}
              </Badge>
            </div>

            <nav className="bg-[#fffdfa] rounded-[32px] border border-[#e2d6c5] overflow-hidden shadow-sm">
              {[
            { href: "/profile", icon: User, label: "Account Details", active: false },
            { href: "/profile/orders", icon: Package, label: "Order History", active: true },
        ].map((item) => (<Link key={item.href} to={item.href} className={`flex items-center justify-between px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b border-[#e2d6c5]/30 last:border-0 ${item.active
                ? "bg-amber-50/50 text-amber-900"
                : "text-[#8c7e6c] hover:bg-amber-50/20 hover:text-amber-700"}`}>
                  <span className="flex items-center gap-4">
                    <item.icon className="w-4 h-4"/>
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-30"/>
                </Link>))}
            </nav>

            <button onClick={async () => {
            await useAuthStore.getState().logout();
            window.location.href = "/";
        }} className="w-full mt-2 flex items-center justify-center gap-3 px-6 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-amber-900 bg-[#fffdfa] rounded-[32px] hover:bg-red-50 hover:text-red-700 transition-all border border-[#e2d6c5] shadow-sm active:scale-[0.98]">
              <LogOut className="w-4 h-4"/>
              Logout
            </button>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (<div className="space-y-6">
                {[1, 2].map(i => (<div key={i} className="bg-[#fffdfa] rounded-[40px] border border-[#e2d6c5] p-12 h-64 skeleton opacity-50 shadow-sm"/>))}
              </div>) : orders.length === 0 ? (<div className="bg-[#fffdfa] rounded-[40px] border border-[#e2d6c5] p-16 text-center shadow-sm animate-fade-in">
                <Package className="w-12 h-12 text-[#bfb3a0]/30 mx-auto mb-6"/>
                <h2 className="text-2xl font-serif italic text-[#4a3f35] mb-4">No Orders Yet</h2>
                <p className="text-[11px] text-[#8c7e6c] font-black uppercase tracking-[0.2em] mb-8">You haven't placed any orders yet.</p>
                <Link to="/products">
                  <Button className="rounded-2xl h-14 px-10 bg-[#4a3f35] text-[#f4ebe0] font-black uppercase tracking-widest text-[11px] hover:bg-amber-900 shadow-lg">Start Shopping</Button>
                </Link>
              </div>) : (<div className="space-y-6">
                {orders.map((order) => (<div key={order.id} className="bg-[#fffdfa] rounded-[40px] border border-[#e2d6c5] p-8 md:p-12 shadow-sm animate-fade-in hover:border-amber-800 transition-all group">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-8 pb-6 border-b border-[#e2d6c5]/30">
                      <div>
                        <p className="text-[10px] font-black text-amber-900 uppercase tracking-[0.3em] mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[10px] font-black text-[#bfb3a0] uppercase tracking-widest">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <Badge variant={statusVariant[order.status]} size="md" className="bg-amber-50 text-amber-900 border-none font-black text-[8px] uppercase tracking-tighter">
                          {order.status}
                        </Badge>
                        <span className="text-lg font-serif italic text-[#4a3f35]">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {order.items.map((item) => (<div key={item.id} className="flex items-center gap-6">
                          <div className="relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-amber-50/50 border border-amber-100 flex items-center justify-center">
                             <Package className="w-6 h-6 text-[#bfb3a0]/40"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-serif italic text-[#4a3f35] truncate mb-1">
                              {item.product_name}
                            </p>
                            <p className="text-[10px] font-black text-[#8c7e6c] uppercase tracking-widest opacity-60">
                              {item.size} — {item.color} — QTY: {item.quantity}
                            </p>
                          </div>
                          <p className="text-[12px] font-black text-[#4a3f35] tracking-widest">
                            {formatPrice(item.price_at_purchase * item.quantity)}
                          </p>
                        </div>))}
                    </div>
                  </div>))}
              </div>)}
          </div>
        </div>
      </div>
    </div>);
}
