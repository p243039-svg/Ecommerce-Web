import React from "react";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { X, Bell, Info, CheckCircle2, AlertTriangle, XCircle, Trash2, Clock } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
export function NotificationDrawer({ isOpen, onClose }) {
    const { notifications, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotificationStore();
    const iconMap = {
        info: <Info className="w-4 h-4 text-primary"/>,
        success: <CheckCircle2 className="w-4 h-4 text-success"/>,
        warning: <AlertTriangle className="w-4 h-4 text-warning"/>,
        error: <XCircle className="w-4 h-4 text-error"/>,
    };
    const bgMap = {
        info: "bg-primary/10",
        success: "bg-success/10",
        warning: "bg-warning/10",
        error: "bg-error/10",
    };
    return (<>
      {/* Overlay */}
      {isOpen && (<div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] transition-opacity duration-500 animate-fade-in" onClick={onClose}/>)}

      {/* Drawer */}
      <aside className={cn("fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[101] transition-transform duration-500 ease-in-out border-l border-border", isOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center">
                <Bell className="w-5 h-5 text-white"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-1">
                  System Alerts & Updates
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (<div className="px-6 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
              <button onClick={markAllAsRead} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">
                Mark all as read
              </button>
              <button onClick={clearAll} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-error transition-all flex items-center gap-1">
                <Trash2 className="w-3 h-3"/>
                Clear all
              </button>
            </div>)}

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {notifications.length > 0 ? (notifications.map((n) => (<div key={n.id} onClick={() => markAsRead(n.id)} className={cn("p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden", n.isRead ? "bg-white border-border opacity-70" : "bg-white border-primary/20 shadow-lg shadow-black/5")}>
                  {!n.isRead && (<div className="absolute top-0 left-0 w-1.5 h-full bg-primary"/>)}
                  
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", bgMap[n.type])}>
                      {iconMap[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={cn("text-sm font-bold truncate", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                          {n.title}
                        </h3>
                        <button onClick={(e) => {
                e.stopPropagation();
                clearNotification(n.id);
            }} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-muted transition-all">
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-error"/>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">
                         <Clock className="w-3 h-3"/>
                         {formatDate(n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>))) : (<div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                  <Bell className="w-10 h-10 text-muted-foreground opacity-20"/>
                </div>
                <h3 className="text-lg font-bold text-foreground">Quiet in here...</h3>
                <p className="text-sm text-muted-foreground max-w-[200px] mt-2 leading-relaxed">
                  You're all caught up! No new notifications at the moment.
                </p>
              </div>)}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/10">
            <Button variant="secondary" className="w-full rounded-2xl" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      </aside>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e2e2;
          border-radius: 10px;
        }
      `}</style>
    </>);
}
