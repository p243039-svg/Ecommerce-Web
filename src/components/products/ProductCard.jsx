import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice, getDiscountPercentage, cn } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { Heart, ShoppingBag, Eye, MessageSquare } from "lucide-react";
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

    // Cycle images on mouse move
    const handleMouseMove = (e) => {
        if (validImages.length <= 1) return;
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
        if (validImages.length <= 1) return;
        setIsHovered(true);
    };

    const stopCycling = () => {
        setIsHovered(false);
        setCurrentIndex(0);
    };

    const handleTouchStart = () => {
        if (validImages.length <= 1) return;
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

    const currentIsFav = mounted ? isFavorite(product.id) : false;

    // Compute tags with category fallbacks if empty
    const tagsList = useMemo(() => {
        if (product.tags && Array.isArray(product.tags) && product.tags.length > 0) {
            return product.tags;
        }
        const cat = product.category_id || "";
        if (cat.includes("men")) return ["New", "Premium"];
        if (cat.includes("women")) return ["Elegant", "Women"];
        if (cat.includes("shoes")) return ["Luxury", "Footwear"];
        if (cat.includes("accessories")) return ["Exquisite", "Luxury"];
        if (cat.includes("beauty")) return ["Organic", "Beauty"];
        return ["Atelier"];
    }, [product.tags, product.category_id]);

    // Grab the first review with a realistic fallback if empty
    const firstReview = useMemo(() => {
        let list = [];
        if (product.reviews) {
            if (Array.isArray(product.reviews)) {
                list = product.reviews;
            } else if (typeof product.reviews === 'string') {
                try {
                    list = JSON.parse(product.reviews);
                } catch (e) {}
            }
        }
        if (list && list.length > 0) {
            return list[0];
        }
        return {
            reviewerName: "Alexander V.",
            comment: "Absolutely stunning piece. Craftsmanship is top-tier and feels premium.",
            rating: 5
        };
    }, [product.reviews]);

    return (
        <Link 
            to={`/products/${product.slug}`} 
            className={cn(
                "group relative block bg-[#fffdfa] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border border-[#e2d6c5]/60 transition-all duration-500", 
                "hover:shadow-[0_20px_50px_rgba(74,63,53,0.12)] hover:border-amber-800/30 hover:-translate-y-2", 
                className
            )}
        >
            {/* ---- Image Container ---- */}
            <div 
                className="relative aspect-[3/4] overflow-hidden bg-[#faf8f5] cursor-pointer" 
                onMouseEnter={startCycling} 
                onMouseLeave={stopCycling} 
                onMouseMove={handleMouseMove} 
                onTouchStart={handleTouchStart} 
                onTouchEnd={() => setIsHovered(false)}
            >
                {/* Gallery Progress Indicators */}
                {isHovered && validImages.length > 1 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 z-30 transition-opacity duration-300">
                        {validImages.map((_, i) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "h-1 rounded-full transition-all duration-300", 
                                    i === currentIndex ? "w-6 bg-white shadow-lg" : "w-2 bg-white/40"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Tags & Discount Badges in Top-Left */}
                <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2 z-30 items-start">
                    {discount > 0 && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[7px] sm:text-[8px] font-black uppercase tracking-wider bg-amber-800 text-[#fffdfa] rounded-full shadow-sm">
                            {discount}% OFF
                        </span>
                    )}
                    {tagsList.slice(0, 2).map((tag) => (
                        <span 
                            key={tag} 
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[7px] sm:text-[8px] font-black uppercase tracking-wider bg-[#fffdfa]/90 backdrop-blur-md text-[#4a3f35] rounded-full shadow-sm border border-[#e2d6c5]/40"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Low Stock Warning */}
                {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                    <span className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 z-30 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[6px] sm:text-[7px] font-black uppercase tracking-widest bg-red-50/95 text-red-700 backdrop-blur-sm rounded-lg border border-red-100 shadow-sm">
                        ONLY {product.stock_quantity} LEFT
                    </span>
                )}

                {/* Main Product Images */}
                {mounted && validImages.map((img, idx) => (
                    <div 
                        key={`${img.url}-${idx}`} 
                        className="absolute inset-0 transition-opacity duration-700 ease-in-out" 
                        style={{ 
                            opacity: idx === currentIndex % validImages.length ? 1 : 0, 
                            zIndex: idx === currentIndex % validImages.length ? 2 : 1 
                        }}
                    >
                        <img 
                            src={img.url} 
                            alt={`${product.name} ${idx + 1}`} 
                            className="object-cover absolute inset-0 w-full h-full" 
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" 
                            onError={() => setFailedUrls((prev) => new Set(prev).add(img.url))}
                        />
                    </div>
                ))}

                {!mounted && validImages[0] && (
                    <div className="absolute inset-0">
                        <img 
                            src={validImages[0].url} 
                            alt={product.name} 
                            className="object-cover absolute inset-0 w-full h-full" 
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#4a3f35]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"/>

                {/* Floating Action Buttons */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2 z-20 sm:translate-x-12 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 transition-all duration-500 delay-75">
                    <button 
                        onClick={handleFavorite} 
                        className={cn(
                            "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 touch-manipulation border border-[#e2d6c5]/20", 
                            currentIsFav ? "bg-amber-800 text-white" : "bg-[#fffdfa]/95 backdrop-blur-md text-[#4a3f35] hover:bg-[#fffdfa]"
                        )} 
                        aria-label={currentIsFav ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Heart className={cn("w-3.5 h-3.5 sm:w-4.5 sm:h-4.5", currentIsFav && "fill-current")}/>
                    </button>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#fffdfa]/95 backdrop-blur-md border border-[#e2d6c5]/20 flex items-center justify-center hover:bg-[#fffdfa] text-[#4a3f35] shadow-xl transition-all hover:scale-110">
                        <Eye className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5"/>
                    </div>
                </div>

                {/* Quick Add Bar */}
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-4 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-500 z-20">
                    {product.stock_quantity > 0 ? (
                        <button 
                            onClick={handleQuickAdd} 
                            className="w-full py-2 sm:py-3 bg-[#4a3f35] text-[#fffdfa] rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xl hover:bg-amber-800 transition-all text-[8px] sm:text-[9px] tracking-[0.2em] uppercase touch-manipulation"
                        >
                            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
                            ADD TO CART
                        </button>
                    ) : (
                        <div className="w-full py-2 sm:py-3 bg-[#e2d6c5]/80 backdrop-blur-md text-[#8c7e6c] rounded-xl sm:rounded-2xl font-black text-center text-[8px] sm:text-[9px] tracking-[0.2em] uppercase">
                            SOLD OUT
                        </div>
                    )}
                </div>
            </div>

            {/* ---- Info Area ---- */}
            <div className="p-3.5 sm:p-6 bg-[#fffdfa] transition-colors duration-500 group-hover:bg-amber-50/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 sm:mb-2 gap-1 sm:gap-2">
                    <span className="text-[8px] sm:text-[9px] font-black text-amber-800/60 uppercase tracking-[0.2em] truncate">
                        {product.brand || settings.storeName.toUpperCase()}
                    </span>
                    
                    {/* Stars and rating count */}
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-50/60 px-1.5 sm:px-2 py-0.5 rounded-lg border border-amber-100/50 shrink-0 self-start sm:self-auto">
                        <span className="text-[8px] sm:text-[10px] font-black text-amber-900">{product.rating || "4.5"}</span>
                        <StarRating rating={product.rating || 4.5} size="sm"/>
                        <span className="text-[7px] sm:text-[8px] text-[#8c7e6c] font-black">
                            ({product.review_count || 12})
                        </span>
                    </div>
                </div>

                <h3 className="text-xs sm:text-base font-bold text-[#4a3f35] group-hover:text-amber-800 transition-colors line-clamp-1 tracking-tight mb-1.5 sm:mb-2 font-serif italic">
                    {product.name}
                </h3>

                <div className="flex items-baseline sm:items-center gap-1.5 sm:gap-3">
                    <span className="text-sm sm:text-lg font-black text-[#4a3f35] tabular-nums tracking-tight">
                        {formatPrice(product.price)}
                    </span>
                    {product.compare_at_price && (
                        <span className="text-[10px] sm:text-xs text-[#bfb3a0] line-through">
                            {formatPrice(product.compare_at_price)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
