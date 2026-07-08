import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
const SLIDES = [
    {
        image: "/images/hero/hero-1.jpg",
        title: "CRAFTED FOR",
        highlight: "ELEGANCE",
        sub: "A curated pilgrimage through high-end fashion. Discover pieces where architectural precision meets timeless comfort.",
        button: "EXPLORE SHOP",
        link: "/products"
    },
    {
        image: "/images/hero/hero-2.png",
        title: "MODERN",
        highlight: "PRECISION",
        sub: "Sharp silhuettes and tailored perfection. Elevate your wardrobe with our latest couture collection.",
        button: "NEW ARRIVALS",
        link: "/products?category=men"
    },
    {
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
        title: "TIMELESS",
        highlight: "CLASSICS",
        sub: "Essential pieces that transcend seasons. Handcrafted details for the discerning minimalist.",
        button: "DISCOVER",
        link: "/products?category=women"
    }
];
export function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const next = useCallback(() => {
        if (isTransitioning)
            return;
        setIsTransitioning(true);
        setCurrent((prev) => (prev + 1) % SLIDES.length);
        setTimeout(() => setIsTransitioning(false), 800);
    }, [isTransitioning]);
    const prev = useCallback(() => {
        if (isTransitioning)
            return;
        setIsTransitioning(true);
        setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
        setTimeout(() => setIsTransitioning(false), 800);
    }, [isTransitioning]);
    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);
    return (<section className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-background">
      {/* Slides */}
      {SLIDES.map((slide, idx) => (<div key={idx} className={cn("absolute inset-0 transition-all duration-1000 ease-in-out transform", idx === current ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0")}>
          <img src={slide.image} alt={slide.title} className="object-cover absolute inset-0 w-full h-full object-cover" />
          {/* Overlay Gradient for readability on bright theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent z-10"/>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10"/>
          
          {/* Content */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className={cn("max-w-3xl transition-all duration-1000 delay-300 transform", idx === current ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0")}>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-background/60 backdrop-blur-md border border-border/50 rounded-full text-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary"/>
                Edition No. 01 — Spring 2025
              </div>
              
              <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-8 text-foreground uppercase drop-shadow-sm">
                {slide.title}<br />
                FOR <span className="bg-gradient-to-tr from-primary-hover via-gold to-primary bg-clip-text text-transparent italic">{slide.highlight}</span>
              </h1>
              
              <p className="text-xl text-foreground/80 mb-12 max-w-xl leading-relaxed font-medium capitalize">
                {slide.sub}
              </p>
              
              <Link to={slide.link}>
                <Button size="lg" className="group rounded-full px-12 h-14 text-base font-bold">
                  {slide.button}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform"/>
                </Button>
              </Link>
            </div>
          </div>
        </div>))}

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-12 z-30 flex items-center gap-4">
        <button onClick={prev} className="w-14 h-14 rounded-full border border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all text-foreground active:scale-95 shadow-sm" aria-label="Previous slide">
          <ChevronLeft className="w-6 h-6"/>
        </button>
        
        {/* Progress Bits */}
        <div className="flex gap-2 mx-4">
          {SLIDES.map((_, i) => (<div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i === current ? "w-8 bg-primary" : "w-1.5 bg-border")}/>))}
        </div>

        <button onClick={next} className="w-14 h-14 rounded-full border border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all text-foreground active:scale-95 shadow-sm" aria-label="Next slide">
          <ChevronRight className="w-6 h-6"/>
        </button>
      </div>

      {/* Slide Counter (Floating Vertical) */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-10">
        <div className="h-64 w-[1px] bg-border relative">
          <div className="absolute top-0 left-0 w-full bg-primary transition-all duration-1000" style={{ height: `${((current + 1) / SLIDES.length) * 100}%` }}/>
        </div>
        <span className="text-xs font-black text-muted-foreground/80 tracking-widest uppercase rotate-90 origin-center whitespace-nowrap">
          0{current + 1} / 0{SLIDES.length}
        </span>
      </div>
    </section>);
}
