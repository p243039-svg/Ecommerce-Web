import React from "react";
import { cn } from "@/lib/utils";
export function Input({ label, error, icon, className, id, ...props }) {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");
    return (<div className={cn("w-full transition-all duration-300", error && "animate-shake")}>
      {label && (<label htmlFor={inputId} className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 px-1">
          {label}
        </label>)}
      <div className="relative group">
        {icon && (<div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-amber-700 transition-colors duration-300">
            {icon}
          </div>)}
        <input id={inputId} className={cn("w-full rounded-2xl border border-border bg-white px-5 py-3.5 text-sm text-foreground", "placeholder:text-muted-foreground/50 placeholder:font-medium", "focus:outline-none focus:ring-4 focus:ring-amber-700/5 focus:border-amber-700/40", "shadow-sm hover:shadow-md transition-all duration-300", "disabled:opacity-50 disabled:cursor-not-allowed", icon && "pl-11", error && "border-red-500/50 focus:ring-red-500/5", className)} {...props}/>
      </div>
      {error && (<p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest px-1 animate-slide-up">
          {error}
        </p>)}
    </div>);
}
