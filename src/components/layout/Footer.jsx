import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { useSettingsStore } from "@/stores/useSettingsStore";
export function Footer() {
    const currentYear = new Date().getFullYear();
    const settings = useSettingsStore();
    // Handle Hydration manually as local storage persists state
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return <footer className="bg-surface border-t border-border mt-auto py-32"/>;
    }
    return (<footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-serif font-black tracking-tight uppercase">
              <span className="text-gray-900">
                {settings.storeName}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium fashion for the modern individual. Curated collections
              that blend timeless elegance with contemporary style.
            </p>
            <div className="flex gap-4">
              {["twitter", "instagram", "facebook"].map((social) => (<a key={social} href="#" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200" aria-label={social}>
                  <span className="text-xs font-bold uppercase">
                    {social.charAt(0)}
                  </span>
                </a>))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {[
            { href: "/products?category=men", label: "Men" },
            { href: "/products?category=women", label: "Women" },
            { href: "/products?category=shoes", label: "Shoes" },
            { href: "/products?category=accessories", label: "Accessories" },
            { href: "/products", label: "All Products" },
        ].map((link) => (<li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {[
            { label: "About Us", href: "/#about" },
            { label: "Contact", href: "/contact" },
            { label: "Shipping & Returns", href: "/shipping" },
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Cookie Policy", href: "/cookie-policy" },
        ].map((item) => (<li key={item.label}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0"/>
                123 Fashion Ave, New York, NY
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0"/>
                {settings.supportPhone}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0"/>
                {settings.contactEmail}
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-foreground mb-2">
                Newsletter
              </h4>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="your@email.com" className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"/>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors">
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} {settings.storeName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Cookie Policy", href: "/cookie-policy" },
            { label: "Shipping", href: "/shipping" },
        ].map((item) => (<Link key={item.label} href={item.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {item.label}
              </Link>))}
          </div>
        </div>
      </div>
    </footer>);
}
