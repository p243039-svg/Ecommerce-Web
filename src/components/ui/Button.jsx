import React from "react";
import { cn } from "@/lib/utils";
export function Button({ variant = "primary", size = "md", isLoading = false, className, children, disabled, ...props }) {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96] tracking-tight";
    const variants = {
        primary: "bg-foreground text-background hover:bg-foreground/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]",
        secondary: "bg-surface text-foreground border border-border hover:border-primary/50 hover:bg-surface-hover shadow-sm",
        ghost: "text-foreground hover:bg-muted/50 backdrop-blur-sm",
        danger: "bg-error text-white hover:opacity-90 shadow-md",
        outline: "border-2 border-primary/20 text-primary hover:border-primary hover:bg-primary/5",
        gold: "bg-gradient-to-br from-gold to-gold-light text-white shadow-[0_10px_20px_rgba(184,134,11,0.2)] hover:shadow-[0_15px_25px_rgba(184,134,11,0.3)] hover:-translate-y-0.5",
    };
    const sizes = {
        sm: "px-4 py-2 text-xs gap-2",
        md: "px-6 py-3 text-sm gap-2",
        lg: "px-8 py-4 text-base gap-3",
        xl: "px-10 py-5 text-lg gap-4",
    };
    return (<button className={cn(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className)} disabled={disabled || isLoading} {...props}>
      {isLoading && (<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>)}
      <span className="relative flex items-center gap-2">
        {children}
      </span>
    </button>);
}
