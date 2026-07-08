import React from "react";
import { cn } from "@/lib/utils";
export function Badge({ variant = "default", size = "sm", children, className, }) {
    const variants = {
        default: "bg-muted text-muted-foreground",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        error: "bg-error/10 text-error",
        gold: "bg-primary/10 text-primary",
        secondary: "bg-surface text-foreground border border-border",
        outline: "border border-border text-foreground bg-transparent",
    };
    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
    };
    return (<span className={cn("inline-flex items-center font-medium rounded-full", variants[variant], sizes[size], className)}>
      {children}
    </span>);
}
