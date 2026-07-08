import React, { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { cn } from "@/lib/utils";
export function StoreName({ className }) {
    const storeName = useSettingsStore((s) => s.storeName);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return <span className={cn("opacity-0", className)}>BOUTIQUE</span>;
    }
    return <span className={className}>{storeName}</span>;
}
