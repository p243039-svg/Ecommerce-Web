import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { useToastStore } from "@/stores/useToastStore";
import { Search, Loader2, Users, ShoppingCart, Mail, ChevronRight } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  const fetchCustomers = async () => {
    setIsLoading(true);
    // Fetch all orders then aggregate by user
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, email, full_name, total, status, created_at")
      .order("created_at", { ascending: false });
    if (error) { addToast({ type: "error", title: "Failed to fetch customers" }); setIsLoading(false); return; }

    // Aggregate by email
    const map = new Map();
    (orders || []).forEach((o) => {
      if (!map.has(o.email)) {
        map.set(o.email, { email: o.email, name: o.full_name, orders: 0, total: 0, lastOrder: o.created_at });
      }
      const c = map.get(o.email);
      c.orders++;
      c.total += Number(o.total);
      if (new Date(o.created_at) > new Date(c.lastOrder)) c.lastOrder = o.created_at;
    });

    setCustomers(Array.from(map.values()).sort((a, b) => b.total - a.total));
    setIsLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return !q || c.email?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{customers.length} unique customers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-slate-800">{customers.length}</p>
          <p className="text-xs text-slate-500">Total Customers</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-800">
            {customers.length > 0 ? (customers.reduce((s, c) => s + c.orders, 0) / customers.length).toFixed(1) : "0"}
          </p>
          <p className="text-xs text-slate-500">Avg Orders / Customer</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-800">
            {formatPrice(customers.length > 0 ? customers.reduce((s, c) => s + c.total, 0) / customers.length : 0)}
          </p>
          <p className="text-xs text-slate-500">Avg Lifetime Value</p>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, i) => (
                  <tr key={customer.email} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-black">
                            {customer.name?.charAt(0)?.toUpperCase() || customer.email?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{customer.name || "—"}</p>
                          <p className="text-xs text-slate-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-700">{customer.orders}</span>
                      <span className="text-xs text-slate-400 ml-1">orders</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-800">{formatPrice(customer.total)}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-slate-500">
                        {new Date(customer.lastOrder).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
