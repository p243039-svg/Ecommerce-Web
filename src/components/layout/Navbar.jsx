import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

import { ShoppingBag, Search, User, Menu, X, LogOut, Settings, Package, Heart, TrendingUp, LogIn, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn, formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useSettingsStore } from "@/stores/useSettingsStore";
import AnnouncementBar from "./AnnouncementBar";
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const itemCount = useCartStore((s) => s.getItemCount());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const settings = useSettingsStore();
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, brand, product_images(url)")
        .ilike("name", `%${searchQuery}%`)
        .limit(5);
      setSearchResults(data || []);
      setIsSearching(false);
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    window.location.href = "/";
  };
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/products?category=men", label: "Men" },
    { href: "/products?category=women", label: "Women" },
    { href: "/products?category=shoes", label: "Shoes" },
  ];
  return (<header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-500", isScrolled
    ? "bg-[#fafafa]/90 backdrop-blur-xl border-b border-black/5"
    : "bg-transparent")}>
    <AnnouncementBar />
    <nav className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500", isScrolled ? "py-2" : "py-4")}>
      <div className="flex items-center justify-between h-14 sm:h-16 relative">

        {/* Mobile Menu Trigger */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-full hover:bg-black/5 transition-all outline-none">
          {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-800" /> : <Menu className="w-5 h-5 text-gray-800" />}
        </button>

        {/* Logo */}
        <Link to="/" className={cn("flex items-center text-lg sm:text-2xl font-serif font-black tracking-[0.2em] uppercase absolute left-1/2 -translate-x-1/2 transition-opacity duration-500", !isScrolled && pathname === "/" ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible text-gray-900")}>
          {settings.storeName}
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (<Link to={link.href} key={link.href} onClick={() => setIsMobileMenuOpen(false)} className={cn("text-[9px] font-black uppercase tracking-[0.3em] transition-all hover:text-amber-700", pathname === link.href ? "text-amber-700 underline underline-offset-8" : "text-gray-500")}>
            {link.label}
          </Link>))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-4">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 rounded-full hover:bg-black/5 text-gray-600 transition-all">
            <Search className="w-4 h-4 sm:w-5 h-5" />
          </button>

          <Link to="/wishlist" className="p-2 rounded-full hover:bg-black/5 text-gray-600 group hidden sm:flex">
            <Heart className="w-4 h-4 sm:w-5 h-5 group-hover:fill-amber-700 group-hover:text-amber-700 transition-all" />
          </Link>

          <Link to="/cart" className="relative p-2 rounded-full hover:bg-black/5 text-gray-600 transition-all">
            <ShoppingBag className="w-4 h-4 sm:w-5 h-5" />
            {mounted && itemCount > 0 && (<span className="absolute top-1 right-1 w-3.5 h-3.5 bg-amber-700 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-bounce-subtle">
              {itemCount}
            </span>)}
          </Link>

          {/* Profile / Login */}
          {mounted && (<div className="relative" ref={userMenuRef}>
            {user ? (<button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-1.5 sm:p-2 rounded-full border border-gray-100 hover:bg-black/5 transition-all flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-[10px] font-black border border-amber-100">
                {user.first_name?.charAt(0).toUpperCase() || "U"}
              </div>
            </button>) : (<Link to="/login" className="p-2 rounded-full hover:bg-black/5 text-gray-600 transition-all group">
              <LogIn className="w-4 h-4 sm:w-5 h-5 group-hover:text-amber-700 transition-all" />
            </Link>)}

            {/* Desktop User Dropdown */}
            {isUserMenuOpen && user && (<div className="absolute right-0 mt-4 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 animate-slide-up">
              <div className="pb-4 mb-4 border-b border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Signed in as</p>
                <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
              </div>
              <div className="space-y-1">
                {isAdmin && (<Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-lg transition-all">
                  <Settings className="w-4 h-4" /> Switch to Admin
                </Link>)}
                <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link to="/profile/orders" className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                  <Package className="w-4 h-4" /> Orders
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>)}
          </div>)}
        </div>

        {/* 🔍 SEARCH OVERLAY */}
        {isSearchOpen && (<div className="fixed inset-0 z-[110] flex items-start justify-center pt-20 px-4 bg-black/10 backdrop-blur-sm animate-fade-in">
          <div ref={searchRef} className="w-full max-w-[520px] bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="flex-1 bg-transparent text-sm outline-none text-gray-700" />
              {isSearching && <TrendingUp className="w-3 h-3 animate-spin text-amber-600" />}
              <button onClick={() => setIsSearchOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-3.5 h-3.5 text-gray-400" /></button>
            </div>
            {searchResults.length > 0 && (<div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto">
              {searchResults.map((item) => (<Link key={item.id} href={`/products/${item.slug}`} className="flex items-center gap-3 hover:bg-gray-50 px-4 py-3">
                <div className="relative w-10 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  <img src={item.product_images?.[0]?.url || ""} alt={item.name} className="object-cover absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 truncate">{item.name}</h4>
                  <p className="text-xs font-black text-amber-700 mt-0.5">{formatPrice(item.price)}</p>
                </div>
              </Link>))}
            </div>)}
          </div>
        </div>)}
      </div>
    </nav>

    {/* MOBILE MENU */}
    {isMobileMenuOpen && (<div className="lg:hidden fixed inset-0 bg-white z-[120] p-10 animate-fade-in overflow-y-auto">
      <div className="flex justify-between items-center mb-10">
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif font-black tracking-widest text-gray-900 uppercase">{settings.storeName}</Link>
        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-full"><X className="w-6 h-6 text-gray-800" /></button>
      </div>
      <div className="space-y-8">
        {navLinks.map((link) => (<Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="block text-4xl font-serif text-gray-800 hover:text-amber-700">{link.label}</Link>))}
        <div className="pt-10 border-t border-gray-100 space-y-6">
          <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-500"><Heart className="w-5 h-5 text-amber-700" /> Wishlist</Link>
          {user ? (<>
            <div className="space-y-4">
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] mb-4">Account</p>
              {isAdmin && (<Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-lg font-black uppercase tracking-tighter text-amber-700">
                <Settings className="w-5 h-5" /> Admin Panel
              </Link>)}
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-500">
                <User className="w-5 h-5 text-amber-700" /> My Profile
              </Link>
              <Link to="/profile/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-500">
                <Package className="w-5 h-5 text-amber-700" /> My Orders
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-widest text-[10px]">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </>) : (<Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-2xl font-black uppercase tracking-widest text-gray-900 group">
            Login <ArrowRight className="w-6 h-6 ml-auto group-hover:translate-x-2 transition-transform" />
          </Link>)}
        </div>
      </div>
    </div>)}
  </header>);
}
