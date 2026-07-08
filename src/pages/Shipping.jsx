import React from "react";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { useSettingsStore } from "@/stores/useSettingsStore";
export default function ShippingPage() {
    const settings = useSettingsStore();
    return (<LegalPageLayout title="Shipping & Delivery" subtitle="Safe Passage">
      <h2>The Concierge Delivery</h2>
      <p>Every {settings.storeName} acquisition is treated with the utmost reverence. Our logistics team ensures that your pieces are handled with care and delivered in our signature archival packaging.</p>
      
      <h2>Transit Timelines</h2>
      <ul>
        <li><strong>Domestic (Pakistan):</strong> 2—4 Business Days.</li>
        <li><strong>International Express:</strong> 5—8 Business Days.</li>
        <li><strong>Bespoke Items:</strong> Please allow 14 days for hand-crafting before dispatch.</li>
      </ul>

      <h2>Bespoke Packaging</h2>
      <p>Your items will arrive in our heavy-weight, ivory textured boxes, wrapped in acid-free silk paper. For outerwear and suits, a complimentary cedar wood hanger and breathable garment bag are included.</p>

      <h2>Complimentary Shipping</h2>
      <p>{settings.storeName} is pleased to offer complimentary express shipping on all orders exceeding ${settings.freeShippingThreshold}. For orders below this threshold, a flat delivery fee will be applied at checkout.</p>

      <h2>Tracking Your Acquisition</h2>
      <p>Once your order has been dispatched from the Atelier, you will receive a unique tracking link via email to monitor its journey in real-time.</p>

      <h2>Returns & Exchanges</h2>
      <p>If your piece is not a perfect fit, we offer a 14-day return period. The item must be in its original, unworn condition with all security tags intact.</p>
    </LegalPageLayout>);
}
