import React from "react";
import { Sparkles, Zap, ShieldCheck, Globe } from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";
export function Ticker() {
    const settings = useSettingsStore();
    return (<div className="bg-surface text-foreground py-3 overflow-hidden border-b border-border/50 relative z-50 shadow-sm">
      <div className="flex animate-marquee whitespace-nowrap">
        {[1, 2, 3].map((i) => (<div key={i} className="flex items-center gap-12 px-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary"/>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">NEW EDITION NO. 01 — SPRING 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary"/>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">COMPLIMENTARY GLOBAL CONCIERGE SHIPPING</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary"/>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">EXCLUSIVE VIP DROP ACCESS NOW OPEN</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary"/>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">AUTHENTICITY GUARANTEED — {settings.storeName.toUpperCase()} CERTIFIED</span>
            </div>
          </div>))}
      </div>
    </div>);
}
