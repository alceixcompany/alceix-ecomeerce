import { PartnerLogos } from "@/components/layout/partner-logos";
import { CustomerReviews } from "@/components/marketing/customer-reviews";

export function AboutTestimonials() {
  return <section id="referanslar"><div className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-8"><div className="rounded-3xl bg-surface-container-low/50 border border-surface-container-high p-4 sm:p-6"><PartnerLogos showHeading /></div></div><CustomerReviews /></section>;
}
