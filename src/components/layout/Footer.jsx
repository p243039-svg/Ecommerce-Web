import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";

const XIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <footer className="bg-[#1f1a16] border-t border-[#e2d6c5]/20 py-32" />;
  }

  return (
    <footer className="bg-[#1f1a16] text-[#bfb3a0] border-t border-[#e2d6c5]/20 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          
          {/* Brand & Mission */}
          <div className="space-y-6">
            <Link to="/" className="text-xl sm:text-2xl font-serif font-black tracking-[0.2em] uppercase text-[#fffdfa] hover:text-amber-300 transition-colors">
              {settings.storeName}
            </Link>
            <p className="text-xs leading-relaxed text-[#a39482] uppercase tracking-wider">
              Premium fashion for the modern individual. Curated collections that blend timeless elegance with contemporary style.
            </p>
            <div className="flex gap-4 pt-2">
              {[
                { icon: XIcon, label: "Twitter", href: "https://twitter.com" },
                { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
                { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" }
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={social.label} 
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#bfb3a0] hover:bg-amber-800 hover:text-[#fffdfa] hover:border-amber-800 transition-all duration-300" 
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links / Shop */}
          <div>
            <h3 className="text-xs font-black text-[#fffdfa] uppercase tracking-[0.3em] mb-6 pb-2 border-b border-white/5">
              Collections
            </h3>
            <ul className="space-y-4">
              {[
                { to: "/products", label: "All Collections" },
                { to: "/products?category=men", label: "Men's Apparel" },
                { to: "/products?category=women", label: "Women's Apparel" },
                { to: "/products?category=shoes", label: "Luxury Shoes" },
                { to: "/products?category=accessories", label: "Accessories" }
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-xs uppercase tracking-widest text-[#bfb3a0] hover:text-amber-300 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Policy */}
          <div>
            <h3 className="text-xs font-black text-[#fffdfa] uppercase tracking-[0.3em] mb-6 pb-2 border-b border-white/5">
              Client Service
            </h3>
            <ul className="space-y-4">
              {[
                { label: "About Luxe Boutique", to: "/" },
                { label: "Contact Us", to: "/contact" },
                { label: "Shipping & Delivery", to: "/shipping" },
                { label: "Privacy Policy", to: "/privacy-policy" },
                { label: "Cookie Settings", to: "/cookie-policy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.to} 
                    className="text-xs uppercase tracking-widest text-[#bfb3a0] hover:text-amber-300 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-[#fffdfa] uppercase tracking-[0.3em] pb-2 border-b border-white/5">
              Atelier Info
            </h3>
            <ul className="space-y-3.5 text-xs text-[#a39482] uppercase tracking-wider">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>123 Haute Couture Ave, Paris, FR</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-800 shrink-0" />
                <span>{settings.supportPhone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="lowercase">{settings.contactEmail}</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="pt-2">
              <h4 className="text-[10px] font-black text-[#fffdfa] uppercase tracking-[0.2em] mb-3">
                Subscribe to updates
              </h4>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="flex-1 px-4 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-amber-800 text-[#fffdfa] placeholder-[#8c7e6c]"
                />
                <button 
                  type="submit" 
                  className="px-4 py-2.5 text-xs font-black bg-amber-800 hover:bg-amber-700 text-[#fffdfa] uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] uppercase tracking-widest text-[#8c7e6c]">
            © {currentYear} {settings.storeName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              { label: "Privacy", to: "/privacy-policy" },
              { label: "Cookies", to: "/cookie-policy" },
              { label: "Terms", to: "/shipping" },
            ].map((item) => (
              <Link 
                key={item.label} 
                to={item.to} 
                className="text-[10px] uppercase tracking-widest text-[#8c7e6c] hover:text-amber-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
