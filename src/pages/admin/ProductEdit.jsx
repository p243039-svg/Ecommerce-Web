import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToastStore } from "@/stores/useToastStore";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "cat-men", label: "Men" },
  { value: "cat-women", label: "Women" },
  { value: "cat-shoes", label: "Shoes" },
  { value: "cat-accessories", label: "Accessories" },
  { value: "cat-beauty", label: "Beauty" },
  // Legacy IDs
  { value: "cat_men", label: "Men (legacy)" },
  { value: "cat_women", label: "Women (legacy)" },
  { value: "cat_shoes", label: "Shoes (legacy)" },
];

function ImagePreview({ url }) {
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  useEffect(() => {
    if (!url || !url.trim()) { setStatus("idle"); return; }
    setStatus("loading");
  }, [url]);

  if (!url || !url.trim()) return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
      <ImageIcon className="w-8 h-8 opacity-30" />
      <p className="text-xs opacity-50">No image URL entered</p>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 gap-2">
          <AlertCircle className="w-8 h-8" />
          <p className="text-xs">Failed to load image</p>
        </div>
      )}
      <img
        src={url}
        alt="Preview"
        className={`w-full h-full object-cover transition-opacity duration-300 ${status === "ok" ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
      />
      {status === "ok" && (
        <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
          <CheckCircle2 className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}

export default function EditProductPage() {
  const params = useParams();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const productId = params.id;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [product, setProduct] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    compare_at_price: "",
    description: "",
    stock_quantity: "0",
    sizes: "",
    colors: "",
    category_id: "cat-men",
    image_urls: [""],
    is_active: true,
  });
  const isNew = productId === "new";

  useEffect(() => {
    if (!isNew) fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setIsFetching(true);
    const { data, error } = await supabase
      .from("products")
      .select(`*, images:product_images(*)`)
      .eq("id", productId)
      .single();

    if (error) {
      addToast({ type: "error", title: "Error fetching product", description: error.message });
      navigate("/admin/products");
    } else if (data) {
      setProduct(data);
      setForm({
        name: data.name || "",
        brand: data.brand || "",
        price: data.price?.toString() || "",
        compare_at_price: data.compare_at_price?.toString() || "",
        description: data.description || "",
        stock_quantity: data.stock_quantity?.toString() || "0",
        sizes: Array.isArray(data.sizes) ? data.sizes.join(", ") : (data.sizes || ""),
        colors: Array.isArray(data.colors) ? data.colors.join(", ") : (data.colors || ""),
        category_id: data.category_id || "cat-men",
        image_urls: data.images?.length > 0 ? data.images.map((img) => img.url) : [""],
        is_active: data.is_active !== false,
      });
    }
    setIsFetching(false);
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name || !form.price) {
      addToast({ type: "warning", title: "Name and price are required" });
      return;
    }
    setIsLoading(true);

    const price = parseFloat(form.price);
    const comparePrice = form.compare_at_price ? parseFloat(form.compare_at_price) : null;
    const stock = parseInt(form.stock_quantity, 10);

    const productPayload = {
      name: form.name.trim(),
      slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
      brand: form.brand.trim(),
      price: isNaN(price) ? 0 : price,
      compare_at_price: isNaN(comparePrice) || !comparePrice ? null : comparePrice,
      description: form.description.trim(),
      stock_quantity: isNaN(stock) ? 0 : stock,
      category_id: form.category_id,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      is_active: form.is_active,
    };

    try {
      let savedProductId = productId;

      if (isNew) {
        const newId = `p-${Date.now()}`;
        const { data: inserted, error: insertError } = await supabase
          .from("products")
          .insert([{ ...productPayload, id: newId }])
          .select()
          .single();
        if (insertError) throw insertError;
        if (inserted) savedProductId = inserted.id;
      } else {
        const { error: updateError } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", productId);
        if (updateError) throw updateError;
      }

      // --- Permanently save images to database ---
      const { error: delImgErr } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", savedProductId);
      if (delImgErr) console.warn("Image delete warning:", delImgErr.message);

      const activeImages = form.image_urls.filter((url) => url && url.trim() !== "");
      if (activeImages.length > 0) {
        const imagesToInsert = activeImages.map((url, index) => ({
          product_id: savedProductId,
          url: url.trim(),
          is_primary: index === 0,
          sort_order: index,
        }));
        const { error: imgError } = await supabase.from("product_images").insert(imagesToInsert);
        if (imgError) {
          console.error("Image Save Error:", imgError);
          addToast({ type: "warning", title: "Product saved but images failed", description: imgError.message });
        }
      }

      addToast({
        type: "success",
        title: isNew ? "Product created!" : "Product updated!",
        description: `"${form.name}" has been saved to the database.`,
      });
      navigate("/admin/products");
    } catch (error) {
      console.error("Save failed:", error);
      addToast({
        type: "error",
        title: "Save failed",
        description: error.message || "Please check your admin permissions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const currentPreviewUrl = form.image_urls[selectedImageIdx] || "";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isNew ? "Add New Product" : "Edit Product"}
            </h1>
            {!isNew && product && (
              <p className="text-sm text-slate-500 mt-0.5">{product.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={() => update("is_active", !form.is_active)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                form.is_active
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {form.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {form.is_active ? "Active" : "Hidden"}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form — left (3/5) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Classic Leather Jacket"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  placeholder="e.g. ANTIQUE"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => update("category_id", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                placeholder="Describe the product..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Pricing & Inventory</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Price ($) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="99.99"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Compare Price ($)</label>
                <input
                  type="number"
                  value={form.compare_at_price}
                  onChange={(e) => update("compare_at_price", e.target.value)}
                  placeholder="149.99"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock Qty</label>
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => update("stock_quantity", e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Sizes (comma-separated)</label>
                <input
                  type="text"
                  value={form.sizes}
                  onChange={(e) => update("sizes", e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Colors (comma-separated)</label>
                <input
                  type="text"
                  value={form.colors}
                  onChange={(e) => update("colors", e.target.value)}
                  placeholder="Black, White, Navy"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Product Images (URLs)</h2>
            <p className="text-xs text-slate-500">Enter direct image URLs. Images are saved permanently to the database.</p>
            <div className="space-y-3">
              {form.image_urls.map((url, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <button
                    onClick={() => setSelectedImageIdx(index)}
                    className={`w-10 h-10 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                      selectedImageIdx === index ? "border-amber-500 shadow-md" : "border-slate-200"
                    }`}
                  >
                    {url ? (
                      <img src={url} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                  </button>
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...form.image_urls];
                        newUrls[index] = e.target.value;
                        setForm((f) => ({ ...f, image_urls: newUrls }));
                        setSelectedImageIdx(index);
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                  </div>
                  {form.image_urls.length > 1 && (
                    <button
                      onClick={() => {
                        const newUrls = form.image_urls.filter((_, i) => i !== index);
                        setForm((f) => ({ ...f, image_urls: newUrls }));
                        setSelectedImageIdx(0);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, image_urls: [...f.image_urls, ""] }))}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Another Image URL
              </button>
            </div>
          </div>
        </div>

        {/* Image Preview Panel — right (2/5) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-24">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Image Preview</h2>
            <div className="w-full aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
              <ImagePreview url={currentPreviewUrl} />
            </div>
            {form.image_urls.filter((u) => u.trim()).length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {form.image_urls.map((url, idx) =>
                  url.trim() ? (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${
                        selectedImageIdx === idx ? "border-amber-500 shadow-md" : "border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={url} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                    </button>
                  ) : null
                )}
              </div>
            )}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Save Info</p>
              <p>✓ All changes are saved permanently to the database</p>
              <p>✓ Images appear immediately on the user portal after saving</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
