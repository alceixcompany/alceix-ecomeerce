import "../influencer.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { InfluencerBreadcrumb } from "../components/influencer-breadcrumb";
import { InfluencerHero } from "../components/influencer-hero";
import { InfluencerBenefits } from "../components/influencer-benefits";
import { InfluencerProcess } from "../components/influencer-process";
import { InfluencerCreators } from "../components/influencer-creators";
import { InfluencerPartners } from "../components/influencer-partners";
import { InfluencerFaq } from "../components/influencer-faq";
import { InfluencerCta } from "../components/influencer-cta";

export function InfluencerScreen() {
return <div className="marketing-home influencer-page bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen"><SiteHeader /><main className="pt-20">
<InfluencerBreadcrumb />
<InfluencerHero />
<InfluencerBenefits />
<InfluencerProcess />
<InfluencerCreators />
<InfluencerPartners />
<InfluencerFaq />
<InfluencerCta />
</main><SiteFooter /></div>;
}
