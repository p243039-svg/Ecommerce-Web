import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/useCartStore";
export function BottomNav() {
    const { pathname } = useLocation();
    const itemsCount = useCartStore((s) => s.items.length);
    const navItems = [
        { label: "Home", icon: Home, href: "/" },
        { label: "Shop", icon: Search, href: "/products" },
        { label: "Cart", icon: ShoppingBag, href: "/cart", badge: itemsCount },
        { label: "Wishlist", icon: Heart, href: "/wishlist" },
        { label: "Profile", icon: User, href: "/profile" },
    ];
    return (<nav className="fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur-2xl border-t border-border/50 z-50 sm:hidden flex items-center justify-around h-20 px-2 pb-safe">
      {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (<Link key={item.label} to={item.href} className={cn("relative flex flex-col items-center justify-center gap-1.5 w-16 h-16 transition-all duration-300", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <div className={cn("p-2 rounded-2xl transition-all duration-300", isActive && "bg-primary/10 scale-110")}>
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")}/>
            </div>
            <span className={cn("text-[10px] font-bold tracking-tight uppercase", isActive ? "opacity-100" : "opacity-60")}>
              {item.label}
            </span>
            
            {item.badge !== undefined && item.badge > 0 && (<span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-primary-foreground animate-pulse">
                {item.badge}
              </span>)}
          </Link>);
        })}
    </nav>);
}
