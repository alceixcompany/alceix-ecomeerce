import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AboutHero } from "../components/about-hero";
import { AboutStats } from "../components/about-stats";
import { AboutMission } from "../components/about-mission";
import { AboutValues } from "../components/about-values";
import { AboutTeam } from "../components/about-team";
import { AboutAwards } from "../components/about-awards";
import { AboutTestimonials } from "../components/about-testimonials";
import { AboutTimeline } from "../components/about-timeline";
import { AboutContact } from "../components/about-contact";

export function AboutScreen() {
 return <div className="marketing-home about-page bg-surface-container-lowest text-on-surface font-body-md text-body-md antialiased min-h-screen">
 <SiteHeader />
 <main className="pt-20">
 <AboutHero />
 <AboutStats />
 <AboutMission />
 <AboutValues />
 <AboutTeam />
 <AboutAwards />
 <AboutTestimonials />
 <AboutTimeline />
 <AboutContact />
 </main>
 <SiteFooter />
 </div>;
}
