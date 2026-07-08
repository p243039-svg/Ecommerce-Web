import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice, getDiscountPercentage, cn } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useFavoriteStore } from "@/stores/useFavoriteStore";
import { useToastStore } from "@/stores/useToastStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80";
export function ProductCard({ product, className }) {
    const navigate = useNavigate();
    const addItem = useCartStore((s) => s.addItem);
    const addToast = useToastStore((s) => s.addToast);
    const { toggleFavorite, isFavorite } = useFavoriteStore();
    const settings = useSettingsStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [failedUrls, setFailedUrls] = useState(new Set());
    const [mounted, setMounted] = useState(false);
    const intervalRef = useRef(null);
    // Fix Hydration Mismatch by waiting for mount
    useEffect(() => {
        setMounted(true);
    }, []);
    // Sort images: primary first, then by sort_order
    const sortedImages = useMemo(() => {
        const imgs = (product.images || []).filter(Boolean);
        const primary = imgs.filter((i) => i.is_primary);
        const rest = imgs.filter((i) => !i.is_primary).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        const all = [...primary, ...rest];
        return all.length > 0 ? all : [{ url: FALLBACK_IMAGE, is_primary: true, sort_order: 0 }];
    }, [product.images]);
    // Filter out failed URLs
    const validImages = useMemo(() => {
        const valid = sortedImages.filter((img) => !failedUrls.has(img.url));
        return valid.length > 0 ? valid : [{ url: FALLBACK_IMAGE, is_primary: true, sort_order: 0 }];
    }, [sortedImages, failedUrls]);
    // Tactile Cursor Rotation: Cycle images based on mouse position
    const handleMouseMove = (e) => {
        if (validImages.length <= 1)
            return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const progress = x / width;
        const nextIndex = Math.min(Math.floor(progress * validImages.length), validImages.length - 1);
        if (nextIndex !== currentIndex) {
            setCurrentIndex(nextIndex);
        }
    };
    const startCycling = () => {
        if (validImages.length <= 1)
            return;
        setIsHovered(true);
    };
    const stopCycling = () => {
        setIsHovered(false);
        setCurrentIndex(0);
    };
    // Mobile Tap-to-Cycle
    const handleTouchStart = () => {
        if (validImages.length <= 1)
            return;
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
        setIsHovered(true);
    };
    const discount = product.compare_at_price
        ? getDiscountPercentage(product.price, product.compare_at_price)
        : 0;
    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock_quantity <= 0) {
            addToast({ type: "error", title: "Out of stock", description: "This item is currently unavailable." });
            return;
        }
        const success = addItem(product, product.sizes?.[0] || "S", product.colors?.[0] || "Classic");
        if (success) {
            addToast({ type: "success", title: "Added to cart", description: `${product.name} has been added to your cart.` });
        }
    };
    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wasFav = isFavorite(product.id);
        toggleFavorite(product);
        addToast({
            type: wasFav ? "info" : "success",
            title: wasFav ? "Removed from favorites" : "Saved to wishlist!",
            description: product.name,
        });
    };
    // Safe checks for hydration
    const currentIsFav = mounted ? isFavorite(product.id) : false;
    return (<Link to={`/products/${product.slug}`} className={cn("group relative block bg-surface rounded-[2rem] overflow-hidden border border-border/50 transition-all duration-500", "hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-2", className)}>
      {/* ---- Image Container ---- */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted cursor-pointer" onMouseEnter={startCycling} onMouseLeave={stopCycling} onMouseMove={handleMouseMove} onTouchStart={handleTouchStart} onTouchEnd={() => setIsHovered(false)}>
        {/* Gallery Progress Indicators */}
        {isHovered && validImages.length > 1 && (<div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 z-30 transition-opacity duration-300">
            {validImages.map((_, i) => (<div key={i} className={cn("h-1 rounded-full transition-all duration-300", i === currentIndex ? "w-6 bg-white shadow-lg" : "w-2 bg-white/40")}/>))}
          </div>)}

        {mounted && validImages.map((img, idx) => (<div key={`${img.url}-${idx}`} className="absolute inset-0 transition-opacity duration-700 ease-in-out" style={{ opacity: idx === currentIndex % validImages.length ? 1 : 0, zIndex: idx === currentIndex % validImages.length ? 2 : 1 }}>
            <img src={img.url} alt={`${product.name} ${idx + 1}`} className="object-cover absolute inset-0 w-full h-full object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" onError={() => setFailedUrls((prev) => new Set(prev).add(img.url))}/>
          </div>))}

        {!mounted && validImages[0] && (<div className="absolute inset-0">
             <img src={validImages[0].url} alt={product.name} className="object-cover absolute inset-0 w-full h-full object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"/>
           </div>)}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"/>

        {/* Floating Action Buttons */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex flex-col gap-2 z-20 sm:translate-x-12 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 transition-all duration-500 delay-75">
          <button onClick={handleFavorite} className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 touch-manipulation", currentIsFav ? "bg-amber-600 text-white" : "bg-white/90 backdrop-blur-md text-foreground hover:bg-white")} aria-label={currentIsFav ? "Remove from favorites" : "Add to favorites"}>
            <Heart className={cn("w-4 h-4 sm:w-5 sm:h-5", currentIsFav && "fill-current")}/>
          </button>
          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white text-foreground shadow-xl transition-all hover:scale-110">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5"/>
          </div>
        </div>

        {/* Quick Add Bar */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-500 z-20">
          {product.stock_quantity > 0 ? (<button onClick={handleQuickAdd} className="w-full py-2.5 sm:py-3 bg-[#4a3f35] text-[#f4ebe0] rounded-2xl font-black flex items-center justify-center gap-2 shadow-2xl hover:bg-amber-800 transition-all text-xs sm:text-[10px] tracking-widest touch-manipulation">
              <ShoppingBag className="w-4 h-4"/>
              ADD TO CART
            </button>) : (<div className="w-full py-2.5 sm:py-3 bg-muted/90 backdrop-blur-md text-muted-foreground rounded-2xl font-bold text-center text-xs tracking-widest">
              SOLD OUT
            </div>)}
        </div>
      </div>

      {/* ---- Info Area ---- */}
      <div className="p-5 sm:p-7 bg-white transition-colors duration-500 group-hover:bg-amber-50/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-amber-800/60 uppercase tracking-[0.25em]">
            {product.brand || settings.storeName.toUpperCase()}
          </span>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
            <span className="text-[10px] font-bold text-amber-900">{product.rating || "4.5"}</span>
            <StarRating rating={product.rating || 4.5} size="sm"/>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-amber-800 transition-colors line-clamp-1 tracking-tight mb-2 font-serif italic">
          {product.name}
        </h3>

        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl font-black text-[#4a3f35] tabular-nums tracking-tighter">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && (<span className="text-xs text-[#bfb3a0] line-through">
              {formatPrice(product.compare_at_price)}
            </span>)}
        </div>
      </div>
    </Link>);
}
