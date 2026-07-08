import React from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, Trash2, Sparkles, Plus } from "lucide-react";
import { useFavoriteStore } from "@/stores/useFavoriteStore";
import { ProductCard } from "@/components/products/ProductCard";
export default function WishlistPage() {
    const { favorites, clearFavorites } = useFavoriteStore();
    return (<div className="min-h-screen bg-[#f4ebe0] relative overflow-hidden font-sans selection:bg-amber-100 selection:text-amber-900 pb-32">
      {/* Subtle Texture Layer */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }}/>
      
      {/* Soft Ambient Shadow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-100/30 rounded-full blur-[150px] pointer-events-none -mr-96 -mt-96"/>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-50/40 rounded-full blur-[120px] pointer-events-none -ml-48 -mb-48"/>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
           <div className="space-y-6 text-left">
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-amber-400"/>
                <span className="text-[10px] font-black text-amber-800/60 uppercase tracking-[0.6em] animate-fade-in">Private Collection</span>
              </div>
              <h1 className="text-6xl sm:text-8xl font-serif text-[#4a3f35] italic tracking-tighter animate-slide-up leading-[0.9]">
                The Gallery<span className="text-amber-600/40 not-italic">.</span>
              </h1>
              <p className="text-[11px] font-black text-[#8c7e6c] uppercase tracking-[0.3em] max-w-sm leading-relaxed opacity-60">
                A personal archive of your most coveted acquisitions and future centerpieces.
              </p>
           </div>
           
           {favorites.length > 0 && (<div className="flex items-center gap-8 animate-fade-in">
               <div className="hidden sm:block text-right">
                 <p className="text-[10px] font-black text-[#bfb3a0] uppercase tracking-widest mb-1">Stored Items</p>
                 <p className="text-2xl font-serif italic text-amber-900">{favorites.length}</p>
               </div>
               <button onClick={clearFavorites} className="group flex items-center gap-3 bg-[#fffdfa] border border-[#e2d6c5] px-6 py-4 rounded-2xl text-[10px] font-black text-[#8c7e6c] uppercase tracking-widest hover:border-red-200 hover:text-red-700 transition-all shadow-sm active:scale-95">
                 <Trash2 className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity"/>
                 Empty Gallery
               </button>
             </div>)}
        </div>

        {favorites.length === 0 ? (
        /* --- Masterpiece Empty State --- */
        <div className="relative group">
            <div className="absolute inset-0 bg-white/40 rounded-[64px] border border-white/50 backdrop-blur-sm -m-4 sm:-m-8 pointer-events-none"/>
            <div className="relative bg-[#fffdfa] rounded-[48px] border border-[#e2d6c5] p-12 sm:p-24 md:p-32 text-center shadow-[0_30px_100px_-20px_rgba(74,63,53,0.05)] overflow-hidden">
               {/* Decorative Flourish */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-amber-100 to-transparent"/>
               
               <div className="space-y-12 relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-100 rounded-full blur-[40px] opacity-20 animate-pulse"/>
                    <div className="w-32 h-32 rounded-full border border-amber-100 flex items-center justify-center bg-white shadow-inner relative">
                       <Heart className="w-12 h-12 text-amber-900/10 fill-amber-50 stroke-[1px] animate-bounce-slow"/>
                       <Plus className="absolute bottom-6 right-6 w-5 h-5 text-amber-500 animate-spin-slow"/>
                    </div>
                  </div>

                  <div className="space-y-4 max-w-md mx-auto">
                     <h2 className="text-3xl md:text-4xl font-serif text-[#4a3f35] italic">The rooms are quiet<span className="text-amber-800">.</span></h2>
                     <p className="text-[12px] text-[#8c7e6c] font-black uppercase tracking-[0.2em] leading-relaxed">
                       Your personal repository is currently awaiting its first curated selection. 
                       Breathe life into your collection today.
                     </p>
                  </div>

                  <Link to="/products" className="group">
                     <button className="h-16 px-12 bg-[#4a3f35] text-[#f4ebe0] font-black text-[12px] uppercase tracking-[0.4em] rounded-2xl shadow-xl hover:bg-amber-900 hover:scale-105 transition-all flex items-center gap-4 active:scale-95">
                        <Sparkles className="w-4 h-4 text-amber-400"/>
                        Explore Boutique
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform"/>
                     </button>
                  </Link>
               </div>

               {/* Grid Background Decoration */}
               <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-100 to-transparent"/>
            </div>
          </div>) : (
        /* --- Gallery Grid --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 animate-fade-in-up">
            {favorites.map((product, idx) => (<div key={product.id} className="group relative" style={{ animationDelay: `${idx * 100}ms` }}>
                {/* Decorative Frame Hover */}
                <div className="absolute -inset-4 bg-white/20 rounded-[32px] border border-white/40 opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 blur-sm pointer-events-none"/>
                <ProductCard product={product}/>
              </div>))}
          </div>)}

        {/* Footer Accent */}
        <div className="mt-32 pt-16 border-t border-[#e2d6c5]/30 text-center flex flex-col items-center">
           <div className="w-px h-16 bg-gradient-to-b from-amber-200 to-transparent mb-8"/>
           <p className="text-[9px] font-black text-[#bfb3a0] uppercase tracking-[0.6em]">Premium Curated Experience</p>
        </div>

      </div>
    </div>);
}
