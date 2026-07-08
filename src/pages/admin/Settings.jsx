import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastStore } from "@/stores/useToastStore";
import { Settings as SettingsIcon, Store, Bell, ShieldCheck, Save, Truck } from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { cn } from "@/lib/utils";
export default function AdminSettingsPage() {
    const addToast = useToastStore((s) => s.addToast);
    const settings = useSettingsStore();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [form, setForm] = useState({
        storeName: settings.storeName,
        contactEmail: settings.contactEmail,
        supportPhone: settings.supportPhone,
        currency: settings.currency,
        taxRate: settings.taxRate,
        freeShippingThreshold: settings.freeShippingThreshold,
        orderFormat: settings.orderFormat,
        requireEmailVerification: settings.requireEmailVerification,
        enableGuestCheckout: settings.enableGuestCheckout,
        notifyOnNewOrder: settings.notifyOnNewOrder,
        notifyOnLowStock: settings.notifyOnLowStock,
    });
    const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        settings.updateSettings(form);
        setIsLoading(false);
        addToast({
            type: "success",
            title: "Settings Updated",
            description: "Your atelier preferences have been saved globally.",
        });
    };
    const tabs = [
        { id: "general", label: "General", icon: Store },
        { id: "checkout", label: "Checkout & Shipping", icon: Truck },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: ShieldCheck },
    ];
    return (<div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tighter uppercase flex items-center gap-4">
          <SettingsIcon className="w-8 h-8"/>
          Settings
        </h1>
        <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mt-2">
          Global Configurations & Preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
            {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("w-full flex items-center gap-3 px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b border-border/50 last:border-0", activeTab === tab.id
                ? "bg-black text-white"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : "text-primary/70")}/>
                {tab.label}
              </button>))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-sm">
            {activeTab === "general" && (<div className="space-y-6 animate-fade-in text-left">
                <div className="mb-8">
                  <h2 className="text-sm font-black uppercase tracking-widest text-foreground pb-2 border-b border-border/50">Store Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Boutique Name" value={form.storeName} onChange={(e) => update("storeName", e.target.value)} placeholder="Antique Boutique"/>
                  <Input label="Contact Email" type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} placeholder="contact@antique.com"/>
                  <Input label="Support Phone" type="tel" value={form.supportPhone} onChange={(e) => update("supportPhone", e.target.value)} placeholder="+1 (555) 000-0000"/>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-sm font-medium text-foreground">Currency</label>
                    <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="PKR">PKR (Rs)</option>
                    </select>
                  </div>
                </div>
              </div>)}

            {activeTab === "checkout" && (<div className="space-y-6 animate-fade-in text-left">
                <div className="mb-8">
                  <h2 className="text-sm font-black uppercase tracking-widest text-foreground pb-2 border-b border-border/50">Checkout Logic & Shipping</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Free Shipping Threshold ($)" type="number" value={form.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", e.target.value)} placeholder="200"/>
                  <Input label="Global Tax Rate (%)" type="number" step="0.1" value={form.taxRate} onChange={(e) => update("taxRate", e.target.value)} placeholder="8.5"/>
                  <Input label="Order ID Format" value={form.orderFormat} onChange={(e) => update("orderFormat", e.target.value)} placeholder="#ANT-[YYYY]-[ID]"/>
                </div>

                <div className="pt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={cn("w-6 h-6 rounded border flex items-center justify-center transition-all", form.enableGuestCheckout ? "bg-black border-black text-white" : "border-border bg-surface")}>
                      {form.enableGuestCheckout && <ShieldCheck className="w-4 h-4"/>}
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-amber-800 transition-colors">Enable Guest Checkout</span>
                    <input type="checkbox" className="hidden" checked={form.enableGuestCheckout} onChange={(e) => update("enableGuestCheckout", e.target.checked)}/>
                  </label>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 ml-9">Allow customers to checkout without creating an account.</p>
                </div>
              </div>)}

            {activeTab === "notifications" && (<div className="space-y-6 animate-fade-in text-left">
                <div className="mb-8">
                  <h2 className="text-sm font-black uppercase tracking-widest text-foreground pb-2 border-b border-border/50">Admin Alerts</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn("w-6 h-6 rounded border flex items-center justify-center transition-all", form.notifyOnNewOrder ? "bg-black border-black text-white" : "border-border bg-surface")}>
                        {form.notifyOnNewOrder && <ShieldCheck className="w-4 h-4"/>}
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-amber-800 transition-colors">New Order Alerts</span>
                      <input type="checkbox" className="hidden" checked={form.notifyOnNewOrder} onChange={(e) => update("notifyOnNewOrder", e.target.checked)}/>
                    </label>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 ml-9">Receive an email when a new order is placed.</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn("w-6 h-6 rounded border flex items-center justify-center transition-all", form.notifyOnLowStock ? "bg-black border-black text-white" : "border-border bg-surface")}>
                        {form.notifyOnLowStock && <ShieldCheck className="w-4 h-4"/>}
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-amber-800 transition-colors">Low Inventory Alerts</span>
                      <input type="checkbox" className="hidden" checked={form.notifyOnLowStock} onChange={(e) => update("notifyOnLowStock", e.target.checked)}/>
                    </label>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 ml-9">Receive an alert when a product stock drops below 5.</p>
                  </div>
                </div>
              </div>)}

            {activeTab === "security" && (<div className="space-y-6 animate-fade-in text-left">
                <div className="mb-8">
                  <h2 className="text-sm font-black uppercase tracking-widest text-foreground pb-2 border-b border-border/50">Verification & Access</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn("w-6 h-6 rounded border flex items-center justify-center transition-all", form.requireEmailVerification ? "bg-black border-black text-white" : "border-border bg-surface")}>
                        {form.requireEmailVerification && <ShieldCheck className="w-4 h-4"/>}
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-amber-800 transition-colors">Require Email Verification</span>
                      <input type="checkbox" className="hidden" checked={form.requireEmailVerification} onChange={(e) => update("requireEmailVerification", e.target.checked)}/>
                    </label>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 ml-9">New customers must verify their email via OTP before full access.</p>
                  </div>
                </div>
              </div>)}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} isLoading={isLoading} className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-amber-900 transition-all active:scale-95">
              <Save className="w-4 h-4 mr-2"/>
              Commit Changes
            </Button>
          </div>
        </div>
      </div>
    </div>);
}
