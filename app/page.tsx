// Landing Page – Lovers
// Server Component (App Router)

import FAQ from "@/components/sections/faq";
import Header from "@/components/header";
import HeroSection from "@/components/sections/hero";
import HowSection from "@/components/sections/how";
import PricesSection from "@/components/sections/prices";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-gray-900 overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Hero */}
      <HeroSection />

      {/* How it works */}
      <HowSection />

      {/* Plans */}
      <PricesSection />

      {/* FAQ */}
      <FAQ />

    </main>
  );
}
