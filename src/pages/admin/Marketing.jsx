import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice, cn } from "@/lib/utils";
import { useToastStore } from "@/stores/useToastStore";
import { Tag, Trash2, Calendar, Percent, Banknote, Ticket, Power } from "lucide-react";
export default function MarketingPage() {
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const addToast = useToastStore((s) => s.addToast);
    // Form State
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_purchase: "0",
        max_uses: "100",
        expiry_date: "",
    });
    const fetchCoupons = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            addToast({ type: "error", title: "Error fetching coupons", description: error.message });
        }
        else {
            setCoupons(data || []);
        }
        setIsLoading(false);
    };
    useEffect(() => {
        fetchCoupons();
    }, []);
    const handleCreateCoupon = async () => {
        if (!newCoupon.code || !newCoupon.discount_value) {
            addToast({ type: "warning", title: "Missing fields", description: "Please fill in all required fields." });
            return;
        }
        setIsCreating(true);
        const { error } = await supabase.from("coupons").insert([
            {
                ...newCoupon,
                code: newCoupon.code.toUpperCase().replace(/\s/g, ""),
                discount_value: parseFloat(newCoupon.discount_value),
                min_purchase: parseFloat(newCoupon.min_purchase),
                max_uses: parseInt(newCoupon.max_uses),
                expiry_date: newCoupon.expiry_date ? new Date(newCoupon.expiry_date).toISOString() : null,
            },
        ]);
        if (error) {
            addToast({ type: "error", title: "Creation failed", description: error.message });
        }
        else {
            addToast({ type: "success", title: "Coupon created", description: `Code ${newCoupon.code} is now active.` });
            setNewCoupon({
                code: "",
                discount_type: "percentage",
                discount_value: "",
                min_purchase: "0",
                max_uses: "100",
                expiry_date: "",
            });
            fetchCoupons();
        }
        setIsCreating(false);
    };
    const toggleStatus = async (id, active) => {
        const { error } = await supabase
            .from("coupons")
            .update({ is_active: !active })
            .eq("id", id);
        if (error) {
            addToast({ type: "error", title: "Status update failed", description: error.message });
        }
        else {
            fetchCoupons();
        }
    };
    const deleteCoupon = async (id) => {
        const { error } = await supabase.from("coupons").delete().eq("id", id);
        if (error) {
            addToast({ type: "error", title: "Deletion failed", description: error.message });
        }
        else {
            fetchCoupons();
        }
    };
    return (<div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">Campaigns & Promotions</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Drive conversion with {coupons.length} active discount strategies
          </p>
        </div>
      </div>

      {/* Coupon Creator */}
      <div className="bg-black text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-bl-full blur-3xl -z-1"/>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Ticket className="w-8 h-8 text-primary"/>
            <h2 className="text-2xl font-black tracking-tight">Create New Voucher</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Voucher Code</label>
              <Input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="E.G. SUMMER25" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 rounded-2xl focus:ring-primary"/>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Type</label>
              <select value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })} className="w-full h-12 rounded-2xl bg-white/10 border border-white/20 text-white px-4 outline-none focus:ring-1 focus:ring-primary">
                <option value="percentage" className="bg-black">Percentage (%)</option>
                <option value="fixed" className="bg-black">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Value</label>
              <Input type="number" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })} placeholder="20" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 rounded-2xl"/>
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateCoupon} isLoading={isCreating} className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-2xl font-black transition-all active:scale-95">
                Launch Campaign
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Min. Purchase ($)</label>
              <Input type="number" value={newCoupon.min_purchase} onChange={(e) => setNewCoupon({ ...newCoupon, min_purchase: e.target.value })} className="bg-white/10 border-white/20 text-white h-12 rounded-2xl"/>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Max Uses</label>
              <Input type="number" value={newCoupon.max_uses} onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })} className="bg-white/10 border-white/20 text-white h-12 rounded-2xl"/>
            </div>
            <div className="lg:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Expiry Date</label>
              <Input type="date" value={newCoupon.expiry_date} onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })} className="bg-white/10 border-white/20 text-white h-12 rounded-2xl"/>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          Active Promotions
          <Badge className="bg-primary/10 text-primary border-none">{coupons.length}</Badge>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon) => (<div key={coupon.id} className={cn("p-8 rounded-[2rem] border transition-all flex justify-between items-start group", coupon.is_active ? "bg-white border-border hover:border-black/20" : "bg-muted/30 border-dashed border-border opacity-60")}>
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black tracking-tighter">{coupon.code}</p>
                  <Badge variant={coupon.is_active ? "success" : "default"}>
                    {coupon.is_active ? "Live" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Incentive</p>
                    <p className="font-bold flex items-center gap-1">
                      {coupon.discount_type === "percentage" ? (<><Percent className="w-3 h-3"/> {coupon.discount_value}% OFF</>) : (<><Banknote className="w-3 h-3"/> {formatPrice(coupon.discount_value)} OFF</>)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Usage</p>
                    <p className="font-bold">{coupon.current_uses} / {coupon.max_uses}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expires</p>
                    <p className="font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3"/>
                      {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => toggleStatus(coupon.id, coupon.is_active)} className="p-3 rounded-full hover:bg-muted transition-colors" title={coupon.is_active ? "Deactivate" : "Activate"}>
                  <Power className={cn("w-5 h-5", coupon.is_active ? "text-success" : "text-muted-foreground")}/>
                </button>
                <button onClick={() => deleteCoupon(coupon.id)} className="p-3 rounded-full hover:bg-error/10 hover:text-error transition-colors" title="Delete">
                  <Trash2 className="w-5 h-5"/>
                </button>
              </div>
            </div>))}
          {coupons.length === 0 && (<div className="col-span-full py-12 text-center bg-muted/20 border-2 border-dashed border-border rounded-[2.5rem]">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-10"/>
               <p className="text-muted-foreground">No active marketing campaigns found.</p>
            </div>)}
        </div>
      </div>
    </div>);
}
