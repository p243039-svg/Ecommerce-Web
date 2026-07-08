import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import { useToastStore } from "@/stores/useToastStore";
import { Users, Search, Mail, Phone, MapPin, ShoppingBag, ChevronRight } from "lucide-react";
export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const addToast = useToastStore((s) => s.addToast);
    const fetchCustomers = async () => {
        setIsLoading(true);
        // Aggregate distinct customers from the orders table
        const { data, error } = await supabase
            .from("orders")
            .select("email, full_name, phone, city, country, total")
            .order("created_at", { ascending: false });
        if (error) {
            addToast({ type: "error", title: "Error fetching customers", description: error.message });
        }
        else {
            // Logic to group orders by email to get a "CRM" view
            const customerMap = (data || []).reduce((acc, order) => {
                if (!acc[order.email]) {
                    acc[order.email] = {
                        name: order.full_name,
                        email: order.email,
                        phone: order.phone,
                        city: order.city,
                        country: order.country,
                        totalSpend: 0,
                        orderCount: 0,
                    };
                }
                acc[order.email].totalSpend += Number(order.total);
                acc[order.email].orderCount += 1;
                return acc;
            }, {});
            setCustomers(Object.values(customerMap));
        }
        setIsLoading(false);
    };
    useEffect(() => {
        fetchCustomers();
    }, []);
    const filtered = customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return (<div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Customer Network</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Relationship management for {customers.length} unique buyers
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="pl-10"/>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((customer) => (<div key={customer.email} className="bg-white border border-border rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
            {/* Absolute element for premium feel */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100%] transition-all group-hover:bg-primary/10"/>
            
            <div className="flex items-center gap-4 mb-6 relative">
              <div className="w-16 h-16 rounded-3xl bg-black flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-black">{customer.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground truncate">{customer.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3"/>
                  {customer.city}, {customer.country}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Mail className="w-4 h-4"/>
                </div>
                {customer.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Phone className="w-4 h-4"/>
                </div>
                {customer.phone}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Lifetime Value</p>
                <p className="text-xl font-black text-foreground tabular-nums">{formatPrice(customer.totalSpend)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Orders</p>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary"/>
                  <p className="text-xl font-black text-foreground tabular-nums">{customer.orderCount}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
               <Link to={`/admin/customers/${encodeURIComponent(customer.email)}`}>
                 <Button variant="ghost" className="rounded-full group/btn">
                    View Profile
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1"/>
                 </Button>
               </Link>
            </div>
          </div>))}
        {filtered.length === 0 && (<div className="col-span-full py-20 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-10"/>
            <p className="text-muted-foreground text-lg">No customers found.</p>
          </div>)}
      </div>
    </div>);
}
