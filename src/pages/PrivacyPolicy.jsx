import React from "react";
import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { useSettingsStore } from "@/stores/useSettingsStore";
export default function PrivacyPolicyPage() {
    const settings = useSettingsStore();
    return (<LegalPageLayout title="Privacy Policy" subtitle="Confidence in Discretion">
      <h2>Respecting Your Confidentiality</h2>
      <p>At {settings.storeName}, your privacy is as paramount as the quality of our garments. We are committed to protecting the personal data of our discerning clientele with the highest standards of security and transparency.</p>
      
      <h2>Collection of Data</h2>
      <p>We receive and collect information including, but not limited to:</p>
      <ul>
        <li>Contact details (Name, Private Address, Telephone) for bespoke delivery.</li>
        <li>Financial details for secure processing of your acquisitions.</li>
        <li>Browsing preferences to tailor your personal atelier experience.</li>
      </ul>

      <h2>The Purpose of Curation</h2>
      <p>Your data is utilized solely to enhance your relationship with the brand. This includes personalized styling recommendations, order tracking, and exclusive invitations to seasonal collection previews.</p>

      <h2>Discreet Sharing</h2>
      <p>{settings.storeName} does not, and will never, trade or sell your personal details to third-party entities. Information is shared only with trusted logistics partners to ensure the safe arrival of your orders.</p>

      <h2>Your Ultimate Control</h2>
      <p>As a member of the {settings.storeName} community, you hold the absolute right to access, rectify, or request the deletion of your personal data at any moment via our Concierge portal.</p>
    </LegalPageLayout>);
}
