import React from "react";
import { Link } from "react-router-dom";
import { StoreName } from "@/components/ui/StoreName";
export default function PrivacyPage() {
    return (<div className="min-h-screen bg-[#fdfbf7] text-[#1c1c1c] font-sans selection:bg-[#d4af37] selection:text-white">
      {/* Header */}
      <div className="pt-32 pb-16 px-4 max-w-4xl mx-auto text-center border-b border-gray-200">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 text-[#1c1c1c]">Privacy Policy</h1>
        <div className="w-12 h-[1px] bg-[#d4af37] mx-auto mb-6"/>
        <p className="text-sm md:text-base font-medium tracking-widest uppercase text-gray-500 max-w-2xl mx-auto">
          Effective Date: January 1, 2026
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row gap-12">
        
        {/* Table of Contents (Sticky sidebar on md+) */}
        <div className="md:w-64 shrink-0">
          <div className="sticky top-32 space-y-6">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#d4af37]">Contents</h3>
            <nav className="flex flex-col space-y-3">
              <a href="#information-we-collect" className="text-sm font-medium text-gray-500 hover:text-[#1c1c1c] transition-colors">1. Information We Collect</a>
              <a href="#how-we-use" className="text-sm font-medium text-gray-500 hover:text-[#1c1c1c] transition-colors">2. How We Use Information</a>
              <a href="#data-sharing" className="text-sm font-medium text-gray-500 hover:text-[#1c1c1c] transition-colors">3. Data Sharing & Security</a>
              <a href="#your-rights" className="text-sm font-medium text-gray-500 hover:text-[#1c1c1c] transition-colors">4. Your Privacy Rights</a>
              <a href="#contact" className="text-sm font-medium text-gray-500 hover:text-[#1c1c1c] transition-colors">5. Contact Information</a>
            </nav>
          </div>
        </div>

        {/* Text Heavy Content */}
        <div className="prose prose-lg prose-gray max-w-none text-[#1c1c1c]">
          <p className="text-lg leading-relaxed text-gray-600 mb-12">
            At <StoreName />, we believe that true luxury encompasses absolute discretion. The protection of your personal data is a responsibility we take with the utmost seriousness. This concise policy outlines our data safeguarding principles.
          </p>

          <section id="information-we-collect" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-serif mb-6 pb-2 border-b border-[#d4af37]/30">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              When you interact with the <StoreName /> Atelier, we may securely collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Contact Information:</strong> Names, atelier delivery addresses, esoteric email addresses, and secure phone numbers.</li>
              <li><strong>Transaction Data:</strong> Encrypted payment gateways securely manage all bespoke tailoring purchases.</li>
              <li><strong>Preferences:</strong> Sartorial sizing metrics, fabric affinity, and interaction history to curate your experience.</li>
            </ul>
          </section>

          <section id="how-we-use" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-serif mb-6 pb-2 border-b border-[#d4af37]/30">2. How We Use Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Your details are utilized strictly to enhance the <StoreName /> experience:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Facilitating secure, white-glove delivery of purchased artifacts.</li>
              <li>Providing highly personalized consultations and exclusive drop invitations.</li>
              <li>Refining our digital boutique ecosystem to assure flawless client journeys.</li>
            </ul>
          </section>

          <section id="data-sharing" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-serif mb-6 pb-2 border-b border-[#d4af37]/30">3. Data Sharing & Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We employ military-grade encryption methodologies across our database clusters. Your personal information is considered highly confidential and is <strong>never</strong> sold, traded, or offered to third-party ad networks. We solely share data with select logistical couriers and private banking authenticators strictly necessary to complete your commission.
            </p>
          </section>

          <section id="your-rights" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-serif mb-6 pb-2 border-b border-[#d4af37]/30">4. Your Privacy Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              As a <StoreName /> patron, you retain sovereign rights over your digital footprint. You possess the unalienable right to request a comprehensive dossier of collected data, mandate instant corrections, or demand complete archival erasure (the Right to be Forgotten) at any juncture.
            </p>
          </section>

          <section id="contact" className="scroll-mt-32 mb-16">
            <h2 className="text-2xl font-serif mb-6 pb-2 border-b border-[#d4af37]/30">5. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For any discourse regarding this policy or your personal data architecture, please contact the <StoreName /> Concierge directly at:{' '}
              <Link to="/contact" className="text-[#d4af37] hover:underline font-medium">our Contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>);
}
