import React from "react";
import { Routes, Route } from "react-router-dom";

// Client Pages
import Home from "../pages/Home";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Contact from "../pages/Contact";
import CookiePolicy from "../pages/CookiePolicy";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login";
import Notifications from "../pages/Notifications";
import Privacy from "../pages/Privacy";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Profile from "../pages/Profile";
import ProfileOrders from "../pages/ProfileOrders";
import ResetPassword from "../pages/ResetPassword";
import Shipping from "../pages/Shipping";
import Signup from "../pages/Signup";
import Wishlist from "../pages/Wishlist";
import About from "../pages/About";
import OurScience from "../pages/OurScience";
import ReturnsRefunds from "../pages/ReturnsRefunds";

// Admin Pages
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Customers from "../pages/admin/Customers";
import CustomerDetail from "../pages/admin/CustomerDetail";
import Inventory from "../pages/admin/Inventory";
import Marketing from "../pages/admin/Marketing";
import Orders from "../pages/admin/Orders";
import AdminProducts from "../pages/admin/Products";
import ProductEdit from "../pages/admin/ProductEdit";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";
import Variants from "../pages/admin/Variants";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Client Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/login" element={<Login />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/orders" element={<ProfileOrders />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/shipping" element={<Shipping />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/about" element={<About />} />
      <Route path="/our-science" element={<OurScience />} />
      <Route path="/returns-refunds" element={<ReturnsRefunds />} />
      <Route path="/terms-conditions" element={<div className="min-h-screen flex items-center justify-center bg-[#f4ebe0] text-[#4a3f35] px-6 py-20"><div className="max-w-2xl text-center"><h1 className="text-4xl font-serif font-black tracking-[0.15em] uppercase mb-6">Terms &amp; Conditions</h1><p className="text-base leading-relaxed text-[#7a6a5a]">By using our site you agree to our terms of service. Please contact us for the full terms document.</p></div></div>} />

      {/* Admin Routes wrapped in AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:email" element={<CustomerDetail />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/:id" element={<ProductEdit />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="variants" element={<Variants />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl font-bold bg-[#f4ebe0] text-[#4a3f35]">404 | Page Not Found</div>} />
    </Routes>
  );
}
