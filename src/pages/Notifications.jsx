import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { Bell, CheckCircle2, Info, AlertTriangle, Trash2, Package, ArrowRight, User, ShoppingBag } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
export default function NotificationsPage() {
    const { notifications, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotificationStore();
    const unreadCount = useNotificationStore((s) => s.unreadCount());
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted)
        return null;
    const iconMap = {
        info: <Info className="w-5 h-5 text-primary"/>,
        success: <CheckCircle2 className="w-5 h-5 text-success"/>,
        warning: <AlertTriangle className="w-5 h-5 text-warning"/>,
        error: <Trash2 className="w-5 h-5 text-error"/>,
    };
    return (<div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg">
                <Bell className="w-6 h-6 text-white"/>
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground">Activity</h1>
            </div>
            <p className="text-muted-foreground font-medium">
              You have {unreadCount} unread messages in your inbox
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={markAllAsRead}>
                Mark All Read
             </Button>
             <Button variant="ghost" size="sm" className="rounded-xl text-error hover:bg-error/10" onClick={clearAll}>
                <Trash2 className="w-4 h-4 mr-2"/>
                Clear All
             </Button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {notifications.length > 0 ? (notifications.map((n) => (<div key={n.id} onClick={() => markAsRead(n.id)} className={cn("group relative p-6 rounded-[2rem] border transition-all cursor-pointer overflow-hidden", n.isRead
                ? "bg-surface border-border/50 opacity-80"
                : "bg-white border-primary/20 shadow-xl shadow-black/5 ring-1 ring-primary/5")}>
                {!n.isRead && (<div className="absolute top-0 left-0 w-2 h-full bg-primary"/>)}

                <div className="flex items-start gap-6">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110 duration-500", n.isRead ? "bg-muted/50" : "bg-primary/5")}>
                    {iconMap[n.type]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          {formatDate(n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp)}
                       </span>
                       <button onClick={(e) => {
                e.stopPropagation();
                clearNotification(n.id);
            }} className="p-2 rounded-xl hover:bg-error/10 text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100 transition-all">
                         <Trash2 className="w-4 h-4"/>
                       </button>
                    </div>
                    
                    <h3 className={cn("text-lg font-bold mb-1", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>

                    <div className="mt-6 flex items-center gap-4">
                       <Button variant="ghost" size="sm" className="rounded-xl px-0 hover:bg-transparent hover:text-primary group/btn">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1"/>
                       </Button>
                    </div>
                  </div>
                </div>
              </div>))) : (<div className="py-24 text-center bg-surface rounded-[3rem] border border-dashed border-border animate-fade-in shadow-inner">
               <div className="w-24 h-24 rounded-[2.5rem] bg-muted/30 flex items-center justify-center mx-auto mb-8">
                  <Package className="w-10 h-10 text-muted-foreground opacity-20"/>
               </div>
               <h3 className="text-2xl font-bold text-foreground mb-3">All caught up!</h3>
               <p className="text-muted-foreground max-w-xs mx-auto mb-10">
                  Stay tuned for order updates, exclusive offers, and personalized style recommendations.
               </p>
               <Link to="/products">
                  <Button variant="secondary" className="rounded-2xl px-10">
                     BACK TO SHOP
                  </Button>
               </Link>
            </div>)}
        </div>

        {/* Quick Help */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
           <Link to="/profile/orders" className="p-8 rounded-[2rem] bg-black text-white group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"/>
              <ShoppingBag className="w-8 h-8 opacity-40 mb-6"/>
              <h4 className="text-xl font-bold mb-2">Track Orders</h4>
              <p className="text-sm text-white/60 mb-6">Monitor your current shipments and history.</p>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                 <ArrowRight className="w-4 h-4"/>
              </div>
           </Link>
           <Link to="/profile" className="p-8 rounded-[2rem] bg-surface-hover border border-border group">
              <User className="w-8 h-8 text-primary opacity-40 mb-6"/>
              <h4 className="text-xl font-bold mb-2">My Account</h4>
              <p className="text-sm text-muted-foreground mb-6">Manage your preferences and profile.</p>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all">
                 <ArrowRight className="w-4 h-4"/>
              </div>
           </Link>
        </div>
      </div>
    </div>);
}
