import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    ArrowUpRight,
    ChevronRight,
    Heart,
    Play,
    Package,
    Mail,
    Lock,
} from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { StoreName } from "@/components/ui/StoreName";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { TerminalLoader } from "@/components/ui/TerminalLoader";

// ---- shared motion presets (one consistent easing curve site-wide) ----
const EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.08, ease: EASE },
    }),
};

const reveal = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

const dropdownVariants = {
    hidden: { opacity: 0, y: -8 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.22, ease: EASE, staggerChildren: 0.05 },
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};
const dropdownItem = {
    hidden: { opacity: 0, y: -6 },
    show: { opacity: 1, y: 0 },
};

const NAV_LINKS = [
    { label: "Shop", items: ["All Products", "New Arrivals", "Best Sellers", "Gift Cards"] },
    { label: "Men" },
    { label: "Women" },
    { label: "Trending" },
];

// ---- Typewriter hook ----
// Types the static prefix once, then cycles through `words` — erasing and retyping each.
const TYPE_SPEED = 35;   // ms per character typed
const DELETE_SPEED = 20;   // ms per character deleted
const PAUSE_AFTER = 1500; // ms to hold the full word before deleting
const PAUSE_BEFORE = 200;  // ms to wait before typing the next word

function useTypewriter(prefix, words) {
    const [display, setDisplay] = useState("");
    const [wordIdx, setWordIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [phase, setPhase] = useState("typing-prefix"); // typing-prefix | pause | deleting | waiting

    useEffect(() => {
        let timer;
        if (phase === "typing-prefix") {
            if (charIdx < prefix.length) {
                timer = setTimeout(() => {
                    setDisplay(prefix.slice(0, charIdx + 1));
                    setCharIdx((c) => c + 1);
                }, TYPE_SPEED);
            } else {
                // prefix done — start typing first word
                setCharIdx(0);
                setPhase("typing-word");
            }
        } else if (phase === "typing-word") {
            const word = words[wordIdx];
            if (charIdx < word.length) {
                timer = setTimeout(() => {
                    setDisplay(prefix + word.slice(0, charIdx + 1));
                    setCharIdx((c) => c + 1);
                }, TYPE_SPEED);
            } else {
                // word fully typed — pause
                timer = setTimeout(() => setPhase("deleting"), PAUSE_AFTER);
            }
        } else if (phase === "deleting") {
            const word = words[wordIdx];
            if (charIdx > 0) {
                timer = setTimeout(() => {
                    setDisplay(prefix + word.slice(0, charIdx - 1));
                    setCharIdx((c) => c - 1);
                }, DELETE_SPEED);
            } else {
                // word fully deleted — wait, then type next word
                setWordIdx((i) => (i + 1) % words.length);
                timer = setTimeout(() => setPhase("typing-word"), PAUSE_BEFORE);
            }
        }
        return () => clearTimeout(timer);
    }, [phase, charIdx, wordIdx, prefix, words]);

    return display;
}

const HERO_PREFIX = "Refinement in Every Season\nEvery ";
const HERO_WORDS = ["Stitch!", "Season!", "Piece!", "Detail!", "Stitch!"];

export default function HomePage() {
    const [showLoader, setShowLoader] = useState(true);
    const handleLoaderComplete = useCallback(() => {
        setShowLoader(false);
    }, []);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [openNav, setOpenNav] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const heroText = useTypewriter(HERO_PREFIX, HERO_WORDS);

    const [cycleIdx, setCycleIdx] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCycleIdx((i) => (i + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const SLOT_L_IMAGES = ["/images/atelier_1.png", "/images/atelier_2.png", "/images/atelier_3.png"];
    const SLOT_M_IMAGES = ["/images/atelier_2.png", "/images/atelier_3.png", "/images/atelier_1.png"];
    const SLOT_R_IMAGES = ["/images/atelier_3.png", "/images/atelier_1.png", "/images/atelier_2.png"];

    const slideDownVariants = {
        enter: { y: "-100%", opacity: 0 },
        center: { y: "0%", opacity: 1, transition: { duration: 0.8, ease: EASE } },
        exit: { y: "100%", opacity: 0, transition: { duration: 0.8, ease: EASE } }
    };

    useEffect(() => {
        async function loadData() {
            // Load Featured
            const { data: featured } = await supabase
                .from("products")
                .select("*, images:product_images(*)")
                .eq("is_featured", true)
                .limit(4);
            setFeaturedProducts(featured || []);

            // Load Top Selling
            const { data: topSelling } = await supabase
                .from("products")
                .select("*, images:product_images(*)")
                .order("review_count", { ascending: false })
                .limit(8);
            setTopSellingProducts(topSelling || []);
        }
        loadData();
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setIsSubscribed(true);
            setEmail("");
            setTimeout(() => setIsSubscribed(false), 5000);
        }
    };

    return (
        <div className="flex flex-col overflow-x-hidden bg-[#cdd4da] min-h-screen">
            {showLoader && <TerminalLoader onComplete={handleLoaderComplete} />}

            {/* ═══ ROUNDED CARD FRAME — solid thick white border ═══ */}
            <div className="relative mx-2 mt-2 sm:mx-4 sm:mt-4 rounded-[32px] sm:rounded-[40px] overflow-hidden border-[12px] sm:border-[16px] border-white bg-[#b8c8d2]"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% -10%, #e8eef2 0%, #c8d4db 40%, #b8c8d2 100%)",
                    minHeight: "calc(100vh - 16px)",
                }}
            >
                {/* Subtle radial spotlight behind headline */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(255,255,255,0.45) 0%, transparent 70%)",
                    }}
                />

                {/* ─── NAVBAR — VEXO Trapezoid Shape ───────────────────── */}
                <motion.header
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="relative z-50 w-full"
                    style={{ height: "72px" }}
                >
                    {/* ── Center White Trapezoid Tab (VEXO shape) ── */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto select-none"
                        style={{
                            width: "clamp(260px, 28vw, 380px)",
                            background: "#ffffff",
                            clipPath: "polygon(0 0, 100% 0, 84% 100%, 16% 100%)",
                            // Offsets to overlay and merge with the top white border
                            marginTop: "-16px",
                            height: "calc(100% + 28px)",
                        }}
                    >
                        <Link
                            to="/"
                            className="text-[15px] font-black tracking-[0.3em] uppercase text-[#1a1a1a] hover:opacity-75 transition-opacity pt-4"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                            ANTIQUE
                        </Link>
                    </div>

                    {/* ── Left Navigation Links ── */}
                    <nav className="absolute left-4 sm:left-8 top-0 h-full flex items-center gap-6">
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
                                            variants={dropdownVariants}
                                            initial="hidden"
                                            animate="show"
                                            exit="exit"
                                            className="absolute left-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-2xl p-2 border border-black/5"
                                        >
                                            {["All Products", "New Arrivals", "Best Sellers", "Gift Cards"].map((item) => (
                                                <motion.div key={item} variants={dropdownItem}>
                                                    <Link
                                                        to="/products"
                                                        className="block px-3 py-2 text-[11px] rounded-xl hover:bg-black/5 text-[#1a1a1a] transition-colors font-medium tracking-normal normal-case"
                                                    >
                                                        {item}
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* ── Right Navigation & Actions ── */}
                    <div className="absolute right-4 sm:right-8 top-0 h-full flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-6 text-[11px] font-bold tracking-[0.14em] text-[#1A1A1A]">
                            <Link to="/products?category=seasonal" className="hover:opacity-60 transition-opacity">SEASONAL</Link>
                            <Link to="/products?category=accessories" className="hover:opacity-60 transition-opacity">ACCESSORIES</Link>
                        </div>
                        <Link to="/login">
                            <button className="bg-[#1A1A1A] text-white text-[10px] font-bold tracking-[0.12em] px-5 py-2.5 rounded-full hover:bg-black transition-colors uppercase">
                                Sign In / Up
                            </button>
                        </Link>
                        <Link to="/cart">
                            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1A1A1A] text-white hover:bg-black transition-colors shrink-0">
                                <Lock className="w-3.5 h-3.5" />
                            </button>
                        </Link>
                    </div>
                </motion.header>


                {/* ─── HERO ───────────────────────────────────────────── */}
                <section className="relative flex flex-col items-center text-center px-4 pt-14 pb-0 overflow-hidden">

                    {/* Headline — typewriter that loops on the last word */}
                    <motion.h1
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.05, ease: EASE }}
                        className="relative z-10 font-bold text-[#0f0f0f] leading-[1.05] tracking-tight whitespace-pre-line"
                        style={{ fontSize: "clamp(2.0rem, 5vw, 3.8rem)" }}
                    >
                        {/* Static prefix portion (before the cycling word) */}
                        {heroText.includes("\n")
                            ? (
                                <>
                                    {heroText.split("\n")[0]}
                                    <br />
                                    {/* Everything after the newline — split at prefix end to style the cycling word */}
                                    {(() => {
                                        const after = heroText.split("\n")[1] ?? "";
                                        const staticPart = "Every "; // the non-cycling part on line 2
                                        const cyclingPart = after.startsWith(staticPart)
                                            ? after.slice(staticPart.length)
                                            : after;
                                        return (
                                            <>
                                                {staticPart.slice(0, after.length > staticPart.length
                                                    ? staticPart.length
                                                    : after.length)}
                                                <em
                                                    className="font-extrabold tracking-wider uppercase not-italic"
                                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                                >
                                                    {cyclingPart}
                                                </em>
                                            </>
                                        );
                                    })()}
                                </>
                            )
                            : heroText
                        }
                        {/* Blinking cursor */}
                        <span
                            className="inline-block w-[3px] h-[0.85em] bg-[#0f0f0f] ml-1 align-middle"
                            style={{ animation: "blink 0.8s step-end infinite" }}
                        />
                    </motion.h1>
                    <style>{`
                        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
                    `}</style>

                    {/* CTA pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.22, ease: EASE }}
                        className="relative z-10 flex items-center gap-3 mt-7"
                    >
                        <Link to="/products">
                            <button className="bg-[#0f0f0f] text-white text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 rounded-full hover:bg-black transition-colors shadow-lg">
                                Shop Now
                            </button>
                        </Link>
                        <a href="#collection">
                            <button className="bg-white text-[#0f0f0f] text-[11px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 rounded-full hover:bg-white/80 transition-colors shadow">
                                Explore All
                            </button>
                        </a>
                    </motion.div>

                    {/* ── Three-column composition: avatar | hero image | video card ── */}
                    <div className="relative w-full max-w-4xl mt-10 flex items-end justify-center">

                        {/* Left: avatar group + tagline */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
                            className="hidden lg:flex flex-col items-start absolute left-0 bottom-28 max-w-[200px]"
                        >
                            {/* Avatar stack — use first 3 product images if available */}
                            <div className="flex -space-x-3 mb-3">
                                {[0, 1, 2].map((idx) => (
                                    <div
                                        key={idx}
                                        className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-[#b8c4cc] shrink-0"
                                    >
                                        {topSellingProducts[idx]?.images?.[0]?.url && (
                                            <img
                                                src={topSellingProducts[idx].images[0].url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[11px] text-[#4a4a4a] leading-relaxed text-left">
                                Discover bespoke pieces built for comfort without compromising on refinement.
                            </p>
                        </motion.div>

                        {/* Center: hero portrait — product image rises from bottom, no border-radius at top */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
                            className="relative w-72 sm:w-80 md:w-96 flex-shrink-0"
                            style={{ aspectRatio: "3/4" }}
                        >
                            <div className="w-full h-full rounded-t-[2.5rem] overflow-hidden bg-[#b8c4cc]">
                                <img
                                    src={
                                        topSellingProducts[0]?.images?.[0]?.url ||
                                        topSellingProducts[0]?.image_url ||
                                        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=90"
                                    }
                                    alt={topSellingProducts[0]?.name || "Featured Collection"}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                        </motion.div>

                        {/* Right: floating video preview card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
                            className="hidden lg:flex absolute right-0 bottom-28 w-48 rounded-2xl overflow-hidden bg-[#0f0f0f] items-center justify-center group cursor-pointer shadow-2xl"
                            style={{ aspectRatio: "16/10" }}
                        >
                            <img
                                src={
                                    topSellingProducts[1]?.images?.[0]?.url ||
                                    topSellingProducts[1]?.image_url ||
                                    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80"
                                }
                                alt="Collection preview"
                                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                            />
                            <div className="relative w-10 h-10 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                                <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
            {/* ════════════════════════════════════════════════════════════ */}

            {/* ─── SECTION 2: THREE-IMAGE EDITORIAL WITH SCROLLING MARQUEE ─── */}
            <motion.section
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="relative py-20 px-6 sm:px-10 max-w-[1400px] mx-auto w-full overflow-hidden mt-6 bg-[#edf1f2]/60 backdrop-blur rounded-[28px] border border-white/40"
            >
                {/* 1. Continuous Background Marquee Text */}
                <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none z-0">
                    <motion.div
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 60 }}
                        className="flex whitespace-nowrap text-[16vw] font-black text-[#1a1a1a]/[0.05] uppercase tracking-widest"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        <span>ANTIQUE APPAREL ACTIVE STYLE CLASSIC PRESTIGE ESSENTIAL SILHOUETTE &bull;&nbsp;</span>
                        <span>ANTIQUE APPAREL ACTIVE STYLE CLASSIC PRESTIGE ESSENTIAL SILHOUETTE &bull;&nbsp;</span>
                    </motion.div>
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                    {/* Left Column: Descriptive text aligned bottom */}
                    <div className="lg:col-span-3 flex flex-col justify-end h-full order-2 lg:order-1 pt-6 lg:pt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="max-w-xs space-y-3 text-left"
                        >
                            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8a8172] uppercase">Core Collection</span>
                            <p className="text-xs text-[#4a4a4a] leading-relaxed font-medium">
                                Performance-driven silhouettes constructed for modern comfort—built for summer warmth and winter protection.
                            </p>
                        </motion.div>
                    </div>

                    {/* Middle Column: The 3 Clickable Images Composition */}
                    <div className="lg:col-span-6 flex items-center justify-center gap-4 sm:gap-6 order-1 lg:order-2">
                        {/* Image 1: Left Small */}
                        {topSellingProducts[2] && (
                            <Link
                                to={`/products/${topSellingProducts[2].slug}`}
                                className="w-1/4 aspect-[2/3] sm:aspect-[9/14] rounded-2xl overflow-hidden bg-[#b8c4cc]/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-md block shrink-0"
                            >
                                <img
                                    src={topSellingProducts[2].images?.[0]?.url || topSellingProducts[2].image_url}
                                    alt={topSellingProducts[2].name}
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                        )}

                        {/* Image 2: Center Large */}
                        {topSellingProducts[0] && (
                            <Link
                                to={`/products/${topSellingProducts[0].slug}`}
                                className="w-2/5 aspect-[3/4] sm:aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-[#b8c4cc]/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-lg block shrink-0"
                            >
                                <img
                                    src={topSellingProducts[0].images?.[0]?.url || topSellingProducts[0].image_url}
                                    alt={topSellingProducts[0].name}
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                        )}

                        {/* Image 3: Right Small */}
                        {topSellingProducts[1] && (
                            <Link
                                to={`/products/${topSellingProducts[1].slug}`}
                                className="w-1/4 aspect-[2/3] sm:aspect-[9/14] rounded-2xl overflow-hidden bg-[#b8c4cc]/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-md block shrink-0"
                            >
                                <img
                                    src={topSellingProducts[1].images?.[0]?.url || topSellingProducts[1].image_url}
                                    alt={topSellingProducts[1].name}
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                        )}
                    </div>

                    {/* Right Column: Descriptive text aligned top */}
                    <div className="lg:col-span-3 flex flex-col justify-start h-full order-3">
                        <motion.div
                            initial={{ opacity: 0, y: -15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="max-w-xs space-y-3 text-left lg:text-right ml-auto"
                        >
                            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8a8172] uppercase">Atelier Fit</span>
                            <p className="text-xs text-[#4a4a4a] leading-relaxed font-medium">
                                Stay insulated, move freely. Our seasonal edits blend high-grade fabrications with maximum flexibility to endure any condition.
                            </p>
                        </motion.div>
                    </div>

                </div>
            </motion.section>


            {/* ---------------- FRESH FITS GRID ---------------- */}
            <motion.section
                id="collection"
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="py-24 px-4 sm:px-6 lg:px-10 max-w-[1400px] mx-auto w-full"
            >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 text-center sm:text-left">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8172]">New Arrival</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#141414] text-center">
                        Fresh Fits For <span className="font-light italic">Your</span>
                        <br />
                        Next <span className="font-light italic">Season!</span>
                    </h2>
                    <Link to="/products" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141414] hover:opacity-60 transition-opacity">
                        All Brands
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {topSellingProducts.map((product, i) => (
                        <motion.div
                            key={product.id}
                            variants={fadeUp}
                            custom={i}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            className="group"
                        >
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#e5e2da]">
                                <Link to={`/products/${product.slug}`} className="absolute inset-0 block">
                                    <img
                                        src={product.images?.[0]?.url || product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <span className="absolute top-3 left-3 bg-white/90 text-[10px] font-medium px-3 py-1 rounded-full z-10">
                                        Winter
                                    </span>
                                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 flex items-center justify-between z-10">
                                        <div>
                                            <p className="text-[11px] font-semibold text-[#141414] leading-tight">{product.name}</p>
                                            <p className="text-[10px] text-[#6b6b6b]">USD {product.price}</p>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-[#141414] shrink-0" />
                                    </div>
                                </Link>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform z-20"
                                >
                                    <Heart className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-center mt-14">
                    <Link to="/products">
                        <button className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-black transition-colors">
                            See All Brands
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                </div>
            </motion.section>

            {/* ---------------- FEATURED MASTERPIECES ---------------- */}
            {featuredProducts.length > 0 && (
                <motion.section
                    variants={reveal}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-80px" }}
                    className="py-24 px-4 sm:px-6 lg:px-10 max-w-[1400px] mx-auto w-full"
                >
                    <div className="text-center mb-14 space-y-3">
                        <span className="text-[11px] font-semibold text-[#8a8172] tracking-[0.3em] uppercase">Atelier Highlights</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#141414]">Featured Pieces.</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {featuredProducts.map((product, i) => (
                            <motion.div
                                key={product.id}
                                variants={fadeUp}
                                custom={i}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                whileHover={{ y: -6 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* ─── SECTION 5: HERITAGE THREE-IMAGE CAROUSEL ─── */}
            <motion.section
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="relative py-20 px-6 sm:px-10 max-w-[1400px] mx-auto w-full overflow-hidden mt-6 bg-[#edf1f2]/60 backdrop-blur rounded-[28px] border border-white/40"
                id="about"
            >
                {/* 1. Background text (clearly visible matching top marquee style) */}
                <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none z-0">
                    <motion.div
                        animate={{ x: ["-50%", "0%"] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 60 }}
                        className="flex whitespace-nowrap text-[16vw] font-black text-[#1a1a1a]/[0.05] uppercase tracking-widest"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        <span>&bull;&nbsp;THE ATELIER STORY SINCE 1982 LUXURY Silhouettes DESIGN PROCESS CRAFTSMANSHIP</span>
                        <span>&bull;&nbsp;THE ATELIER STORY SINCE 1982 LUXURY Silhouettes DESIGN PROCESS CRAFTSMANSHIP</span>
                    </motion.div>
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                    {/* Left Column: Descriptive text aligned bottom */}
                    <div className="lg:col-span-3 flex flex-col justify-end h-full order-2 lg:order-1 pt-6 lg:pt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="max-w-xs space-y-3 text-left"
                        >
                            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8a8172] uppercase">Since 1982</span>
                            <p className="text-xs text-[#4a4a4a] leading-relaxed font-medium">
                                Luxury is not defined by price. It is an enduring, silent presence. perfected over four decades of silhouettes.
                            </p>
                        </motion.div>
                    </div>

                    {/* Middle Column: The 3 Clickable Sliding Images Composition */}
                    <div className="lg:col-span-6 flex items-center justify-center gap-4 sm:gap-6 order-1 lg:order-2">

                        {/* Image 1: Left Small */}
                        <Link
                            to="/products"
                            className="w-1/4 aspect-[2/3] sm:aspect-[9/14] rounded-2xl overflow-hidden bg-[#b8c4cc]/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-md block shrink-0 relative"
                        >
                            <AnimatePresence mode="popLayout">
                                <motion.img
                                    key={SLOT_L_IMAGES[cycleIdx]}
                                    variants={slideDownVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    src={SLOT_L_IMAGES[cycleIdx]}
                                    alt="Atelier workspace left"
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                            </AnimatePresence>
                        </Link>

                        {/* Image 2: Center Large */}
                        <Link
                            to="/products"
                            className="w-2/5 aspect-[3/4] sm:aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-[#b8c4cc]/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-lg block shrink-0 relative"
                        >
                            <AnimatePresence mode="popLayout">
                                <motion.img
                                    key={SLOT_M_IMAGES[cycleIdx]}
                                    variants={slideDownVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    src={SLOT_M_IMAGES[cycleIdx]}
                                    alt="Atelier details center"
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                            </AnimatePresence>
                        </Link>

                        {/* Image 3: Right Small */}
                        <Link
                            to="/products"
                            className="w-1/4 aspect-[2/3] sm:aspect-[9/14] rounded-2xl overflow-hidden bg-[#b8c4cc]/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-md block shrink-0 relative"
                        >
                            <AnimatePresence mode="popLayout">
                                <motion.img
                                    key={SLOT_R_IMAGES[cycleIdx]}
                                    variants={slideDownVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    src={SLOT_R_IMAGES[cycleIdx]}
                                    alt="Atelier product right"
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                            </AnimatePresence>
                        </Link>
                    </div>

                    {/* Right Column: Descriptive text aligned top */}
                    <div className="lg:col-span-3 flex flex-col justify-start h-full order-3">
                        <motion.div
                            initial={{ opacity: 0, y: -15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="max-w-xs space-y-3 text-left lg:text-right ml-auto"
                        >
                            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8a8172] uppercase">Process</span>
                            <p className="text-xs text-[#4a4a4a] leading-relaxed font-medium">
                                Sourced from historical family mills. Committed to ethical construction and sustainable dye methods.
                            </p>
                        </motion.div>
                    </div>

                </div>
            </motion.section>

            {/* ---------------- NEWSLETTER ---------------- */}
            <motion.section
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="py-24 bg-[#141414] text-white"
            >
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">

                    <div className="space-y-4">
                        <div className="inline-flex p-3 rounded-full bg-white/10">
                            <Mail className="w-5 h-5" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold">Join the Atelier Circle.</h2>
                        <p className="text-xs sm:text-sm text-white/50 uppercase tracking-[0.2em] max-w-md mx-auto">
                            Private access to new releases and invitations to seasonal previews.
                        </p>
                    </div>

                    {isSubscribed ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-2xl bg-white/10 max-w-md mx-auto"
                        >
                            <p className="text-sm font-semibold">Thank you for subscribing.</p>
                            <p className="text-[10px] text-white/50 mt-1">An invitation has been dispatched to your email.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="flex-1 px-4 py-3 bg-white/10 rounded-full text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 text-white transition-all"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-white hover:bg-white/90 text-[#141414] rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
                            >
                                Subscribe
                            </button>
                        </form>
                    )}

                </div>
            </motion.section>

        </div>
    );
} 