import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { NotificationDrawer } from "@/components/admin/NotificationDrawer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, Shield, Tag, Users, BarChart3, FileText, Settings, Bell, Search as SearchIcon, Menu, X, LogOut, Layers, } from "lucide-react";
const navGroups = [
    {
        label: "Commerce",
        links: [
            { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
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
    const settings = useSettingsStore();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const unreadCount = useNotificationStore((s) => s.unreadCount());
    const handleLogout = async () => {
        await logout();
        navigate("/");
    };
    if (!user || !isAdmin) {
        return <AdminLogin />;
    }
    return (<div className="min-h-screen bg-[#fafafa]">
      {/* Top Header */}
      <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-border z-40 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile sidebar toggle */}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle sidebar">
            {isSidebarOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">{settings.storeName.charAt(0).toUpperCase()}</span>
            </div>
            <span className="font-bold tracking-tighter text-xl">{settings.storeName} <span className="text-muted-foreground font-light italic text-xs tracking-widest uppercase ml-1">Atelier</span></span>
          </Link>
          
          <div className="hidden md:flex relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
            <input type="text" placeholder="Quick search..." className="pl-9 pr-4 py-1.5 bg-muted/50 rounded-full text-xs w-64 focus:outline-none focus:ring-1 focus:ring-primary transition-all"/>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsNotificationOpen(true)} className="p-2 rounded-full hover:bg-muted transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground"/>
            {unreadCount > 0 && (<span className="absolute top-2 right-2 w-4 h-4 bg-primary text-[10px] font-black text-white rounded-full border-2 border-white flex items-center justify-center tabular-nums">
                {unreadCount}
              </span>)}
          </button>
          <div className="h-8 w-px bg-border mx-2"/>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user.first_name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Administrator</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
              <Users className="w-4 h-4 text-primary"/>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16 flex min-h-screen">
        {/* Sidebar — hidden on mobile unless toggled, always shown on lg */}
        {isSidebarOpen && (<div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}/>)}
        <aside className={cn("w-64 border-r border-border bg-white fixed top-16 bottom-0 overflow-y-auto z-40 transition-transform duration-300", isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
          <div className="p-6 space-y-8">
            {navGroups.map((group) => (<div key={group.label}>
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-3 opacity-50">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.links.map((link) => {
                const isActive = pathname === link.href ||
                    (link.href !== "/admin" && pathname.startsWith(link.href));
                return (<Link key={link.href} to={link.href} onClick={() => setIsSidebarOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group", isActive
                        ? "bg-black text-white shadow-lg shadow-black/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                        <link.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "group-hover:text-primary")}/>
                        {link.label}
                        {isActive && <div className="ml-auto w-1 h-1 bg-white rounded-full"/>}
                      </Link>);
            })}
                </div>
              </div>))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border bg-white/50 backdrop-blur-sm">
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/5 w-full transition-colors">
              <LogOut className="w-4 h-4"/>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-8 bg-[#fafafa]">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <NotificationDrawer isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)}/>
    </div>);
}
function AdminLogin() {
    const settings = useSettingsStore();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const setMockAdmin = useAuthStore((s) => s.setMockAdmin);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (username === "admin" && password === "admin123") {
            // Direct local bypass
            setMockAdmin();
        }
        else {
            setError("Invalid username or password");
        }
    };
    return (<div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md p-8 bg-surface rounded-2xl border border-border shadow-lg animate-fade-in">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4"/>
          <h1 className="text-2xl font-black text-foreground tracking-tighter uppercase mb-2">
            {settings.storeName} Atelier
          </h1>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            Identity Verification Required
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (<div className="p-3 text-sm text-error bg-error/10 rounded-lg">
              {error}
            </div>)}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Username
            </label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Enter username" required/>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Enter password" required/>
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>);
}
