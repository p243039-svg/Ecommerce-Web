import React from "react";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { useSettingsStore } from "@/stores/useSettingsStore";
export default function CookiePolicyPage() {
    const settings = useSettingsStore();
    return (<LegalPageLayout title="Cookie Policy" subtitle="Tailoring Your Experience">
      <h2>Digital Craftsmanship</h2>
      <p>Like the subtle lining of a tailored blazer, cookies work behind the scenes to ensure your digital experience with {settings.storeName} is seamless, elegant, and perfectly fitted to your preferences.</p>
      
      <h2>Essential Cookies</h2>
      <p>These are necessary for the basic functionality of the Atelier. They allow you to maintain your selection in the Atelier Bag and navigate securely through the checkout process.</p>

      <h2>Personalization Cookies</h2>
      <p>These cookies remember your preferences—such as your preferred category (Men, Women, or Shoes)—so that every time you return, the boutique feels uniquely yours.</p>

      <h2>Analytical Insight</h2>
      <p>We utilize anonymous analytical cookies to understand how our visitors interact with our collections. This insight allow us to refine our interface and improve the fluidity of the browsing experience.</p>

      <h2>Managing Your Preferences</h2>
      <p>You may choose to restrict or disable cookies through your browser settings. However, please be aware that this may impact the refinement and personalization of your journey within our boutique.</p>
    </LegalPageLayout>);
}
