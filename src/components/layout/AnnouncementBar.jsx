import React from "react";
import { Sparkles, ShoppingBag, Truck } from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";
const AnnouncementBar = () => {
    const settings = useSettingsStore();
    const announcements = [
        { icon: Sparkles, text: `20% FLAT DISCOUNT ON ALL ITEMS — USE CODE ${settings.storeName.toUpperCase()}20` },
        { icon: ShoppingBag, text: "LIMITED TIME ONLY — SPRING COLLECTION DROPPING SOON" },
        { icon: Truck, text: `FREE GLOBAL SHIPPING ON ORDERS OVER $${settings.freeShippingThreshold}` },
    ];
    return (<div className="relative w-full bg-black/30 backdrop-blur-sm overflow-hidden py-2 border-b border-white/10 z-[100]">
      {/* Container for the sliding effect */}
      <div className="flex whitespace-nowrap animate-marquee group">
        {[1, 2, 3, 4].map((setIndex) => (<div key={setIndex} className="flex items-center gap-12 sm:gap-16 px-6 sm:px-8">
            {announcements.map((ann, i) => (<div key={`${setIndex}-${i}`} className="flex items-center gap-3 text-white/90">
                <ann.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5px]"/>
                <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase">
                  {ann.text}
                </span>
              </div>))}
          </div>))}
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>);
};
export default AnnouncementBar;
