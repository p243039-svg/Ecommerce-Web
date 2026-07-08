import React, { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { supabase } from "@/lib/supabase";
import { useFilterStore } from "@/stores/useFilterStore";
import { Button } from "@/components/ui/Button";
import { SlidersHorizontal, X, Search, FilterX, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
    return (<Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>);
}
function ProductsLoading() {
    return (<div className="min-h-screen bg-background">
      <div className="h-48 bg-surface border-b border-border flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="h-8 w-48 bg-muted rounded skeleton"/>
          <div className="h-4 w-32 bg-muted rounded mt-2 skeleton"/>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (<ProductSkeleton key={i}/>))}
        </div>
      </div>
    </div>);
}
function ProductsContent() {
    const [searchParams] = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { category, priceRange, brands, sizes: selectedSizes, colors: selectedColors, rating, sortBy, search, setCategory, setPriceRange, toggleBrand, toggleSize, toggleColor, setRating, setSortBy, setSearch, resetFilters, } = useFilterStore();
    const urlCategory = searchParams.get("category") || "";
    const urlSearch = searchParams.get("search") || "";
    const activeCategory = category || urlCategory;
    const activeSearch = search || urlSearch;
    const [allProducts, setAllProducts] = useState([]);
    const [allCats, setAllCats] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        setIsDataLoading(true);
        const [prodRes, catRes] = await Promise.all([
            supabase.from("products").select("*, images:product_images(*)").eq("is_active", true),
            supabase.from("categories").select("*").order("sort_order", { ascending: true }),
        ]);
        if (prodRes.data)
            setAllProducts(prodRes.data);
        if (catRes.data)
            setAllCats(catRes.data);
        // Add small delay for smoothness
        setTimeout(() => setIsDataLoading(false), 300);
    };
    const getLocalCatImage = (slug, fallback) => {
        const localMap = {
            'men': '/images/categories/men.jpg',
            'women': '/images/categories/women.jpg',
            'shoes': '/images/categories/shoes.jpg',
        };
        return localMap[slug] || fallback;
    };
    const activeCategoryData = allCats.find((c) => c.slug === activeCategory);
    const allBrands = useMemo(() => {
        const brandsSet = new Set();
        allProducts.forEach((p) => {
            if (p.brand)
                brandsSet.add(p.brand);
        });
        return Array.from(brandsSet).sort();
    }, [allProducts]);
    const allColors = useMemo(() => {
        const colorsSet = new Set();
        allProducts.forEach((p) => {
            p.colors?.forEach((c) => colorsSet.add(c));
        });
        return Array.from(colorsSet).sort();
    }, [allProducts]);
    const allSizes = useMemo(() => {
        const sizeSet = new Set();
        allProducts.forEach((p) => p.sizes?.forEach((s) => sizeSet.add(s)));
        return Array.from(sizeSet);
    }, [allProducts]);
    const filteredProducts = useMemo(() => {
        if (isDataLoading)
            return [];
        let result = [...allProducts];
        if (activeCategory) {
            const cat = allCats.find((c) => c.slug === activeCategory);
            if (cat)
                result = result.filter((p) => p.category_id === cat.id);
        }
        if (activeSearch) {
            const q = activeSearch.toLowerCase();
            result = result.filter((p) => p.name.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q));
        }
        result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
        if (brands.length > 0)
            result = result.filter((p) => brands.includes(p.brand));
        if (selectedSizes.length > 0)
            result = result.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s)));
        if (selectedColors.length > 0)
            result = result.filter((p) => p.colors?.some((c) => selectedColors.includes(c)));
        if (rating > 0)
            result = result.filter((p) => p.rating >= rating);
        switch (sortBy) {
            case "price-asc":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                result.sort((a, b) => b.price - a.price);
                break;
            case "rating":
                result.sort((a, b) => b.rating - a.rating);
                break;
            case "name":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default: result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        return result;
    }, [isDataLoading, allProducts, allCats, activeCategory, activeSearch, priceRange, brands, selectedSizes, selectedColors, rating, sortBy]);
    const activeFilterCount = (activeCategory ? 1 : 0) + (brands.length > 0 ? 1 : 0) + (selectedSizes.length > 0 ? 1 : 0) + (selectedColors.length > 0 ? 1 : 0) + (rating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);
    return (<div className="min-h-screen bg-background text-foreground">
      {/* Premium Header */}
      <div className="relative h-48 sm:h-80 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10"/>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"/>
        
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img src={activeCategoryData ? getLocalCatImage(activeCategoryData.slug, activeCategoryData.image_url) : "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80"} alt="Collection header"  className="object-cover opacity-30 scale-105 absolute inset-0 w-full h-full object-cover" />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <ShoppingBag className="w-3 h-3"/>
            Collections
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
            {activeCategoryData ? activeCategoryData.name : activeSearch ? "SEARCH RESULTS" : "DISCOVERY"}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg text-lg">
            {isDataLoading ? "Curating boutique selection..." : `${filteredProducts.length} premium pieces found.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={cn("inline-flex items-center gap-3 px-6 py-3 rounded-2xl border text-sm font-bold transition-all duration-300", isFilterOpen ? "bg-foreground text-background border-foreground shadow-lg scale-105" : "bg-surface border-border hover:border-primary/50")}>
              <SlidersHorizontal className="w-4 h-4"/>
              Advanced Filters
              {activeFilterCount > 0 && (<span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full">
                  {activeFilterCount}
                </span>)}
            </button>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button onClick={() => setCategory("")} className={cn("px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap", !activeCategory ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
                Everything
              </button>
              {allCats.map((cat) => (<button key={cat.id} onClick={() => setCategory(cat.slug)} className={cn("px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap", activeCategory === cat.slug ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
                  {cat.name}
                </button>))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-3 rounded-xl border border-border bg-surface text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all">
              <option value="newest">Sort: Latest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Most Popular</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Enhanced Filter Sidebar */}
          {isFilterOpen && (<aside className="w-full lg:w-72 animate-slide-right">
              <div className="lg:sticky lg:top-24 space-y-10">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Refine Selection</h3>
                  {activeFilterCount > 0 && (<button onClick={resetFilters} className="text-xs font-bold text-primary flex items-center gap-1 hover:blur-sm transition-all">
                      <FilterX className="w-3 h-3"/> RESET
                    </button>)}
                </div>

                {/* Search */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Keyword Search</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Silk, Denim, Luxe..." className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"/>
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Price Experience</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                      <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-full pl-7 pr-3 py-3 bg-surface border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"/>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                      <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full pl-7 pr-3 py-3 bg-surface border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"/>
                    </div>
                  </div>
                </div>

                {/* Colors Grid */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Color Story</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allColors.map((color) => (<button key={color} onClick={() => toggleColor(color)} className={cn("px-3 py-2 text-[10px] font-bold rounded-lg border text-left transition-all duration-200", selectedColors.includes(color) ? "bg-foreground text-background border-foreground shadow-md" : "border-border text-foreground hover:bg-muted")}>
                        {color.toUpperCase()}
                      </button>))}
                  </div>
                </div>
              </div>
            </aside>)}

          {/* Product Grid with Skeletons */}
          <div className="flex-1">
            {isDataLoading ? (<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => <ProductSkeleton key={i}/>)}
              </div>) : filteredProducts.length === 0 ? (<div className="text-center py-24 bg-surface/50 rounded-3xl border border-dashed border-border animate-fade-in">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="w-10 h-10 text-muted-foreground"/>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-8">Refine your filters to find your next luxury piece.</p>
                <Button size="lg" onClick={resetFilters} className="rounded-full px-10">Clear all filters</Button>
              </div>) : (<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                {filteredProducts.map((product, i) => (<ProductCard key={product.id} product={product}/>))}
              </div>)}
          </div>
        </div>
      </div>
    </div>);
}
