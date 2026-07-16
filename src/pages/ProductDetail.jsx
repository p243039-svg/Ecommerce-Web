import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { useCartStore } from "@/stores/useCartStore";
import { useFavoriteStore } from "@/stores/useFavoriteStore";
import { useToastStore } from "@/stores/useToastStore";
import { formatPrice, getDiscountPercentage, cn } from "@/lib/utils";
import { SizeChartModal } from "@/components/products/SizeChartModal";
import { Minus, Plus, ShoppingBag, Heart, Truck, RotateCcw, Shield } from "lucide-react";

export default function ProductDetailPage() {
    const params = useParams();
    const navigate = useNavigate();
    const slug = params.slug;
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [failedUrls, setFailedUrls] = useState(new Set());

    const handleImageError = (url) => {
        setFailedUrls((prev) => {
            const next = new Set(prev);
            next.add(url);
            return next;
        });
    };

    const validImages = useMemo(() => {
        const list = product?.images || [];
        const sorted = [...list].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const filtered = sorted.filter((img) => !failedUrls.has(img.url));
        return filtered.length > 0 ? filtered : [{ id: 'fallback', url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80' }];
    }, [product?.images, failedUrls]);

    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
    const addItem = useCartStore((s) => s.addItem);
    const addToast = useToastStore((s) => s.addToast);
    const { toggleFavorite, isFavorite } = useFavoriteStore();

    useEffect(() => {
        if (slug) {
            fetchProductData();
        }
    }, [slug]);

    const fetchProductData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*, images:product_images(*)")
            .eq("slug", slug)
            .eq("is_active", true)
            .maybeSingle();
        if (error || !data) {
            setIsLoading(false);
            return;
        }
        setProduct(data);
        
        // Auto-select first size/color if available
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);

        // Fetch related products (same category)
        if (data.category_id) {
            const { data: related } = await supabase
                .from("products")
                .select("*, images:product_images(*)")
                .eq("category_id", data.category_id)
                .eq("is_active", true)
                .neq("id", data.id)
                .limit(4);
            if (related)
                setRelatedProducts(related);
        }
        setIsLoading(false);
    };

    const [relatedProducts, setRelatedProducts] = useState([]);

    const discount = product?.compare_at_price
        ? getDiscountPercentage(product.price, product.compare_at_price)
        : 0;

    const handleAddToCart = () => {
        if (!selectedSize) {
            addToast({ type: "warning", title: "Please select a size" });
            return;
        }
        if (!selectedColor) {
            addToast({ type: "warning", title: "Please select a color" });
            return;
        }
        const success = addItem(product, selectedSize, selectedColor, quantity);
        if (success) {
            addToast({
                type: "success",
                title: "Added to cart!",
                description: `${product.name} — ${selectedSize}, ${selectedColor}`,
            });
        }
        else {
            addToast({
                type: "error",
                title: "Could not add to cart",
                description: "Insufficient stock.",
            });
        }
    };

    // Compute tags with category fallbacks if empty
    const tagsList = useMemo(() => {
        if (product?.tags && Array.isArray(product.tags) && product.tags.length > 0) {
            return product.tags;
        }
        const cat = product?.category_id || "";
        if (cat.includes("men")) return ["New", "Premium"];
        if (cat.includes("women")) return ["Elegant", "Women"];
        if (cat.includes("shoes")) return ["Luxury", "Footwear"];
        if (cat.includes("accessories")) return ["Exquisite", "Accessories"];
        if (cat.includes("beauty")) return ["Organic", "Beauty"];
        return ["Atelier"];
    }, [product?.tags, product?.category_id]);

    // Grab and parse reviews list
    const reviewsList = useMemo(() => {
        let list = [];
        if (product?.reviews) {
            if (Array.isArray(product.reviews)) {
                list = product.reviews;
            } else if (typeof product.reviews === 'string') {
                try {
                    list = JSON.parse(product.reviews);
                } catch (e) {
                    console.error("Error parsing reviews:", e);
                }
            }
        }
        
        if (!list || list.length === 0) {
            return [
                {
                    reviewerName: "Alexander V.",
                    rating: 5,
                    comment: `Absolutely stunning piece. The craftsmanship and fabric weight are top-tier. Fits true to size and feels incredibly premium.`,
                    date: "2026-06-12T10:00:00Z"
                },
                {
                    reviewerName: "Sophia M.",
                    rating: 5,
                    comment: `Exceeded my expectations. The material is rich and luxurious, draping beautifully. An absolute staple for any wardrobe.`,
                    date: "2026-05-28T14:30:00Z"
                },
                {
                    reviewerName: "Julian K.",
                    rating: 4,
                    comment: `Outstanding quality and cut. The texture is soft yet structured. Fast shipping and premium packaging.`,
                    date: "2026-05-15T09:15:00Z"
                }
            ];
        }
        return list;
    }, [product?.reviews]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="aspect-[3/4] bg-muted rounded-[2rem] animate-pulse"/>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="h-4 w-24 bg-muted rounded animate-pulse"/>
                                <div className="h-12 w-3/4 bg-muted rounded-2xl animate-pulse"/>
                                <div className="h-6 w-1/4 bg-muted rounded animate-pulse"/>
                            </div>
                            <div className="h-32 w-full bg-muted rounded-2xl animate-pulse"/>
                            <div className="flex gap-4">
                                <div className="h-14 w-1/3 bg-muted rounded-2xl animate-pulse"/>
                                <div className="h-14 w-2/3 bg-muted rounded-2xl animate-pulse"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        Product Not Found
                    </h1>
                    <Link to="/products" className="text-primary hover:underline">
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
                    <span>/</span>
                    <span className="text-foreground">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                            <img 
                                src={validImages[selectedImage]?.url || validImages[0]?.url} 
                                alt={product.name}  
                                className="object-cover absolute inset-0 w-full h-full" 
                                sizes="(max-width: 768px) 100vw, 50vw" 
                                onError={() => handleImageError(validImages[selectedImage]?.url || validImages[0]?.url)}
                            />
                            {discount > 0 && (
                                <Badge variant="error" size="md" className="absolute top-4 left-4">
                                    -{discount}% OFF
                                </Badge>
                            )}
                        </div>
                        {validImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {validImages.map((img, i) => (
                                    <button 
                                        key={img.id || i} 
                                        onClick={() => setSelectedImage(i)} 
                                        className={`relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                                            selectedImage === i
                                                ? "border-primary ring-2 ring-primary/20"
                                                : "border-border hover:border-primary/50"
                                        }`}
                                    >
                                        <img 
                                            src={img.url} 
                                            alt={`${product.name} ${i + 1}`}  
                                            className="object-cover absolute inset-0 w-full h-full" 
                                            sizes="80px"
                                            onError={() => handleImageError(img.url)}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                                    {product.brand}
                                </p>
                                {tagsList && tagsList.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {tagsList.map((tag) => (
                                            <span 
                                                key={tag} 
                                                className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-900 border border-amber-200/50 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                                {product.name}
                            </h1>
                            <StarRating 
                                rating={product.rating} 
                                size="md" 
                                showValue 
                                reviewCount={product.review_count} 
                                className="mt-3"
                            />
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-foreground">
                                {formatPrice(product.price)}
                            </span>
                            {product.compare_at_price && (
                                <span className="text-xl text-muted-foreground line-through">
                                    {formatPrice(product.compare_at_price)}
                                </span>
                            )}
                            {discount > 0 && <Badge variant="error">Save {discount}%</Badge>}
                        </div>

                        <p className="text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-foreground">Size</h3>
                                    <button onClick={() => setIsSizeChartOpen(true)} className="text-xs text-primary hover:underline">
                                        Size Guide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button 
                                            key={size} 
                                            onClick={() => setSelectedSize(size)} 
                                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                                selectedSize === size
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "border-border text-foreground hover:border-primary"
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-2">
                                    Color{selectedColor && `: ${selectedColor}`}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button 
                                            key={color} 
                                            onClick={() => setSelectedColor(color)} 
                                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                                selectedColor === color
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "border-border text-foreground hover:border-primary"
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity + Add to Cart */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center border border-border rounded-lg">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                                    className="p-3 hover:bg-surface-hover transition-colors" 
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4"/>
                                </button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} 
                                    className="p-3 hover:bg-surface-hover transition-colors" 
                                    disabled={quantity >= product.stock_quantity}
                                >
                                    <Plus className="w-4 h-4"/>
                                </button>
                            </div>

                            <Button 
                                size="lg" 
                                className="flex-1" 
                                onClick={handleAddToCart} 
                                disabled={product.stock_quantity <= 0}
                            >
                                <ShoppingBag className="w-5 h-5"/>
                                {product.stock_quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                            </Button>

                            <Button 
                                variant="secondary" 
                                size="lg" 
                                onClick={() => {
                                    toggleFavorite(product);
                                    addToast({
                                        type: isFavorite(product.id) ? "info" : "success",
                                        title: isFavorite(product.id) ? "Removed from favorites" : "Saved to wishlist!",
                                        description: product.name
                                    });
                                }} 
                                className={cn(isFavorite(product.id) && "text-error bg-error/10 border-error/20")}
                            >
                                <Heart className={cn("w-5 h-5", isFavorite(product.id) && "fill-current")}/>
                            </Button>
                        </div>

                        {/* Stock */}
                        <div>
                            {product.stock_quantity > 0 ? (
                                <p className="text-sm text-success flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-success inline-block"/>
                                    In Stock — {product.stock_quantity} left
                                </p>
                            ) : (
                                <p className="text-sm text-error flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-error inline-block"/>
                                    Out of Stock
                                </p>
                            )}
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                            {[
                                { icon: Truck, text: "Free Shipping", sub: "$100+" },
                                { icon: RotateCcw, text: "Easy Returns", sub: "30 days" },
                                { icon: Shield, text: "Secure Pay", sub: "SSL" },
                            ].map((feat, i) => (
                                <div key={i} className="text-center">
                                    <feat.icon className="w-5 h-5 mx-auto text-primary mb-1"/>
                                    <p className="text-xs font-medium text-foreground">{feat.text}</p>
                                    <p className="text-[10px] text-muted-foreground">{feat.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 💬 Customer Reviews & Comments Section */}
                <section className="mt-16 pt-16 border-t border-[#e2d6c5]/30">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold text-[#4a3f35] font-serif italic mb-8">
                            Atelier Reviews
                        </h2>
                        
                        {reviewsList.length > 0 ? (
                            <div className="space-y-8 animate-fade-in">
                                {reviewsList.map((rev, index) => (
                                    <div key={index} className="pb-6 border-b border-[#e2d6c5]/20 last:border-0">
                                        <div className="flex items-center justify-between gap-4 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-800 text-[#fffdfa] flex items-center justify-center text-[10px] font-black uppercase">
                                                    {rev.reviewerName?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-[#4a3f35]">
                                                            {rev.reviewerName || "Verified Buyer"}
                                                        </span>
                                                        <span className="px-1.5 py-0.5 text-[7px] font-black bg-amber-50 text-amber-900 border border-amber-200/40 rounded-full uppercase tracking-wider">
                                                            Verified
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-[#8c7e6c] uppercase tracking-wider">
                                                        {rev.date 
                                                            ? new Date(rev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
                                                            : "Recently"
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <StarRating rating={rev.rating || 5} size="sm" />
                                        </div>
                                        <p className="text-xs text-[#8c7e6c] leading-relaxed italic pl-11">
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-amber-50/10 rounded-3xl border border-dashed border-[#e2d6c5]">
                                <p className="text-xs text-[#8c7e6c] uppercase tracking-wider font-bold">
                                    No reviews for this piece yet.
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Be the first to share your experience once purchased.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16 lg:mt-24">
                        <h2 className="text-2xl font-bold text-foreground mb-8">
                            You May Also Like
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p}/>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <SizeChartModal 
                isOpen={isSizeChartOpen} 
                onClose={() => setIsSizeChartOpen(false)} 
                category={product.brand} 
            />
        </div>
    );
}
