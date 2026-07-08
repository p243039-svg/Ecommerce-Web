import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
export function Modal({ isOpen, onClose, title, children, className, size = "md", }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape")
                onClose();
        };
        if (isOpen)
            document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const sizes = {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}/>
      {/* Modal Content */}
      <div className={cn("relative w-full bg-surface rounded-2xl shadow-2xl animate-scale-in", "border border-border", sizes[size], className)}>
        {title && (<div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-hover transition-colors">
              <X className="w-5 h-5 text-muted-foreground"/>
            </button>
          </div>)}
        <div className="p-6">{children}</div>
      </div>
    </div>);
}
