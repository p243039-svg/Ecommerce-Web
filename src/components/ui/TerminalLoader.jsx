import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const BOOT_LINES = [
  "> initializing store core...",
  "> loading catalog module..... OK",
  "> connecting payment gateway..... OK",
  "> syncing inventory data....... OK",
  "> system ready"
];

export function TerminalLoader({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [phase, setPhase] = useState("terminal"); // terminal | terminal-fade | logo-reveal | logo-slide | screen-fade | done

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Typewriter effect for current line
  useEffect(() => {
    if (phase !== "terminal") return;
    if (currentLineIdx >= BOOT_LINES.length) {
      // Pause 200ms after system ready is done, then fade out terminal
      const t = setTimeout(() => {
        setPhase("terminal-fade");
      }, 200);
      return () => clearTimeout(t);
    }

    const fullText = BOOT_LINES[currentLineIdx];
    let charIdx = 0;
    setCurrentText("");

    const interval = setInterval(() => {
      if (charIdx < fullText.length) {
        setCurrentText((prev) => prev + fullText.charAt(charIdx));
        charIdx++;
      } else {
        clearInterval(interval);
        // Completed line, add to completed list
        setLines((prev) => [...prev, fullText]);
        setCurrentText("");
        // Next line after very short pause
        const t = setTimeout(() => {
          setCurrentLineIdx((prev) => prev + 1);
        }, 50);
        return () => clearTimeout(t);
      }
    }, 8); // Fast typing speed to keep within 3.5-4.5s total time

    return () => clearInterval(interval);
  }, [currentLineIdx, phase]);

  // Phase transitions
  useEffect(() => {
    if (phase === "terminal-fade") {
      const t = setTimeout(() => {
        setPhase("logo-reveal");
      }, 300); // 0.3s fade out
      return () => clearTimeout(t);
    }
    if (phase === "logo-reveal") {
      const t = setTimeout(() => {
        setPhase("logo-slide");
      }, 700); // 0.4s scale-in + 0.3s hold
      return () => clearTimeout(t);
    }
    if (phase === "logo-slide") {
      const t = setTimeout(() => {
        setPhase("screen-fade");
      }, 1200); // 0.5s slide + 0.3s typing reveal + 0.4s hold
      return () => clearTimeout(t);
    }
    if (phase === "screen-fade") {
      const t = setTimeout(() => {
        setPhase("done");
        if (onCompleteRef.current) onCompleteRef.current();
      }, 400); // 0.4s screen fade out
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleSkip = () => {
    setPhase("done");
    if (onCompleteRef.current) onCompleteRef.current();
  };

  if (phase === "done") return null;

  const showStats = phase === "logo-slide" || phase === "screen-fade";

  return (
    <div 
      onClick={handleSkip}
      style={{
        background: "radial-gradient(circle at center, rgba(61, 90, 79, 0.15) 0%, rgba(4, 8, 6, 0) 70%), #040806"
      }}
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-400 ease-in-out",
        phase === "screen-fade" ? "opacity-0 pointer-events-none scale-102" : "opacity-100"
      )}
    >
      {/* Corner Bracket: Top-Left (Always visible) */}
      <div className="absolute top-8 left-8 text-[#3d5a4f] opacity-35 select-none font-mono text-lg transition-opacity duration-500">┌</div>
      <div className="absolute top-8 right-8 text-[#3d5a4f] opacity-35 select-none font-mono text-lg transition-opacity duration-500">┐</div>
      <div className="absolute bottom-8 left-8 text-[#3d5a4f] opacity-35 select-none font-mono text-lg transition-opacity duration-500">└</div>
      <div className="absolute bottom-8 right-8 text-[#3d5a4f] opacity-35 select-none font-mono text-lg transition-opacity duration-500">┘</div>

      {/* corner stats visible in reveal stage */}
      <div className={cn(
        "absolute top-16 left-12 font-mono text-[9px] tracking-widest text-[#3d5a4f] select-none uppercase transition-opacity duration-700",
        showStats ? "opacity-35" : "opacity-0"
      )}>
        revenue $847,291
      </div>
      <div className={cn(
        "absolute bottom-16 left-12 font-mono text-[9px] tracking-widest text-[#3d5a4f] select-none uppercase transition-opacity duration-700",
        showStats ? "opacity-35" : "opacity-0"
      )}>
        sku active 3,492
      </div>
      <div className={cn(
        "absolute top-16 right-12 font-mono text-[9px] tracking-widest text-[#3d5a4f] select-none uppercase transition-opacity duration-700",
        showStats ? "opacity-35" : "opacity-0"
      )}>
        transactions 12,847
      </div>

      {/* Skip Hint */}
      <div className="absolute top-6 right-6 text-[8px] font-mono text-[#3d5a4f]/50 tracking-[0.2em] uppercase animate-pulse">
        Click to skip
      </div>

      {/* Radial Green Glow behind text/logo */}
      <div className="absolute inset-0 bg-radial-gradient from-emerald-950/20 via-transparent to-transparent pointer-events-none opacity-40" />

      {/* Terminal View */}
      {(phase === "terminal" || phase === "terminal-fade") && (
        <div className={cn(
          "w-full max-w-md px-8 font-mono text-[16px] sm:text-[18px] text-[#3d5a4f] leading-[2.2] lowercase transition-all duration-300",
          phase === "terminal-fade" ? "opacity-0 scale-98" : "opacity-100"
        )}>
          <div className="space-y-1">
            {lines.map((line, idx) => (
              <div key={idx} className="flex items-center">
                <span>{line}</span>
              </div>
            ))}
            {currentLineIdx < BOOT_LINES.length && (
              <div className="flex items-center">
                <span>{currentText}</span>
                <span className="text-[#3d5a4f] ml-0.5 animate-cursor-blink">▊</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logo & Brand Reveal */}
      {(phase === "logo-reveal" || phase === "logo-slide" || phase === "screen-fade") && (
        <div className={cn(
          "flex items-center justify-center transition-all duration-500",
          phase === "logo-reveal" ? "opacity-100 scale-95" : "opacity-100 scale-100"
        )}>
          
          {/* Logo container: slides smoothly left as flex sibling opens */}
          <div className={cn(
            "transition-all duration-600 ease-out",
            phase === "logo-reveal" ? "translate-x-0" : "translate-x-0"
          )}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center drop-shadow-[0_0_20px_rgba(61,90,79,0.25)] relative">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="metallic" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#cbd5e1" />
                    <stop offset="70%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                </defs>
                {/* Geometric monoline outer shape */}
                <path d="M50 15 L18 80 H28 L50 35 L72 80 H82 L50 15 Z" fill="url(#metallic)" />
                {/* Inner cutout */}
                <path d="M50 24 L27 72 H35 L50 42 L65 72 H73 L50 24 Z" fill="#040806" />
                {/* Crossbar ribbon */}
                <path d="M34 54 H66 V60 H34 Z" fill="url(#metallic)" />
                <path d="M38 56 H62 V58 H38 Z" fill="#040806" />
              </svg>
            </div>
          </div>

          {/* Brand Name layout container: shifts logo left automatically as width transitions */}
          <div className={cn(
            "transition-all duration-700 ease-in-out overflow-hidden flex flex-col justify-center h-20",
            phase === "logo-slide" || phase === "screen-fade" 
              ? "max-w-[320px] opacity-100 ml-4 sm:ml-6" 
              : "max-w-0 opacity-0 ml-0"
          )}>
            <div className="flex items-center whitespace-nowrap">
              {"ANTIQUE".split("").map((char, idx) => (
                <span 
                  key={idx}
                  className={cn(
                    "inline-block font-sans font-light text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-[0.3em] uppercase",
                    (phase === "logo-slide" || phase === "screen-fade") ? "animate-letter-reveal" : "opacity-0"
                  )}
                  style={{ 
                    animationDelay: `${idx * 0.08}s`,
                    animationFillMode: "forwards"
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
            
            {/* Elegant animated divider line behind/underneath the brand name */}
            <div className={cn(
              "h-[1px] w-full transition-transform duration-800 ease-in-out origin-left mt-2.5",
              (phase === "logo-slide" || phase === "screen-fade") 
                ? "scale-x-100 underline-shimmer-active" 
                : "scale-x-0 underline-line"
            )} />
          </div>

        </div>
      )}
    </div>
  );
}
