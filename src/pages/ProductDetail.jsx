import React, { useState, useEffect } from "react";
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
import { Minus, Plus, ShoppingBag, Heart, Truck, RotateCcw, Shield, } from "lucide-react";
export default function ProductDetailPage() {
    const params = useParams();
    const navigate = useNavigate();
    const slug = params.slug;
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((s) => s.addItem);
    const addToast = useToastStore((s) => s.addToast);
    const { toggleFavorite, isFavorite } = useFavoriteStore();
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
    useEffect(() => {
        fetchProduct();
    }, [slug]);
    const fetchProduct = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*, images:product_images(*)")
            .eq("slug", slug)
            .eq("is_active", true)
            .single();
        if (error || !data) {
            setProduct(null);
            setIsLoading(false);
            return;
        }
        setProduct(data);
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
    if (isLoading) {
        return (<div className="min-h-screen bg-background">
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
      </div>);
    }
    if (!product) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Product Not Found
          </h1>
          <Link to="/products" className="text-primary hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>);
    }
    const discount = product.compare_at_price
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
    return (<div className="min-h-screen bg-background">
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
              <img src={product.images[selectedImage]?.url || product.images[0]?.url} alt={product.name}  className="object-cover absolute inset-0 w-full h-full object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              {discount > 0 && (<Badge variant="error" size="md" className="absolute top-4 left-4">
                  -{discount}% OFF
                </Badge>)}
            </div>
            {product.images.length > 1 && (<div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (<button key={img.id} onClick={() => setSelectedImage(i)} className={`relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === i
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"}`}>
                    <img src={img.url} alt={`${product.name} ${i + 1}`}  className="object-cover absolute inset-0 w-full h-full object-cover" sizes="80px"/>
                  </button>))}
              </div>)}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                {product.brand}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                {product.name}
              </h1>
              <StarRating rating={product.rating} size="md" showValue reviewCount={product.review_count} className="mt-3"/>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && (<span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price)}
                </span>)}
              {discount > 0 && (<Badge variant="error">Save {discount}%</Badge>)}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">Size</h3>
                <button onClick={() => setIsSizeChartOpen(true)} className="text-xs text-primary hover:underline">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (<button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${selectedSize === size
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground hover:border-primary"}`}>
                    {size}
                  </button>))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Color{selectedColor && `: ${selectedColor}`}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (<button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${selectedColor === color
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground hover:border-primary"}`}>
                    {color}
                  </button>))}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-surface-hover transition-colors" disabled={quantity <= 1}>
                  <Minus className="w-4 h-4"/>
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="p-3 hover:bg-surface-hover transition-colors" disabled={quantity >= product.stock_quantity}>
                  <Plus className="w-4 h-4"/>
                </button>
              </div>

              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock_quantity <= 0}>
                <ShoppingBag className="w-5 h-5"/>
                {product.stock_quantity <= 0 ? "Out of Stock" : "Add to Cart"}
              </Button>

              <Button variant="secondary" size="lg" onClick={() => {
            toggleFavorite(product);
            addToast({
                type: isFavorite(product.id) ? "info" : "success",
                title: isFavorite(product.id) ? "Removed from favorites" : "Saved to wishlist!",
                description: product.name
            });
        }} className={cn(isFavorite(product.id) && "text-error bg-error/10 border-error/20")}>
                <Heart className={cn("w-5 h-5", isFavorite(product.id) && "fill-current")}/>
              </Button>
            </div>

            {/* Stock */}
            <div>
              {product.stock_quantity > 0 ? (<p className="text-sm text-success flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success inline-block"/>
                  In Stock — {product.stock_quantity} left
                </p>) : (<p className="text-sm text-error flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error inline-block"/>
                  Out of Stock
                </p>)}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              {[
            { icon: Truck, text: "Free Shipping", sub: "$100+" },
            { icon: RotateCcw, text: "Easy Returns", sub: "30 days" },
            { icon: Shield, text: "Secure Pay", sub: "SSL" },
        ].map((feat, i) => (<div key={i} className="text-center">
                  <feat.icon className="w-5 h-5 mx-auto text-primary mb-1"/>
                  <p className="text-xs font-medium text-foreground">{feat.text}</p>
                  <p className="text-[10px] text-muted-foreground">{feat.sub}</p>
                </div>))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (<section className="mt-16 lg:mt-24">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (<ProductCard key={p.id} product={p}/>))}
            </div>
          </section>)}
      </div>

      <SizeChartModal isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} category={product.brand} // Or could use specific category logic
    />
    </div>);
}
