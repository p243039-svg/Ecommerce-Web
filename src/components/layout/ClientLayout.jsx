import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ToastContainer } from "@/components/ui/Toast";
import { useLocation } from "react-router-dom";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuthStore } from "@/stores/useAuthStore";
import { BottomNav } from "./BottomNav";
export function ClientLayout({ children }) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { pathname } = useLocation();
    const initializeAuth = useAuthStore((state) => state.initialize);
    React.useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);
    const isAdminPath = pathname?.startsWith("/admin");
    const isAuthPath = pathname === "/login" || pathname === "/signup" || pathname === "/reset-password" || pathname === "/forgot-password";
    const hideChrome = isAdminPath || isAuthPath;
    return (<>
      {!hideChrome && <Navbar />}
      <main className={`flex-1 ${!hideChrome ? 'pt-20 lg:pt-24' : ''} pb-20 sm:pb-0`}>{children}</main>
      {!hideChrome && <Footer />}
      {!hideChrome && <BottomNav />}
      {!isAdminPath && <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}/>}
      <ToastContainer />
    </>);
}
