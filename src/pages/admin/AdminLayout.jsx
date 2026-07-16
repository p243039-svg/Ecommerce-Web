import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { NotificationDrawer } from "@/components/admin/NotificationDrawer";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  FileText, Settings, Bell, Menu, X, LogOut, Layers,
  BarChart3, ChevronRight, Shield, Store,
} from "lucide-react";

const navGroups = [
  {
    label: "Commerce",
    links: [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
      { href: "/admin/products", icon: Package, label: "Products" },
      { href: "/admin/variants", icon: Layers, label: "Inventory" },
      { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    ],
  },
  {
    label: "Management",
    links: [
      { href: "/admin/customers", icon: Users, label: "Customers" },
      { href: "/admin/marketing", icon: Tag, label: "Marketing" },
      { href: "/admin/reports", icon: FileText, label: "Reports" },
    ],
  },
  {
    label: "System",
    links: [
      { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const { pathname } = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount());

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (!user || !isAdmin) return <AdminLogin />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── SIDEBAR ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-[#111827] z-50 flex flex-col transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-base tracking-widest">ANTIQUE</p>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">Admin Portal</p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.links.map((link) => {
                  const isActive = link.exact
                    ? pathname === link.href
                    : pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                        isActive
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <link.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                      <span>{link.label}</span>
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto text-white/70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-white/10 p-4 space-y-3">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all"
          >
            <Store className="w-4 h-4" />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm">
              <span className="font-black text-slate-800 tracking-widest text-xs uppercase">ANTIQUE</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-500 capitalize">
                {pathname === "/admin" ? "Dashboard" : pathname.replace("/admin/", "").replace("-", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center ring-2 ring-amber-200">
                <span className="text-amber-800 font-black text-sm">
                  {user?.first_name?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{user?.first_name || "Admin"}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <NotificationDrawer isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </div>
  );
}

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setMockAdmin = useAuthStore((s) => s.setMockAdmin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (username === "admin" && password === "admin123") {
      setMockAdmin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">ANTIQUE</h1>
          <p className="text-slate-400 text-sm mt-1">Admin Portal — Sign In</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/25 mt-2"
            >
              Sign In to Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
