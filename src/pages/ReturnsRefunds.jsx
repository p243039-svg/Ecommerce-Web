import React from "react";

export default function ReturnsRefunds() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4ebe0] text-[#4a3f35] px-6 py-20">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-serif font-black tracking-[0.15em] uppercase">Return &amp; Refund Policy</h1>
        <p className="text-base leading-relaxed text-[#7a6a5a]">
          We accept returns within 30 days of delivery for items in original condition with tags attached.
          Refunds are processed within 5–10 business days to your original payment method.
        </p>
      </div>
    </div>
  );
}
