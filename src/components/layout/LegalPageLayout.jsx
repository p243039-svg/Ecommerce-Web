import React from "react";
export function LegalPageLayout({ title, subtitle, children }) {
    return (<div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container max-w-4xl px-4">
        
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
           <span className="text-[10px] font-black text-amber-600 tracking-[0.5em] uppercase mb-4 block">{subtitle}</span>
           <h1 className="text-5xl sm:text-7xl font-serif text-gray-900 tracking-tighter italic">{title}.</h1>
           <div className="w-16 h-[1px] bg-amber-600/30 mx-auto mt-12"/>
        </div>

        {/* Content */}
        <div className="prose prose-sm sm:prose-base max-w-none text-gray-600 leading-relaxed font-light animate-fade-in-up">
           <style jsx global>{`
             .legal-content h2 {
               font-family: serif;
               font-size: 1.5rem;
               color: #111;
               margin-top: 3rem;
               margin-bottom: 1.5rem;
               letter-spacing: -0.02em;
             }
             .legal-content p {
               margin-bottom: 1.25rem;
             }
             .legal-content ul {
               list-style-type: none;
               padding-left: 0;
               margin-bottom: 2rem;
             }
             .legal-content li {
               margin-bottom: 0.75rem;
               padding-left: 1.5rem;
               position: relative;
             }
             .legal-content li::before {
               content: "—";
               position: absolute;
               left: 0;
               color: #d97706; /* amber-600 */
             }
           `}</style>
           <div className="legal-content">
             {children}
           </div>
        </div>

      </div>
    </div>);
}
