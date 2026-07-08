import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("luxe-theme");
        if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);
    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("luxe-theme", "dark");
        }
        else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("luxe-theme", "light");
        }
    };
    if (!mounted)
        return <div className="w-9 h-9"/>;
    return (<button onClick={toggle} className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors focus-ring" aria-label="Toggle theme">
      <Sun className={`w-5 h-5 transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"} absolute`}/>
      <Moon className={`w-5 h-5 transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}/>
    </button>);
}
