import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "@/stores/useSettingsStore";

/* ─── Social SVGs ───────────────────────────────────────────────────── */
const XIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const InstagramIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const FacebookIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

/* ─── Accordion item (mobile only) ─────────────────────────────────── */
function FooterAccordionItem({ title, isOpen, onToggle, children }) {
  return (
    <div className="border-b border-[#1a1a1a]/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-[0.3em]">{title}</span>
        {isOpen
          ? <Minus className="w-3.5 h-3.5 text-[#1a1a1a]/50 shrink-0" />
          : <Plus className="w-3.5 h-3.5 text-[#1a1a1a]/40 shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Shared link style ─────────────────────────────────────────────── */
const linkCls = "text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors duration-200";

/* ─── Footer ────────────────────────────────────────────────────────── */
export function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [emailVal, setEmailVal] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <footer className="bg-[#cdd4da] border-t border-[#1a1a1a]/10 py-32" />;
  }

  const toggle = (id) => setOpenSection((prev) => (prev === id ? null : id));

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailVal.trim()) {
      setSubscribed(true);
      setEmailVal("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  /* ── Column content components ─────────────────────────────────────── */
  const AboutContent = () => (
    <div className="space-y-4">
      <p className="text-[10px] leading-relaxed text-[#1a1a1a]/55 uppercase tracking-[0.12em]">
        Premium fashion for the modern individual. Curated collections that blend timeless elegance with contemporary style.
      </p>
      <div className="flex gap-3 pt-1">
        {[
          { icon: XIcon, label: "Twitter", href: "https://twitter.com" },
          { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
          { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
        ].map(({ icon: Icon, label, href }) => (
          <a
            key={label} href={href} target="_blank" rel="noopener noreferrer"
            aria-label={label}
            className="w-8 h-8 rounded-full bg-white/60 border border-[#1a1a1a]/10 flex items-center justify-center text-[#1a1a1a]/60 hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-all duration-300"
          >
            <Icon />
          </a>
        ))}
      </div>
    </div>
  );

  const ImportantLinksContent = () => (
    <ul className="space-y-3">
      {[
        { label: "Privacy Policy", to: "/privacy-policy" },
        { label: "Return & Refund Policy", to: "/returns-refunds" },
        { label: "Terms & Conditions", to: "/terms-conditions" },
      ].map(({ label, to }) => (
        <li key={to}>
          <Link to={to} className={linkCls}>{label}</Link>
        </li>
      ))}
    </ul>
  );

  const QuickLinksContent = () => (
    <ul className="space-y-3">
      {[
        { label: "About Us", to: "/about" },
        { label: "Contact Us", to: "/contact" },
        { label: "Our Science", to: "/our-science" },
      ].map(({ label, to }) => (
        <li key={to}>
          <Link to={to} className={linkCls}>{label}</Link>
        </li>
      ))}
    </ul>
  );

  const NewsletterContent = () => (
    <div>
      {subscribed ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]/60">
          Thank you for subscribing!
        </p>
      ) : (
        <form className="flex gap-2" onSubmit={handleSubscribe}>
          <input
            type="email"
            required
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-3 py-2.5 text-[10px] bg-white/60 border border-[#1a1a1a]/10 rounded-full focus:outline-none focus:border-[#1a1a1a]/40 text-[#1a1a1a] placeholder-[#1a1a1a]/30 font-medium tracking-[0.08em]"
          />
          <button
            type="submit"
            className="px-3 py-2.5 bg-[#1A1A1A] hover:bg-black text-white rounded-full flex items-center justify-center shrink-0 transition-colors"
            aria-label="Subscribe"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );

  const columns = [
    { id: "about", title: "About Us", Content: AboutContent },
    { id: "important-links", title: "Important Links", Content: ImportantLinksContent },
    { id: "quick-links", title: "Quick Links", Content: QuickLinksContent },
    { id: "newsletter", title: "Newsletter", Content: NewsletterContent },
  ];

  return (
    <footer
      className="text-[#1a1a1a] font-sans mt-auto"
      style={{ background: "radial-gradient(ellipse 100% 80% at 50% 0%, #d8e4ea 0%, #c8d4db 50%, #b8c8d2 100%)" }}
    >
      {/* Top border line */}
      <div className="border-t border-[#1a1a1a]/10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 lg:py-20">


        {/* ── DESKTOP: 4-column grid (md+) ─────────────────────────── */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {columns.map(({ id, title, Content }) => (
            <div key={id} className="space-y-5">
              <h3 className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-[0.3em] pb-3 border-b border-[#1a1a1a]/10">
                {title}
              </h3>
              <Content />
            </div>
          ))}
        </div>

        {/* ── MOBILE: accordion (below md) ─────────────────────────── */}
        <div className="md:hidden">
          {columns.map(({ id, title, Content }) => (
            <FooterAccordionItem
              key={id}
              title={title}
              isOpen={openSection === id}
              onToggle={() => toggle(id)}
            >
              <Content />
            </FooterAccordionItem>
          ))}
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────── */}
        <div className="mt-14 pt-8 border-t border-[#1a1a1a]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40">
            © {currentYear} {settings.storeName || "ANTIQUE"}. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
