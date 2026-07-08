import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/stores/useToastStore";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
export default function EditProductPage() {
    const params = useParams();
    const navigate = useNavigate();
    const addToast = useToastStore((s) => s.addToast);
    const productId = params.id;
    const [isLoading, setIsLoading] = useState(false);
    const [product, setProduct] = useState(null);
    const [form, setForm] = useState({
        name: "",
        brand: "",
        price: "",
        compare_at_price: "",
        description: "",
        stock_quantity: "0",
        sizes: "",
        colors: "",
        category_id: "cat_men",
        image_urls: [""],
    });
    const [variants, setVariants] = useState([]);
    const isNew = productId === "new";
    useEffect(() => {
        if (!isNew) {
            fetchProduct();
        }
    }, [productId]);
    const fetchProduct = async () => {
        setIsLoading(true);
        const { data: productData, error: productError } = await supabase
            .from("products")
            .select(`
        *,
        images:product_images(*)
      `)
            .eq("id", productId)
            .single();
        if (productError) {
            addToast({ type: "error", title: "Error fetching product", description: productError.message });
            navigate("/admin/products");
        }
        else if (productData) {
            setProduct(productData);
            setForm({
                name: productData.name || "",
                brand: productData.brand || "",
                price: productData.price?.toString() || "",
                compare_at_price: productData.compare_at_price?.toString() || "",
                description: productData.description || "",
                stock_quantity: productData.stock_quantity?.toString() || "0",
                sizes: productData.sizes?.join(", ") || "",
                colors: productData.colors?.join(", ") || "",
                category_id: productData.category_id || "cat_men",
                image_urls: productData.images?.length > 0
                    ? productData.images.map((img) => img.url)
                    : [""],
            });
        }
        // Legacy variants section removed for Antique Master Setup
        /*
        const { data: variantData } = await supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", productId);
        
        if (variantData) {
          setVariants(variantData);
        }
        */
        setIsLoading(false);
    };
    const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
    const handleSave = async () => {
        if (!form.name || !form.price) {
            addToast({ type: "warning", title: "Name and price are required" });
            return;
        }
        setIsLoading(true);
        // Cleanup numeric values
        const price = parseFloat(form.price);
        const comparePrice = form.compare_at_price ? parseFloat(form.compare_at_price) : null;
        const stock = parseInt(form.stock_quantity, 10);
        const productData = {
            name: form.name.trim(),
            slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
            brand: form.brand.trim(),
            price: isNaN(price) ? 0 : price,
            compare_at_price: isNaN(comparePrice) ? null : comparePrice,
            description: form.description.trim(),
            stock_quantity: isNaN(stock) ? 0 : stock,
            category_id: form.category_id,
            sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
            colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
            is_active: product ? product.is_active : true
        };
        try {
            let savedProductId = productId;
            if (isNew) {
                // Use a clean ID for new products
                const newId = `p-${Date.now()}`;
                const { data: inserted, error: insertError } = await supabase
                    .from("products")
                    .insert([{ ...productData, id: newId }])
                    .select()
                    .single();
                if (insertError)
                    throw insertError;
                if (inserted)
                    savedProductId = inserted.id;
            }
            else {
                const { error: updateError } = await supabase
                    .from("products")
                    .update(productData)
                    .eq("id", productId);
                if (updateError)
                    throw updateError;
            }
            // Update Images (Delete old ones and add new ones)
            await supabase.from("product_images").delete().eq("product_id", savedProductId);
            const activeImages = form.image_urls.filter(url => url && url.trim() !== "");
            if (activeImages.length > 0) {
                const imagesToInsert = activeImages.map((url, index) => ({
                    product_id: savedProductId,
                    url: url.trim(),
                    is_primary: index === 0,
                    sort_order: index,
                }));
                const { error: imgError } = await supabase.from("product_images").insert(imagesToInsert);
                if (imgError)
                    console.error("Image Save Error:", imgError);
            }
            // Legacy variants update removed for Antique Master Setup
            /*
              await supabase.from("product_variants").delete().eq("product_id", savedProductId);
              const activeVariants = variants.filter(v => v.size && v.color);
              if (activeVariants.length > 0) {
                const variantsToInsert = activeVariants.map(v => ({
                  product_id: savedProductId,
                  size: v.size.trim(),
                  color: v.color.trim(),
                  stock_quantity: v.stock_quantity || 0,
                  sku: v.sku || `${form.brand.slice(0, 3)}-${v.size}-${v.color}-${Date.now()}`.toUpperCase(),
                }));
                await supabase.from("product_variants").insert(variantsToInsert);
              }
            */
            addToast({
                type: "success",
                title: isNew ? "Product created" : "Product updated",
                description: form.name,
            });
            navigate("/admin/products");
            router.refresh(); // Refresh server data
        }
        catch (error) {
            console.error("Save failed:", error);
            addToast({
                type: "error",
                title: "Save failed",
                description: error.message || "Please check your admin permissions."
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="p-2.5 rounded-xl bg-white border border-border hover:bg-black hover:text-white transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tighter uppercase">
              {isNew ? "Assemble Piece" : "Refine Piece"}
            </h1>
            {!isNew && (<p className="text-[10px] sm:text-xs font-black text-amber-700 uppercase tracking-widest mt-0.5">{product?.name}</p>)}
          </div>
        </div>
        {!isNew && (<Badge variant={product?.is_active ? "success" : "default"} className="font-black text-[10px] tracking-widest px-3 py-1">
            {product?.is_active ? "LIVE IN BOUTIQUE" : "ARCHIVED"}
          </Badge>)}
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <Input label="Product Name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Classic Leather Jacket"/>
          </div>

          <div className="sm:col-span-1">
             <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
             <select value={form.category_id} onChange={(e) => update("category_id", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="cat_men">Men</option>
                <option value="cat_women">Women</option>
                <option value="cat_shoes">Shoes</option>
             </select>
          </div>

          <Input label="Brand" value={form.brand} onChange={(e) => update("brand", e.target.value)} placeholder="Antique Haute"/>

          <div className="sm:col-span-2 space-y-3">
             <label className="block text-sm font-medium text-foreground">Product Images (URLs)</label>
             <div className="space-y-3">
                {form.image_urls.map((url, index) => (<div key={index} className="flex gap-2">
                    <div className="relative flex-1 group">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
                      <input type="text" value={url} onChange={(e) => {
                const newUrls = [...form.image_urls];
                newUrls[index] = e.target.value;
                setForm(f => ({ ...f, image_urls: newUrls }));
            }} placeholder="https://images.unsplash.com/..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"/>
                    </div>
                    {form.image_urls.length > 1 && (<button onClick={() => {
                    const newUrls = form.image_urls.filter((_, i) => i !== index);
                    setForm(f => ({ ...f, image_urls: newUrls }));
                }} className="p-2.5 text-muted-foreground hover:text-error hover:bg-error/5 rounded-lg transition-colors border border-border">
                        <Trash2 className="w-4 h-4"/>
                      </button>)}
                  </div>))}
                <Button type="button" variant="secondary" size="sm" className="w-full border-dashed" onClick={() => setForm(f => ({ ...f, image_urls: [...f.image_urls, ""] }))}>
                  <Plus className="w-4 h-4"/> Add Another Image URL
                </Button>
             </div>
          </div>

          <Input label="Price ($)" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="99.99"/>
          <Input label="Compare at Price ($)" type="number" value={form.compare_at_price} onChange={(e) => update("compare_at_price", e.target.value)} placeholder="149.99"/>
          <Input label="Stock Quantity" type="number" value={form.stock_quantity} onChange={(e) => update("stock_quantity", e.target.value)} placeholder="25"/>
          <Input label="Sizes (comma separated)" value={form.sizes} onChange={(e) => update("sizes", e.target.value)} placeholder="S, M, L, XL"/>
          <div className="sm:col-span-2">
            <Input label="Colors (comma separated)" value={form.colors} onChange={(e) => update("colors", e.target.value)} placeholder="Black, Brown, Navy"/>
          </div>

          {/* Variant Management Section (Legacy Not Available) */}
          <div className="sm:col-span-2 space-y-4 pt-6 mt-6 border-t border-border opacity-50 grayscale pointer-events-none">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-bold text-foreground">Product Variants (Legacy)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Use the Sizes and Colors fields above for new inventory.</p>
               </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Product description..." className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all focus:border-primary/50"/>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
          <Link to="/admin/products" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full rounded-xl">Discard Changes</Button>
          </Link>
          <Button onClick={handleSave} isLoading={isLoading} className="w-full sm:w-auto rounded-xl">
            <Save className="w-4 h-4"/>
            {isNew ? "Authorize Creation" : "Commit Changes"}
          </Button>
        </div>
      </div>
    </div>);
}
