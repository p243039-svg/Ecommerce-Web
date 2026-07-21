import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, User, Menu, X, LogOut, Settings, Package, Heart, TrendingUp, LogIn, ArrowRight, Lock } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn, formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useSettingsStore } from "@/stores/useSettingsStore";
import AnnouncementBar from "./AnnouncementBar";

export function Navbar() {
  const [openNav, setOpenNav] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);

  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const itemCount = useCartStore((s) => s.getItemCount());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const settings = useSettingsStore();

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
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
    { href: "/products", label: "Collections" },
    { href: "/products?category=men", label: "Men" },
    { href: "/products?category=women", label: "Women" },
    { href: "/products?category=shoes", label: "Shoes" },
    { href: "/products?category=accessories", label: "Accessories" },
  ];

  const EASE = [0.16, 1, 0.3, 1];

  const isHomePath = pathname === "/";

  return (
    <>
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 w-full${isHomePath ? ' lg:hidden' : ''}`}
      style={{
        height: "72px",
        backgroundColor: pathname === "/" ? "#e8eef2" : "rgba(255, 255, 255, 0.96)",
        backdropFilter: pathname === "/" ? "none" : "blur(8px)",
        borderBottom: pathname === "/" ? "none" : "1px solid rgba(0, 0, 0, 0.05)",
      }}
      initial={{ opacity: 0, y: -90 }}
      animate={{
        opacity: (isVisible || isMobileMenuOpen) ? 1 : 0,
        y: (isVisible || isMobileMenuOpen) ? 0 : -90
      }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
    >
      <AnnouncementBar />

      <div className="relative w-full h-full">
        {/* ── Center White Trapezoid Tab (VEXO shape) ── */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto select-none"
          style={{
            width: "clamp(200px, 48vw, 380px)",
            background: "#ffffff",
            clipPath: "polygon(0 0, 100% 0, 84% 100%, 16% 100%)",
            marginTop: pathname === "/" ? "-16px" : "0px",
            height: pathname === "/" ? "calc(100% + 28px)" : "calc(100% + 20px)",
            boxShadow: pathname === "/" ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Link
            to="/"
            className={cn(
              "text-[14px] sm:text-[15px] font-black tracking-[0.3em] uppercase text-[#1a1a1a] hover:opacity-75 transition-opacity",
              pathname === "/" ? "pt-1 sm:pt-2" : "pt-0 sm:pt-1"
            )}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ANTIQUE
          </Link>
        </div>

        {/* ── Left Navigation Links (Desktop) & Hamburger (Mobile) ── */}
        <div className="absolute left-4 sm:left-8 top-0 h-full flex items-center gap-6">
          {/* Hamburger (Mobile only) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-full hover:bg-black/5 text-[#1a1a1a] transition-all duration-300 outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Nav links (Desktop only) */}
          <nav className="hidden lg:flex items-center gap-6">
            {["SHOP", "MEN", "WOMEN", "TRENDING"].map((label) => {
              const isShop = label === "SHOP";
              return (
                <div
                  key={label}
                  className="relative"
                  onMouseEnter={() => isShop && setOpenNav("SHOP")}
                  onMouseLeave={() => isShop && setOpenNav(null)}
                >
                  <Link
                    to={isShop ? "/products" : `/products?category=${label.toLowerCase()}`}
                    className="text-[11px] font-bold tracking-[0.14em] text-[#1A1A1A] hover:opacity-60 transition-opacity"
                  >
                    {label}
                  </Link>

                  {isShop && openNav === "SHOP" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="absolute left-0 top-full pt-2 w-44 z-[99]"
                    >
                      <div className="bg-white rounded-2xl shadow-2xl p-2 border border-black/5">
                        {[
                          { label: "All Products", href: "/products" },
                          { label: "New Arrivals", href: "/products?sort=latest" },
                          { label: "Best Sellers", href: "/products?sort=popular" },
                          { label: "Gift Cards", href: "/products?category=accessories" }
                        ].map((item) => (
                          <div key={item.label}>
                            <Link
                              to={item.href}
                              className="block px-3 py-2 text-[11px] rounded-xl hover:bg-black/5 text-[#1a1a1a] transition-colors font-medium tracking-normal normal-case"
                            >
                              {item.label}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ── Right Navigation & Actions ── */}
        <div className="absolute right-4 sm:right-8 top-0 h-full flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-6 text-[11px] font-bold tracking-[0.14em] text-[#1A1A1A]">
            <Link to="/products?category=seasonal" className="hover:opacity-60 transition-opacity">SEASONAL</Link>
            <Link to="/products?category=accessories" className="hover:opacity-60 transition-opacity">ACCESSORIES</Link>
          </div>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-full hover:bg-black/5 text-[#1a1a1a] transition-all duration-300"
            title="Search"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* User Profile dropdown */}
          {mounted && (
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-1 rounded-full border border-black/10 hover:bg-black/5 transition-all duration-300 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                      {user.first_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-black/10 shadow-2xl rounded-2xl p-4 animate-slide-up z-[99]">
                      <div className="pb-3 mb-3 border-b border-black/5">
                        <p className="text-[8px] font-black text-black/40 uppercase tracking-[0.2em]">Signed in as</p>
                        <p className="text-xs font-bold text-[#1a1a1a] truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-900 hover:bg-black/5 rounded-lg transition-all"
                          >
                            <Settings className="w-3.5 h-3.5" /> Admin Panel
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] hover:bg-black/5 rounded-lg transition-all"
                        >
                          <User className="w-3.5 h-3.5" /> My Profile
                        </Link>
                        <Link
                          to="/profile/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] hover:bg-black/5 rounded-lg transition-all"
                        >
                          <Package className="w-3.5 h-3.5" /> Order History
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-lg transition-all text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/account">
                  <button className="hidden sm:flex items-center gap-1.5 bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.12em] px-5 py-2.5 rounded-full hover:bg-black transition-colors uppercase">
                    Sign In / Up
                  </button>
                </Link>
              )}
            </div>
          )}

          {/* Cart Icon circle */}
          <Link to="/cart">
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1A1A1A] text-white hover:bg-black transition-colors shrink-0 relative">
              <Lock className="w-3.5 h-3.5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                  {itemCount}
                </span>
              )}
            </button>
          </Link>
        </div>
      </div>

      {/* 🔍 SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 px-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div ref={searchRef} className="w-full max-w-[520px] bg-white border border-black/10 shadow-2xl rounded-3xl overflow-hidden animate-slide-up">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-black/5">
              <Search className="w-4.5 h-4.5 text-black/60" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-sm outline-none text-[#1a1a1a] placeholder:text-black/35 font-medium"
              />
              {isSearching && <TrendingUp className="w-3.5 h-3.5 animate-spin text-black/60" />}
              <button onClick={() => setIsSearchOpen(false)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-4 h-4 text-black/60" />
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="divide-y divide-black/5 max-h-[320px] overflow-y-auto p-2">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    to={`/products/${item.slug}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-4 hover:bg-black/5 px-3 py-2.5 rounded-xl transition-all"
                  >
                    <div className="relative w-10 h-12 bg-muted rounded-lg overflow-hidden shrink-0 border border-black/5">
                      <img src={item.product_images?.[0]?.url || ""} alt={item.name} className="object-cover absolute inset-0 w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#1a1a1a] truncate">{item.name}</h4>
                      <p className="text-[10px] font-black text-black/40 mt-0.5 uppercase tracking-wider">{item.brand}</p>
                    </div>
                    <span className="text-xs font-black text-[#1a1a1a]">{formatPrice(item.price)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.header>

    {/* ══════════════════════════════════════════════════
        MOBILE DRAWER — Portaled at top level (z-[9999])
    ══════════════════════════════════════════════════ */}
    <div className={cn(
      "lg:hidden fixed inset-0 z-[9999] pointer-events-none",
      isMobileMenuOpen ? "pointer-events-auto" : ""
    )}>
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer panel */}
      <div className={cn(
        "absolute inset-y-0 left-0 w-[300px] max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-[10000]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* ── Drawer header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/8 shrink-0 bg-white">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-[15px] font-black tracking-[0.3em] uppercase text-[#1a1a1a]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ANTIQUE
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#1a1a1a] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Nav links (scrollable) ── */}
        <div className="flex-1 overflow-y-auto bg-white">

          {/* Home */}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-6 py-4 border-b border-black/8 text-sm text-[#1a1a1a] hover:bg-black/3 transition-colors"
          >
            Home
          </Link>

          {/* About Us */}
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-6 py-4 border-b border-black/8 text-sm text-[#1a1a1a] hover:bg-black/3 transition-colors"
          >
            About Us
          </Link>

          {/* Our Science */}
          <Link
            to="/our-science"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-6 py-4 border-b border-black/8 text-sm text-[#1a1a1a] hover:bg-black/3 transition-colors"
          >
            Our Science
          </Link>

          {/* Shop (expandable) */}
          <div>
            <button
              onClick={() => setShopExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-black/8 text-sm text-[#1a1a1a] hover:bg-black/3 transition-colors"
            >
              <span>Shop</span>
              <span className="text-lg leading-none text-[#1a1a1a]/40">{shopExpanded ? "−" : "+"}</span>
            </button>
            <AnimatePresence initial={false}>
              {shopExpanded && (
                <motion.div
                  key="shop-sub"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  {[
                    { label: "All Products",  to: "/products" },
                    { label: "Men",           to: "/products?category=men" },
                    { label: "Women",         to: "/products?category=women" },
                    { label: "Trending",      to: "/products?category=trending" },
                    { label: "Accessories",   to: "/products?category=accessories" },
                  ].map(({ label, to }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => { setIsMobileMenuOpen(false); setShopExpanded(false); }}
                      className="flex items-center px-10 py-3 border-b border-black/5 text-xs text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-black/3 transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Us */}
          <Link
            to="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-6 py-4 border-b border-black/8 text-sm text-[#1a1a1a] hover:bg-black/3 transition-colors"
          >
            Contact Us
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-6 py-4 border-b border-black/8 text-sm text-[#1a1a1a] hover:bg-black/3 transition-colors"
          >
            <Heart className="w-4 h-4 text-[#1a1a1a]/50" />
            Wishlist
          </Link>

          {/* Admin link (if admin) */}
          {mounted && user && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-6 py-4 border-b border-black/8 text-sm text-amber-800 hover:bg-amber-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
        </div>

        {/* ── Bottom account section (pinned) ── */}
        <div className="px-6 py-6 border-t border-black/8 shrink-0 bg-white">
          <p className="text-xs font-bold text-[#1a1a1a]/40 uppercase tracking-[0.2em] mb-4">My account</p>

          {mounted && user ? (
            <div className="space-y-3">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-[0.12em] hover:bg-black transition-colors"
              >
                <User className="w-4 h-4" /> My Profile
              </Link>
              <Link
                to="/profile/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-black/15 text-[#1a1a1a] text-xs font-bold uppercase tracking-[0.12em] hover:bg-black/5 transition-colors"
              >
                <Package className="w-4 h-4" /> My Orders
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold uppercase tracking-[0.12em] hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-[0.15em] hover:bg-black transition-colors"
              >
                <User className="w-4 h-4" /> Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-3.5 rounded-xl border border-black/20 text-[#1a1a1a] text-xs font-bold uppercase tracking-[0.15em] hover:bg-black/5 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
