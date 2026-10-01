import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "../components/hero-section";
import { ShowcaseSection } from "../components/showcase-section";
import { AdvantagesSection } from "../components/advantages-section";
import { RevenueSimulator } from "../components/revenue-simulator";
import { InfluencerSection } from "../components/influencer-section";
import { PlatformSection } from "../components/platform-section";
import { PartnersSection } from "../components/partners-section";
import { GettingStartedSection } from "../components/getting-started-section";
import { TestimonialsSection } from "../components/testimonials-section";
import { SupplierSection } from "../components/supplier-section";
import { FaqSection } from "../components/faq-section";
import { RegisterSection } from "../components/register-section";
import { SiteFooter } from "@/components/layout/site-footer";

export function MarketingHomeScreen() {
  return (
    <div className="marketing-home bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col">
      <SiteHeader />
      <main className="w-full pt-20 flex-1">
        <HeroSection />
        <ShowcaseSection />
        <AdvantagesSection />
        <RevenueSimulator />
        <InfluencerSection />
        <PlatformSection />
        <PartnersSection />
        <GettingStartedSection />
        <TestimonialsSection />
        <SupplierSection />
        <FaqSection />
        <RegisterSection />
      </main>
      <SiteFooter />
    </div>
  );
}
