import React from "react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/stores/useToastStore";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();
    if (toasts.length === 0)
        return null;
    return (<div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (<div key={toast.id} className={cn("flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-slide-up", "bg-surface border-border")}>
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === "success" && (<CheckCircle className="w-5 h-5 text-success"/>)}
            {toast.type === "error" && (<XCircle className="w-5 h-5 text-error"/>)}
            {toast.type === "warning" && (<AlertTriangle className="w-5 h-5 text-warning"/>)}
            {toast.type === "info" && (<Info className="w-5 h-5 text-primary"/>)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{toast.title}</p>
            {toast.description && (<p className="mt-0.5 text-xs text-muted-foreground">
                {toast.description}
              </p>)}
          </div>
          <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 p-0.5 rounded hover:bg-surface-hover transition-colors">
            <X className="w-4 h-4 text-muted-foreground"/>
          </button>
        </div>))}
    </div>);
}
