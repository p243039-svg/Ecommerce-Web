import React from "react";
import { Link } from "react-router-dom";

import { ArrowRight, Sparkles, ShieldCheck, Globe } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { StoreName } from "@/components/ui/StoreName";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = React.useState([]);
    React.useEffect(() => {
        async function loadFeatured() {
            const { data } = await supabase
                .from("products")
                .select("*, images:product_images(*)")
                .eq("is_featured", true)
                .limit(8);
            setFeaturedProducts(data || []);
        }
        loadFeatured();
    }, []);
    return (<div className="flex flex-col overflow-x-hidden bg-white">
      
      {/* 👑 --- HERO --- 👑 */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-10 bg-black/5"/>
        
        {/* Uncropped Hero Image */}
        <div className="absolute inset-0 animate-scale-in">
           <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=90" alt="Luxury Boutique"   className="object-cover object-center absolute inset-0 w-full h-full object-cover" sizes="100vw"/>
        </div>

        <div className="container relative z-20 text-center px-4">
          <div className="space-y-6 sm:space-y-10 animate-fade-in-up">
            <h1 className="text-[70px] sm:text-[160px] font-serif font-black text-white tracking-widest uppercase leading-[0.8] drop-shadow-2xl">
              <StoreName />
            </h1>
            
            <p className="text-[10px] sm:text-[18px] text-white font-bold tracking-[0.4em] uppercase max-w-2xl mx-auto drop-shadow-lg opacity-90">
              The Standard of Uncompromising Luxury.
            </p>

            <Link to="/products">
              <button className="group bg-white text-black hover:bg-gray-100 px-10 sm:px-16 py-5 text-[11px] sm:text-[13px] font-black tracking-[0.3em] uppercase flex items-center justify-center gap-4 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] mx-auto animate-bounce-subtle">
                EXPLORE COLLECTION
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform"/>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 🧭 --- CATEGORIES --- 🧭 */}
      <section className="py-24 sm:py-32 bg-[#fafafa]">
        <div className="container px-4">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-16 gap-4">
             <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-600 tracking-[0.5em] uppercase">Selection</span>
                <h2 className="text-4xl sm:text-6xl font-serif text-gray-900 italic">select your path.</h2>
             </div>
             <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase italic border-b border-amber-600/30">Atelier Curation 001</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
            {[
            { id: 'men', name: 'MEN', img: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1000' },
            { id: 'women', name: 'WOMEN', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000' },
            { id: 'shoes', name: 'SHOES', img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1000' },
        ].map((cat) => (<Link key={cat.id} to={`/products?category=${cat.id}`} className="group relative h-[450px] sm:aspect-[4/5] overflow-hidden shadow-2xl transition-all hover:-translate-y-2 rounded-[2rem] bg-gray-200">
                <img src={cat.img} alt={cat.name}  className="object-cover transition-transform duration-[3000ms] group-hover:scale-110 absolute inset-0 w-full h-full object-cover" sizes="(max-width: 768px) 100vw, 33vw"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"/>
                <div className="absolute inset-0 flex items-end p-8 sm:p-12">
                   <h3 className="text-3xl sm:text-5xl font-serif text-white tracking-widest uppercase italic transform group-hover:translate-x-4 transition-transform duration-700">
                      {cat.name}
                   </h3>
                </div>
              </Link>))}
          </div>
        </div>
      </section>

      {/* 🍱 --- ESSENTIALS --- 🍱 */}
      <section className="py-24 sm:py-40 bg-white">
        <div className="container">
          <div className="text-center mb-24 space-y-4">
            <div className="inline-flex items-center gap-4 text-amber-600 animate-pulse">
               <div className="h-[1px] w-8 bg-current"/>
               <Sparkles className="w-4 h-4"/>
               <div className="h-[1px] w-8 bg-current"/>
            </div>
            <h2 className="text-5xl sm:text-8xl font-serif text-gray-900 tracking-tighter italic"><StoreName /> Essentials.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-14 px-4 sm:px-0">
            {featuredProducts.map((product, idx) => (<div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                <ProductCard product={product}/>
              </div>))}
          </div>
        </div>
      </section>

      {/* 📜 --- THE ATELIER --- 📜 */}
      <section className="py-24 sm:py-56 bg-white" id="about">
         <div className="container px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="relative aspect-square sm:aspect-[4/5] bg-gray-100 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.15)] rounded-[3rem] animate-slide-in-left">
               <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000" alt="The Atelier"  className="object-cover absolute inset-0 w-full h-full object-cover" sizes="(max-width: 1024px) 100vw, 50vw"/>
            </div>
            <div className="space-y-10 animate-slide-in-right">
               <div className="space-y-4">
                  <span className="text-[10px] font-black text-amber-600 tracking-[0.5em] uppercase">Since 1982</span>
                  <h2 className="text-5xl sm:text-8xl font-serif text-gray-900 leading-[1] tracking-tighter">The <StoreName /> <br /> Atelier.</h2>
               </div>
               <p className="text-gray-500 text-lg sm:text-2xl font-light leading-relaxed italic">
                 "Luxury is not a price. It is a presence."
               </p>
               <p className="text-gray-400 text-sm sm:text-lg font-light leading-relaxed">
                  Founded on the principal of uncompromising luxury, our team has spent decades perfecting the art of the silhouette. Our atelier in the heart of the city remains the soul of every collection we release.
               </p>
               <div className="grid grid-cols-2 gap-8 sm:gap-12">
                  <div className="space-y-2">
                     <ShieldCheck className="w-8 h-8 text-amber-600"/>
                     <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Master Craft</h4>
                     <p className="text-gray-400 text-xs leading-relaxed">Every stitch verified by heritage artisans.</p>
                  </div>
                  <div className="space-y-2">
                     <Globe className="w-8 h-8 text-amber-600"/>
                     <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Global Reach</h4>
                     <p className="text-gray-400 text-xs leading-relaxed">Atelier experiences available in 40 cities.</p>
                  </div>
               </div>
               <Link to="/products">
                 <Button variant="outline" className="rounded-none border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-12 py-8 text-[11px] font-black tracking-widest uppercase transition-all w-full sm:w-auto">
                    Explore Collection
                 </Button>
               </Link>
            </div>
         </div>
      </section>
    </div>);
}
