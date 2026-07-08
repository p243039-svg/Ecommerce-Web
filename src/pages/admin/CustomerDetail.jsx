import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDate } from "@/lib/utils";
import { useToastStore } from "@/stores/useToastStore";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, Clock, ChevronRight, Package } from "lucide-react";
import { Link } from "react-router-dom";
const statusConfig = {
    pending: { label: "Pending", variant: "warning" },
    processing: { label: "Processing", variant: "gold" },
    shipped: { label: "Shipped", variant: "default" },
    delivered: { label: "Delivered", variant: "success" },
    cancelled: { label: "Cancelled", variant: "error" },
};
export default function CustomerProfilePage() {
    const params = useParams();
    const navigate = useNavigate();
    const email = decodeURIComponent(params.email);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const addToast = useToastStore((s) => s.addToast);
    useEffect(() => {
        if (email)
            fetchCustomerData();
    }, [email]);
    const fetchCustomerData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("orders")
            .select("*, items:order_items(*)")
            .eq("email", email)
            .order("created_at", { ascending: false });
        if (error) {
            addToast({ type: "error", title: "Failed to fetch data", description: error.message });
        }
        else {
            setOrders(data || []);
        }
        setIsLoading(false);
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>);
    }
    if (orders.length === 0) {
        return (<div className="min-h-screen flex flex-col items-center justify-center p-8 gap-6 animate-fade-in">
        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
            <Mail className="w-10 h-10 text-muted-foreground"/>
        </div>
        <div className="text-center">
           <h1 className="text-2xl font-bold">No Records Found</h1>
           <p className="text-muted-foreground mt-2">We couldn't find any orders for {email}.</p>
        </div>
        <Link to="/admin/customers">
            <Button variant="secondary">Back to Network</Button>
        </Link>
      </div>);
    }
    const latestOrder = orders[0];
    const totalSpend = orders.reduce((sum, o) => sum + Number(o.total), 0);
    return (<div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/customers">
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2"/>
            Network
          </Button>
        </Link>
        <div className="h-6 w-px bg-border"/>
        <h1 className="text-xl font-bold tracking-tight">{email}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100%]"/>
            
            <div className="w-24 h-24 rounded-[2rem] bg-black flex items-center justify-center mb-6 shadow-xl relative">
              <span className="text-white text-3xl font-black">{latestOrder.full_name.charAt(0)}</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-1">{latestOrder.full_name}</h2>
            <p className="text-sm text-muted-foreground mb-8">Customer since {formatDate(orders[orders.length - 1].created_at)}</p>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-muted-foreground"/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Contact Email</p>
                  <p className="text-sm font-bold truncate max-w-[180px]">{email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-muted-foreground"/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Phone Line</p>
                  <p className="text-sm font-bold">{latestOrder.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-muted-foreground"/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Primary Location</p>
                  <p className="text-sm font-bold">{latestOrder.city}, {latestOrder.country}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{latestOrder.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Relationship Metrics */}
          <div className="bg-black text-white rounded-[2.5rem] p-8 shadow-xl">
             <div className="grid grid-cols-1 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="w-4 h-4 text-primary"/>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Revenue Generation</span>
                    </div>
                    <p className="text-4xl font-black tabular-nums tracking-tighter">{formatPrice(totalSpend)}</p>
                </div>
                <div className="h-px bg-white/10"/>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-success"/>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Transactions</span>
                    </div>
                    <p className="text-4xl font-black tabular-nums tracking-tighter">{orders.length}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary"/>
              Comprehensive Transaction History
            </h3>

            <div className="space-y-6">
              {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            return (<div key={order.id} className="group border-b border-border/50 last:border-0 pb-6 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                           <span className="text-sm font-black">#{order.id.slice(0, 4)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Order ID: {order.id.slice(0, 12).toUpperCase()}...</p>
                          <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={config.variant} className="font-bold tracking-tight">
                          {config.label.toUpperCase()}
                        </Badge>
                        <span className="text-lg font-black text-foreground tabular-nums">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                    
                    {/* Items Preview */}
                    <div className="pl-16 flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (<div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/20 text-[10px] font-bold border border-border/30">
                              <span className="text-primary">{item.quantity}x</span>
                              <span className="truncate max-w-[120px]">{item.product_name}</span>
                           </div>))}
                    </div>

                    <div className="mt-4 flex justify-end">
                       <Link to="/admin/orders">
                          <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest">
                             Go to Fulfillment Center
                             <ChevronRight className="w-3 h-3 ml-1"/>
                          </Button>
                       </Link>
                    </div>
                  </div>);
        })}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
