import React, { useState } from "react";
import { useSettingsStore, STORE_NAME } from "@/stores/useSettingsStore";
import { useToastStore } from "@/stores/useToastStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Save, Lock, Store, Mail, Phone, DollarSign, Package, Bell, Shield } from "lucide-react";

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-start gap-4 py-5 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="w-64 shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children, iconColor = "text-amber-600", iconBg = "bg-amber-100" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h2 className="font-bold text-slate-800 text-sm">{title}</h2>
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const settings = useSettingsStore();
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    contactEmail: settings.contactEmail,
    supportPhone: settings.supportPhone,
    currency: settings.currency,
    taxRate: settings.taxRate,
    freeShippingThreshold: settings.freeShippingThreshold,
    requireEmailVerification: settings.requireEmailVerification,
    enableGuestCheckout: settings.enableGuestCheckout,
    notifyOnNewOrder: settings.notifyOnNewOrder,
    notifyOnLowStock: settings.notifyOnLowStock,
  });

  const handleSave = () => {
    updateSettings({ ...form, storeName: STORE_NAME }); // Always lock ANTIQUE
    addToast({ type: "success", title: "Settings saved!", description: "Changes applied across the platform." });
  };

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const inputCls = "w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all";
  const toggleCls = (on) => `relative w-10 h-5 rounded-full transition-colors cursor-pointer ${on ? "bg-amber-500" : "bg-slate-200"}`;

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your store configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Store Identity */}
      <SectionCard icon={Store} title="Store Identity">
        <SettingRow label="Store Name" description="Your brand name — displayed site-wide">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-sm font-black text-slate-700 tracking-widest uppercase">{STORE_NAME}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Brand name is permanently set to ANTIQUE
          </p>
        </SettingRow>
        <SettingRow label="Contact Email" description="Customer support email address">
          <input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className={inputCls} />
        </SettingRow>
        <SettingRow label="Support Phone" description="Displayed in footer and order confirmations">
          <input type="tel" value={form.supportPhone} onChange={(e) => update("supportPhone", e.target.value)} className={inputCls} />
        </SettingRow>
      </SectionCard>

      {/* Commerce Settings */}
      <SectionCard icon={DollarSign} title="Commerce" iconColor="text-emerald-600" iconBg="bg-emerald-100">
        <SettingRow label="Currency" description="Store currency for all prices">
          <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className={inputCls}>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="PKR">PKR — Pakistani Rupee</option>
          </select>
        </SettingRow>
        <SettingRow label="Tax Rate (%)" description="Applied to all orders at checkout">
          <input type="number" value={form.taxRate} onChange={(e) => update("taxRate", e.target.value)} min={0} max={50} step={0.1} className={inputCls} />
        </SettingRow>
        <SettingRow label="Free Shipping Threshold ($)" description="Orders above this get free shipping">
          <input type="number" value={form.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", e.target.value)} min={0} className={inputCls} />
        </SettingRow>
        <SettingRow label="Guest Checkout" description="Allow purchases without account">
          <button onClick={() => update("enableGuestCheckout", !form.enableGuestCheckout)} className={toggleCls(form.enableGuestCheckout)}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.enableGuestCheckout ? "translate-x-5" : ""}`} />
          </button>
        </SettingRow>
      </SectionCard>

      {/* Notifications */}
      <SectionCard icon={Bell} title="Notifications" iconColor="text-blue-600" iconBg="bg-blue-100">
        <SettingRow label="New Order Alerts" description="Receive notifications for new orders">
          <button onClick={() => update("notifyOnNewOrder", !form.notifyOnNewOrder)} className={toggleCls(form.notifyOnNewOrder)}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.notifyOnNewOrder ? "translate-x-5" : ""}`} />
          </button>
        </SettingRow>
        <SettingRow label="Low Stock Alerts" description="Alert when stock drops to 5 or below">
          <button onClick={() => update("notifyOnLowStock", !form.notifyOnLowStock)} className={toggleCls(form.notifyOnLowStock)}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.notifyOnLowStock ? "translate-x-5" : ""}`} />
          </button>
        </SettingRow>
      </SectionCard>

      {/* Admin Account Info */}
      <SectionCard icon={Shield} title="Admin Account" iconColor="text-purple-600" iconBg="bg-purple-100">
        <SettingRow label="Logged in as" description="Current administrator session">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-800 text-xs font-black">{user?.first_name?.charAt(0) || "A"}</span>
            </div>
            <span className="text-sm text-slate-700">{user?.first_name || "Admin"}</span>
          </div>
        </SettingRow>
      </SectionCard>
    </div>
  );
}
