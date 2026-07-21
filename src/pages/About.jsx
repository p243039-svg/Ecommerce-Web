import React from "react";

export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4ebe0] text-[#4a3f35] px-6 py-20">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-serif font-black tracking-[0.15em] uppercase">About Us</h1>
        <p className="text-base leading-relaxed text-[#7a6a5a]">
          ANTIQUE is a premium fashion house dedicated to crafting timeless designs for the modern individual.
          Our curated collections blend elegance with contemporary style, ensuring every piece tells a story.
        </p>
      </div>
    </div>
  );
}
