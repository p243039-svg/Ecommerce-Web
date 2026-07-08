import React from "react";
import { X, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
export function SizeChartModal({ isOpen, onClose, category = "Men" }) {
    if (!isOpen)
        return null;
    const sizeData = {
        Men: [
            { size: "S", chest: "36-38", waist: "30-32", neck: "14.5" },
            { size: "M", chest: "39-41", waist: "33-35", neck: "15.5" },
            { size: "L", chest: "42-44", waist: "36-38", neck: "16.5" },
            { size: "XL", chest: "45-47", waist: "39-41", neck: "17.5" },
            { size: "XXL", chest: "48-50", waist: "42-44", neck: "18.5" },
        ],
        Women: [
            { size: "XS", bust: "31-32", waist: "24-25", hip: "34-35" },
            { size: "S", bust: "33-34", waist: "26-27", hip: "36-37" },
            { size: "M", bust: "35-36", waist: "28-29", hip: "38-39" },
            { size: "L", bust: "37-39", waist: "30-32", hip: "40-42" },
            { size: "XL", bust: "40-42", waist: "33-35", hip: "43-45" },
        ],
        Shoes: [
            { size: "8", uk: "7", eu: "41", cm: "25.4" },
            { size: "9", uk: "8", eu: "42", cm: "26.2" },
            { size: "10", uk: "9", eu: "43", cm: "27.1" },
            { size: "11", uk: "10", eu: "44", cm: "27.9" },
            { size: "12", uk: "11", eu: "45", cm: "28.8" },
        ],
    };
    const currentTab = category.toLowerCase().includes("shoes") ? "Shoes" : category.toLowerCase().includes("women") ? "Women" : "Men";
    const data = sizeData[currentTab];
    return (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in group">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl group-hover:bg-background/90 transition-all duration-700" onClick={onClose}/>
      
      <div className="relative w-full max-w-lg bg-surface border border-border shadow-[0_32px_64px_rgba(0,0,0,0.2)] rounded-[2rem] overflow-hidden animate-scale-in mx-2">
        <div className="p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-surface to-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg">
              <Ruler className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground leading-tight">Size Guide</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground opacity-60">
                Measurements ({currentTab})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black hover:text-white transition-all active:scale-90">
            <X className="w-4 h-4"/>
          </button>
        </div>

        <div className="p-5">
          <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-center">
                  {Object.keys(data[0]).map((key) => (<th key={key} className="px-4 py-3 font-black uppercase tracking-widest text-[9px] text-muted-foreground">
                      {key}
                    </th>))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-center">
                {data.map((row, i) => (<tr key={i} className="hover:bg-primary/5 transition-colors">
                    {Object.values(row).map((val, j) => (<td key={j} className={cn("px-4 py-3.5", j === 0 ? "font-black text-primary bg-primary/5" : "text-muted-foreground font-medium")}>
                        {val}
                        {j > 0 && currentTab !== "Shoes" && <span className="text-[9px] ml-0.5 opacity-40">in</span>}
                      </td>))}
                  </tr>))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-muted/20 rounded-2xl border border-dashed border-border flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0"/>
            <p className="text-[11px] text-muted-foreground leading-snug italic">
              Fits may vary by style. If between sizes, we recommend sizing up.
            </p>
          </div>
        </div>

        <div className="p-5 pt-0">
          <button onClick={onClose} className="w-full py-3.5 bg-foreground text-background rounded-xl font-bold hover:bg-primary transition-all active:scale-[0.98] text-sm">
            CLOSE
          </button>
        </div>
      </div>
    </div>);
}
