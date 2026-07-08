import React from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/stores/useSettingsStore";
export default function ContactPage() {
    const settings = useSettingsStore();
    return (<div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container px-4">
        
        {/* Header */}
        <div className="max-w-3xl mb-20 animate-fade-in">
           <span className="text-[10px] font-black text-amber-600 tracking-[0.5em] uppercase">Bespeak Assistance</span>
           <h1 className="text-5xl sm:text-7xl font-serif text-gray-900 tracking-tighter mt-4 mb-8">Nous contacter.</h1>
           <p className="text-lg text-gray-500 font-light leading-relaxed">
             Whether you require styling advice or need assistance with an existing order, the {settings.storeName} Concierge is here to provide an uncompromising service experience.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Contact Information */}
          <div className="space-y-12 animate-slide-in-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-amber-600"/>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Telephone</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">+92 300 1234567<br />Mon-Sat, 9am - 9pm PKT</p>
               </div>
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-amber-600"/>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Email</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{settings.contactEmail}<br />{settings.supportPhone}</p>
               </div>
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-amber-600"/>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">The Atelier</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Suite 402, Heritage Plaza<br />Karachi, Pakistan</p>
               </div>
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600"/>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Style Consultations</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">By appointment only.<br />Book via concierge portal.</p>
               </div>
            </div>

            <div className="p-10 bg-[#fafafa] border border-gray-100 space-y-4">
               <MessageSquare className="w-6 h-6 text-amber-600 mb-2"/>
               <h4 className="text-xl font-serif text-gray-900 italic">"Luxury is personal."</h4>
               <p className="text-gray-400 text-xs leading-relaxed uppercase tracking-widest">
                 We aim to respond to all inquiries within 12 hours.
               </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 sm:p-12 shadow-2xl border border-gray-50 animate-slide-in-right">
             <form className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <input type="text" className="w-full px-6 py-4 bg-gray-50 border-none outline-none text-sm focus:ring-1 focus:ring-amber-600 transition-all" placeholder="Enter your name"/>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <input type="email" className="w-full px-6 py-4 bg-gray-50 border-none outline-none text-sm focus:ring-1 focus:ring-amber-600 transition-all" placeholder="Enter your email"/>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Subject</label>
                   <select className="w-full px-6 py-4 bg-gray-50 border-none outline-none text-sm focus:ring-1 focus:ring-amber-600 transition-all appearance-none">
                      <option>Order Inquiry</option>
                      <option>Personal Styling</option>
                      <option>Returns & Exchanges</option>
                      <option>Other Assistance</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Message</label>
                   <textarea rows={6} className="w-full px-6 py-4 bg-gray-50 border-none outline-none text-sm focus:ring-1 focus:ring-amber-600 transition-all resize-none" placeholder="How may we assist you?"></textarea>
                </div>
                <Button className="w-full py-8 rounded-none bg-black hover:bg-zinc-800 text-[11px] font-black tracking-[.3em] uppercase flex items-center justify-center gap-4 transition-all">
                   Send Inquiry
                   <Send className="w-4 h-4"/>
                </Button>
             </form>
          </div>

        </div>
      </div>
    </div>);
}
