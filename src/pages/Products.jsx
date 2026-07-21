import React, { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { supabase } from "@/lib/supabase";
import { useFilterStore } from "@/stores/useFilterStore";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, X, Search, FilterX, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => <ProductSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}

// Collapsible filter section
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#e2d6c5] pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-[#4a3f35]">{title}</span>
        {open ? <ChevronUp className="w-3 h-3 text-[#8c7e6c]" /> : <ChevronDown className="w-3 h-3 text-[#8c7e6c]" />}
      </button>
      {open && <div className="pt-2">{children}</div>}
    </div>
  );
}

function ProductsContent() {
  const [searchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsFilterOpen(true);
    }
  }, []);
  const {
    category, priceRange, brands, sizes: selectedSizes, colors: selectedColors,
    rating, sortBy, search,
    setCategory, setPriceRange, toggleBrand, toggleSize, toggleColor,
    setRating, setSortBy, setSearch, resetFilters,
  } = useFilterStore();

  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";
  const activeCategory = category || urlCategory;
  const activeSearch = search || urlSearch;

  const [allProducts, setAllProducts] = useState([]);
  const [allCats, setAllCats] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsDataLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from("products").select("*, images:product_images(*)"),
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    ]);
    if (prodRes.data) setAllProducts(prodRes.data);
    if (catRes.data) setAllCats(catRes.data);
    setIsDataLoading(false);
  };

  const allBrands = useMemo(() => {
    const s = new Set();
    allProducts.forEach((p) => { if (p.brand) s.add(p.brand); });
    return Array.from(s).sort();
  }, [allProducts]);

  const allColors = useMemo(() => {
    const s = new Set();
    allProducts.forEach((p) => p.colors?.forEach((c) => s.add(c)));
    return Array.from(s).sort();
  }, [allProducts]);

  const allSizes = useMemo(() => {
    const s = new Set();
    allProducts.forEach((p) => p.sizes?.forEach((sz) => s.add(sz)));
    return Array.from(s);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (isDataLoading) return [];
    let result = [...allProducts];
    if (activeCategory) {
      const cat = allCats.find((c) => c.slug === activeCategory || c.name.toLowerCase() === activeCategory.toLowerCase());
      if (cat) {
        result = result.filter((p) => p.category_id === cat.id);
      } else {
        result = result.filter((p) => 
          p.category?.toLowerCase() === activeCategory.toLowerCase() || 
          p.tags?.some((t) => t.toLowerCase() === activeCategory.toLowerCase())
        );
      }
    }
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (brands.length > 0) result = result.filter((p) => brands.includes(p.brand));
    if (selectedSizes.length > 0) result = result.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s)));
    if (selectedColors.length > 0) result = result.filter((p) => p.colors?.some((c) => selectedColors.includes(c)));
    if (rating > 0) result = result.filter((p) => p.rating >= rating);
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [isDataLoading, allProducts, allCats, activeCategory, activeSearch, priceRange, brands, selectedSizes, selectedColors, rating, sortBy]);

  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    (brands.length > 0 ? 1 : 0) +
    (selectedSizes.length > 0 ? 1 : 0) +
    (selectedColors.length > 0 ? 1 : 0) +
    (rating > 0 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  const renderFilters = () => (
    <>
      {/* Search */}
      <FilterSection title="Search">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8c7e6c]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keyword..."
            className="w-full pl-8 pr-3 py-2 bg-[#f4ebe0]/50 border border-[#e2d6c5] rounded-lg text-[11px] text-[#4a3f35] focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-[#bfb3a0]"
          />
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-0.5">
          <button
            onClick={() => setCategory("")}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all",
              !activeCategory ? "bg-[#4a3f35] text-[#fffdfa] font-bold" : "text-[#4a3f35] hover:bg-[#f4ebe0]"
            )}
          >
            All Pieces
          </button>
          {allCats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                activeCategory === cat.slug ? "bg-[#4a3f35] text-[#fffdfa] font-bold" : "text-[#4a3f35] hover:bg-[#f4ebe0]"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#8c7e6c]">$</span>
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full pl-5 pr-2 py-1.5 bg-[#f4ebe0]/50 border border-[#e2d6c5] rounded-lg text-[11px] text-[#4a3f35] focus:outline-none focus:ring-1 focus:ring-amber-400"
              placeholder="Min"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#8c7e6c]">$</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full pl-5 pr-2 py-1.5 bg-[#f4ebe0]/50 border border-[#e2d6c5] rounded-lg text-[11px] text-[#4a3f35] focus:outline-none focus:ring-1 focus:ring-amber-400"
              placeholder="Max"
            />
          </div>
        </div>
      </FilterSection>

      {/* Colors */}
      {allColors.length > 0 && (
        <FilterSection title="Colors">
          <div className="flex flex-wrap gap-1.5">
            {allColors.slice(0, 12).map((color) => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={cn(
                  "px-2 py-1 text-[9px] font-bold rounded-md border transition-all",
                  selectedColors.includes(color)
                    ? "bg-[#4a3f35] text-[#fffdfa] border-[#4a3f35]"
                    : "border-[#e2d6c5] text-[#4a3f35] hover:border-[#4a3f35]"
                )}
              >
                {color.toUpperCase()}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sizes */}
      {allSizes.length > 0 && (
        <FilterSection title="Sizes">
          <div className="flex flex-wrap gap-1.5">
            {allSizes.slice(0, 12).map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={cn(
                  "w-9 h-8 text-[10px] font-bold rounded-lg border transition-all",
                  selectedSizes.includes(size)
                    ? "bg-[#4a3f35] text-[#fffdfa] border-[#4a3f35]"
                    : "border-[#e2d6c5] text-[#4a3f35] hover:border-[#4a3f35]"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rating */}
      <FilterSection title="Min. Rating" defaultOpen={false}>
        <div className="space-y-0.5">
          {[0, 3, 3.5, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setRating(r)}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition-all",
                rating === r ? "bg-[#4a3f35] text-[#fffdfa] font-bold" : "text-[#4a3f35] hover:bg-[#f4ebe0]"
              )}
            >
              {r === 0 ? "All Ratings" : `${r}★ & above`}
            </button>
          ))}
        </div>
      </FilterSection>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f9f7f4] text-foreground">
      {/* Top Bar */}
      <div className="bg-[#fffdfa] border-b border-[#e2d6c5] sticky top-[64px] sm:top-[76px] lg:top-[104px] z-20 py-2 sm:py-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:h-12 gap-2 sm:gap-4">
            
            {/* Top row: Results count + Sort & Filter controls */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <span className="text-[10px] text-[#8c7e6c] font-black uppercase tracking-wider whitespace-nowrap">
                {isDataLoading ? "..." : filteredProducts.length} Results
              </span>
              
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-[10px] font-bold uppercase tracking-wider border border-[#e2d6c5] rounded-lg px-2 py-1 bg-[#fffdfa] text-[#4a3f35] focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                >
                  <option value="newest">Latest Arrivals</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="rating">Most Popular</option>
                  <option value="name">A → Z</option>
                </select>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all",
                    isFilterOpen
                      ? "bg-[#4a3f35] text-[#fffdfa] border-[#4a3f35]"
                      : "border-[#e2d6c5] text-[#4a3f35] hover:border-[#4a3f35]"
                  )}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-800 text-white text-[8px] font-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom row: Horizontal Category Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide w-full sm:w-auto border-t border-[#e2d6c5]/10 sm:border-0 pt-2 sm:pt-0">
              <button
                onClick={() => setCategory("")}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                  !activeCategory ? "bg-[#4a3f35] text-[#fffdfa]" : "text-[#8c7e6c] hover:text-[#4a3f35]"
                )}
              >
                All Pieces
              </button>
              {allCats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                    activeCategory === cat.slug ? "bg-[#4a3f35] text-[#fffdfa]" : "text-[#8c7e6c] hover:text-[#4a3f35]"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-[120] pointer-events-none transition-all duration-300",
        isFilterOpen ? "opacity-100" : "opacity-0"
      )}>
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-[#4a3f35]/40 backdrop-blur-xs transition-opacity duration-300",
            isFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsFilterOpen(false)}
        />
        
        {/* Drawer container */}
        <div className={cn(
          "absolute inset-y-0 right-0 w-[280px] max-w-[85vw] bg-[#fffdfa] shadow-[-10px_0_50px_rgba(74,63,53,0.15)] flex flex-col p-6 transition-transform duration-300 ease-out pointer-events-auto",
          isFilterOpen ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#e2d6c5] mb-4">
            <span className="text-[10px] font-black text-[#4a3f35] uppercase tracking-widest">Filters</span>
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="flex items-center gap-1 text-[9px] text-amber-700 font-black uppercase hover:text-amber-900">
                  <FilterX className="w-3 h-3" /> Reset
                </button>
              )}
              <button onClick={() => setIsFilterOpen(false)} className="p-1.5 bg-amber-50 rounded-full border border-[#e2d6c5]/30">
                <X className="w-4 h-4 text-[#4a3f35]" />
              </button>
            </div>
          </div>
          
          {/* Scrollable Filters */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {renderFilters()}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* ── FILTER SIDEBAR (Left, fixed width, desktop only) ── */}
          {isFilterOpen && (
            <aside className="w-52 shrink-0 hidden lg:block">
              <div className="sticky top-[160px] bg-[#fffdfa] rounded-2xl border border-[#e2d6c5] p-4 space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#e2d6c5] mb-2">
                  <span className="text-[10px] font-black text-[#4a3f35] uppercase tracking-widest">Filters</span>
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="flex items-center gap-1 text-[9px] text-amber-700 font-black uppercase hover:text-amber-900">
                      <FilterX className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>
                {renderFilters()}
              </div>
            </aside>
          )}

          {/* ── PRODUCT GRID (Right, grows) ── */}
          <div className="flex-1 min-w-0">
            {isDataLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-[#fffdfa] rounded-3xl border border-dashed border-[#e2d6c5] animate-fade-in">
                <div className="w-16 h-16 bg-[#f4ebe0] rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-[#bfb3a0]" />
                </div>
                <h3 className="text-lg font-bold text-[#4a3f35] mb-2">No matches found</h3>
                <p className="text-sm text-[#8c7e6c] mb-6">Refine your filters to find your next luxury piece.</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#4a3f35] text-[#fffdfa] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-in">
                {filteredProducts.map((product) => (
                  <SmallProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small compact product card for grid ──
import { Link } from "react-router-dom";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useFavoriteStore } from "@/stores/useFavoriteStore";
import { useToastStore } from "@/stores/useToastStore";
import { useState as useStateLocal, useMemo as useMemoLocal, useEffect as useEffectLocal } from "react";

function SmallProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const [failedUrls, setFailedUrls] = useState(new Set());
  const [mounted, setMounted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  const FALLBACK = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80";

  const images = useMemo(() => {
    const imgs = (product.images || []).filter(Boolean);
    const primary = imgs.filter((i) => i.is_primary);
    const rest = imgs.filter((i) => !i.is_primary).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const all = [...primary, ...rest].filter((i) => !failedUrls.has(i.url));
    return all.length > 0 ? all : [{ url: FALLBACK }];
  }, [product.images, failedUrls]);

  const discount = product.compare_at_price
    ? getDiscountPercentage(product.price, product.compare_at_price) : 0;

  const isFav = mounted ? isFavorite(product.id) : false;

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (product.stock_quantity <= 0) {
      addToast({ type: "error", title: "Out of stock" }); return;
    }
    addItem(product, product.sizes?.[0] || "S", product.colors?.[0] || "Classic");
    addToast({ type: "success", title: "Added to cart", description: product.name });
  };

  const handleFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleFavorite(product);
    addToast({ type: isFav ? "info" : "success", title: isFav ? "Removed" : "Saved to wishlist", description: product.name });
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block bg-[#fffdfa] rounded-2xl overflow-hidden border border-[#e2d6c5]/60 hover:shadow-lg hover:border-amber-200 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div
        className="relative aspect-[3/4] bg-[#faf8f5] overflow-hidden"
        onMouseEnter={() => images.length > 1 && setCurrentIdx(1)}
        onMouseLeave={() => setCurrentIdx(0)}
      >
        {discount > 0 && (
          <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full">
            -{discount}%
          </span>
        )}

        {mounted && images.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: idx === currentIdx % images.length ? 1 : 0, zIndex: idx === currentIdx % images.length ? 2 : 1 }}
          >
            <img
              src={img.url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setFailedUrls((prev) => new Set(prev).add(img.url))}
            />
          </div>
        ))}

        {!mounted && images[0] && (
          <img src={images[0].url} alt={product.name} className="w-full h-full object-cover" />
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={handleFav}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all",
              isFav ? "bg-amber-800 text-white" : "bg-white/90 text-[#4a3f35]"
            )}
          >
            <Heart className={cn("w-3 h-3", isFav && "fill-current")} />
          </button>
        </div>

        {/* Quick add */}
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 p-2">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-[#4a3f35] text-[#fffdfa] rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-amber-800 transition-colors"
          >
            <ShoppingBag className="w-3 h-3" />
            {product.stock_quantity > 0 ? "Add to Cart" : "Sold Out"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[9px] font-black text-amber-800/60 uppercase tracking-widest truncate mb-0.5">{product.brand}</p>
        <h3 className="text-[11px] font-semibold text-[#4a3f35] line-clamp-2 leading-tight mb-1.5 font-serif italic">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-[#4a3f35]">{formatPrice(product.price)}</span>
          {product.compare_at_price && (
            <span className="text-[9px] text-[#bfb3a0] line-through">{formatPrice(product.compare_at_price)}</span>
          )}
        </div>
        {product.rating && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-amber-500 text-[9px]">★</span>
            <span className="text-[9px] text-[#8c7e6c]">{product.rating}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
